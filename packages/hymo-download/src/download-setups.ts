import {Browser, BrowserContext, Page} from "playwright-core";
import {Config} from "./config";
import {LoginPage, IRacingSetupsPage} from "./page-objects";
import * as path from "path";

export interface DownloadProgress {
  type: "info" | "success" | "error" | "warning";
  message: string;
  timestamp: Date;
}

export interface DownloadCompletionInfo {
  unmappedCars: string[];
  unmappedTracks: string[];
}

// Helper function to check if operation was cancelled
const checkCancellation = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new Error("Download cancelled");
  }
};

// Helper function to safely execute Playwright operations
const safePlaywrightOperation = async <T>(
  operation: () => Promise<T>,
  signal?: AbortSignal
): Promise<T> => {
  try {
    checkCancellation(signal);
    return await operation();
  } catch (error) {
    // If cancelled, throw cancellation error instead of Playwright error
    if (signal?.aborted) {
      throw new Error("Download cancelled");
    }
    throw error;
  }
};

export const downloadSetups = async (
  browser: Browser,
  context: BrowserContext,
  page: Page,
  config: Config,
  onProgress?: (progress: DownloadProgress) => void,
  onCompleted?: (completionInfo: DownloadCompletionInfo) => void,
  signal?: AbortSignal
) => {
  // Ensure selectedTeams is always an array of strings
  if (!Array.isArray(config.selectedTeams)) {
    console.log('⚠️ selectedTeams is not an array, defaulting to empty array');
    config.selectedTeams = [];
  } else {
    // Filter out any non-string values (teams should be strings from Electron app)
    const originalLength = config.selectedTeams.length;
    config.selectedTeams = config.selectedTeams.filter(team => typeof team === 'string');
    if (config.selectedTeams.length !== originalLength) {
      console.log(`⚠️ Filtered out ${originalLength - config.selectedTeams.length} non-string team entries`);
    }
  }
  
  // Track unmapped items
  const unmappedCars = new Set<string>();
  const unmappedTracks = new Set<string>();
  
  // Check for cancellation before starting
  checkCancellation(signal);

  await safePlaywrightOperation(() => page.goto("https://app.tracktitan.io/login"), signal);

  // Check for cancellation after page load
  checkCancellation(signal);

  onProgress?.({
    type: "info",
    message: "Starting TrackTitan download process...",
    timestamp: new Date(),
  });

  // Add a small delay to make cancellation testing easier
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check for cancellation after delay
  checkCancellation(signal);

  console.log("BEGIN Login");
  onProgress?.({
    type: "info",
    message: "Logging into TrackTitan...",
    timestamp: new Date(),
  });

  const iRacingSetupsPage = await safePlaywrightOperation(async () => {
    const loginPage = new LoginPage(page);
    return await loginPage.login(config.login, config.password);
  }, signal);

  onProgress?.({
    type: "success",
    message: "Successfully logged into TrackTitan and navigated to iRacing setups page",
    timestamp: new Date(),
  });

  // Check for cancellation after login and navigation
  checkCancellation(signal);

  // TODO: Implement setup search and download using the iRacing setups page
  const seriesLabel = config.series || 'All series';
  const seasonLabel = config.season ? `Season ${config.season}` : 'All Seasons';
  const weekLabel = config.week ? `Week ${config.week}` : 'All Weeks';
  const yearLabel = config.year || 'All Years';
  const teamsMessage = config.selectedTeams.length > 0 ? ` (Save to teams: ${config.selectedTeams.join(', ')})` : '';
  onProgress?.({
    type: "info",
    message: `Ready to search for setups: ${seriesLabel} - ${seasonLabel}, ${weekLabel}, ${yearLabel}${teamsMessage}`,
    timestamp: new Date(),
  });

  // Use iRacingSetupsPage to search and download setups
  await safePlaywrightOperation(async () => {
    const searchResults = await iRacingSetupsPage.searchSetups(config.series, config.season, config.week, config.year);
    
    console.log(`Found ${searchResults.totalCards} setup cards to process`);
    
    // Process all available setup cards
    const cardsToProcess = searchResults.totalCards;
    
    const CONCURRENT_DOWNLOADS = 3;
    console.log(`Processing ${cardsToProcess} setup cards (${CONCURRENT_DOWNLOADS} concurrent)`);

    onProgress?.({
      type: "info",
      message: `Starting download of ${cardsToProcess} setups (${CONCURRENT_DOWNLOADS} at a time)`,
      timestamp: new Date(),
    });

    // Track unmapped tracks for reporting (use the one declared at function level)
    // Hymo doesn't need car mapping, only track mapping

    const activeDownloads: Promise<void>[] = [];

    for (let cardIndex = 0; cardIndex < cardsToProcess; cardIndex++) {
      checkCancellation(signal);

      // Get card title lazily
      let carName = `Setup ${cardIndex + 1}`;
      try {
        const card = searchResults.setupCardList.getSetupCard(cardIndex);
        const details = await card.getDetails();
        carName = details.title || carName;
      } catch {
        // Use fallback name if card details can't be read
      }

      onProgress?.({
        type: "info",
        message: `Opening ${carName} (${cardIndex + 1}/${cardsToProcess})`,
        timestamp: new Date(),
      });

      // Open tab sequentially — must be serialized to pair click with correct tab
      let newPage: Page;
      try {
        newPage = await iRacingSetupsPage.openSetupCardTab(cardIndex);
      } catch (error) {
        onProgress?.({
          type: "error",
          message: `Failed to open ${carName} (${cardIndex + 1}/${cardsToProcess}): ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date(),
        });
        continue;
      }

      // Launch download processing in parallel
      const taskCarName = carName;
      const taskCardIndex = cardIndex;
      const taskPage = newPage;

      const downloadTask = (async () => {
        try {
          const downloadResult = await IRacingSetupsPage.downloadFromTab(
            taskPage, config.downloadPath, config.selectedTeams, config
          );

          console.log(`Setup ${taskCardIndex + 1} downloaded to: ${downloadResult}`);

          // Extract car and track information from the download result for mapping tracking
          if (downloadResult) {
            const resultPaths = downloadResult.split(', ');
            for (const resultPath of resultPaths) {
              const pathParts = resultPath.split(path.sep);
              for (let i = 0; i < pathParts.length - 2; i++) {
                if (pathParts[i + 1] && pathParts[i + 2] === 'hymo') {
                  const mappedTrackName = pathParts[i + 1];
                  const resultCarName = pathParts[i - 2];

                  let originalTrackName = mappedTrackName;
                  let isMapped = false;

                  if (config.mappings?.trackHymoToIracing) {
                    for (const [original, mapped] of Object.entries(config.mappings.trackHymoToIracing)) {
                      if (mapped === mappedTrackName) {
                        originalTrackName = original;
                        isMapped = true;
                        break;
                      }
                    }
                  }

                  if (!isMapped) {
                    unmappedTracks.add(originalTrackName);
                    console.log(`Found unmapped track: ${originalTrackName} (car: ${resultCarName})`);
                  } else {
                    console.log(`Found mapped track: ${originalTrackName} -> ${mappedTrackName} (car: ${resultCarName})`);
                  }
                  break;
                }
              }
            }
          }

          onProgress?.({
            type: "success",
            message: `Successfully downloaded ${taskCarName} (${taskCardIndex + 1}/${cardsToProcess})`,
            timestamp: new Date(),
          });
        } catch (error) {
          console.log(`Error processing setup card ${taskCardIndex + 1}:`, error);

          onProgress?.({
            type: "error",
            message: `Failed to download ${taskCarName} (${taskCardIndex + 1}/${cardsToProcess}): ${error instanceof Error ? error.message : String(error)}`,
            timestamp: new Date(),
          });

          // Ensure tab is closed on error
          await taskPage.close().catch(() => {});
        }
      })();

      activeDownloads.push(downloadTask);
      // Clean up completed tasks to keep the array from growing
      downloadTask.then(() => {
        const idx = activeDownloads.indexOf(downloadTask);
        if (idx >= 0) activeDownloads.splice(idx, 1);
      });

      // Wait for a slot if at concurrency limit
      if (activeDownloads.length >= CONCURRENT_DOWNLOADS) {
        await Promise.race(activeDownloads);
      }

      // Small delay between tab opens to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Wait for remaining downloads to finish
    await Promise.all(activeDownloads);

    console.log(`Completed processing ${searchResults.totalCards} setup cards`);
  }, signal);

  // Only show completion message if not cancelled
  if (!signal?.aborted) {
    // Add a small delay to ensure cancellation is processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Final cancellation check
    if (!signal?.aborted) {
      // Call onCompleted with mapping info - report only tracks that were processed (Hymo doesn't need car mapping)
      onCompleted?.({
        unmappedCars: [], // Hymo doesn't need car mapping
        unmappedTracks: Array.from(unmappedTracks),
      });
      
      console.log(`Unmapped tracks: [${Array.from(unmappedTracks).join(', ')}]`);

      onProgress?.({
        type: "success",
        message: "Download process completed!",
        timestamp: new Date(),
      });
    }
  }
};
