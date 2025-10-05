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
  const teamsMessage = config.selectedTeams.length > 0 ? ` (Save to teams: ${config.selectedTeams.join(', ')})` : '';
  onProgress?.({
    type: "info",
    message: `Ready to search for setups: ${config.series} - Season ${config.season}, Week ${config.week}, Year ${config.year}${teamsMessage}`,
    timestamp: new Date(),
  });

  // Use iRacingSetupsPage to search and download setups
  await safePlaywrightOperation(async () => {
    const searchResults = await iRacingSetupsPage.searchSetups(config.series, config.season, config.week, config.year);
    
    console.log(`Found ${searchResults.totalCards} setup cards to process`);
    
    // Process all available setup cards
    const cardsToProcess = searchResults.totalCards;
    
    // Process setup cards sequentially (simple and reliable)
    console.log(`Processing ${cardsToProcess} setup cards sequentially`);
    
    onProgress?.({
      type: "info",
      message: `Starting download of ${cardsToProcess} setups`,
      timestamp: new Date(),
    });
    
    // Process each setup card one at a time
    
    // Track unmapped tracks for reporting (use the one declared at function level)
    // Hymo doesn't need car mapping, only track mapping
    
    for (let cardIndex = 0; cardIndex < cardsToProcess; cardIndex++) {
      // Check for cancellation before each setup
      checkCancellation(signal);
      
      try {
        // Get car name from setup card details for better progress reporting
        const carName = searchResults.cardDetails[cardIndex]?.title || `Setup ${cardIndex + 1}`;
        console.log(`Processing setup card ${cardIndex + 1}/${searchResults.totalCards}: ${carName}`);
        
        onProgress?.({
          type: "info",
          message: `Downloading ${carName} (${cardIndex + 1}/${cardsToProcess})`,
          timestamp: new Date(),
        });
        
        // Click the setup card, open it in a new tab, and download the setup
        const downloadResult = await iRacingSetupsPage.clickSetupCardAndDownload(cardIndex, config.downloadPath, config.selectedTeams, config);
        
        console.log(`Setup ${cardIndex + 1} downloaded to: ${downloadResult}`);
        
        // Extract car and track information from the download result for mapping tracking
        // The downloadResult contains paths like: "car\team\{year} Season {season}\track\hymo" so we can extract the car and track names
        if (downloadResult) {
          const resultPaths = downloadResult.split(', ');
          for (const resultPath of resultPaths) {
            const pathParts = resultPath.split(path.sep);
            // Find the car and track folders - look for the pattern: .../car/team/{year} Season {season}/track/hymo
            for (let i = 0; i < pathParts.length - 2; i++) {
              if (pathParts[i + 1] && pathParts[i + 2] === 'hymo') {
                const mappedTrackName = pathParts[i + 1]; // Track is after the current position, before hymo
                const carName = pathParts[i - 2]; // Car is 2 levels up from the current position (car/team/season/track/hymo)
                
                // We need to find the original track name to report unmapped tracks
                // The mapped track name is what's in the path, but we need the original for unmapped tracking
                let originalTrackName = mappedTrackName;
                let isMapped = false;
                
                // Check if this mapped track name corresponds to an original track name
                if (config.mappings?.trackHymoToIracing) {
                  // Find the original track name that maps to this mapped track name
                  for (const [original, mapped] of Object.entries(config.mappings.trackHymoToIracing)) {
                    if (mapped === mappedTrackName) {
                      originalTrackName = original;
                      isMapped = true;
                      break;
                    }
                  }
                }
                
                // Add to unmapped tracks if this track doesn't have a mapping defined
                // If isMapped is false, it means this track name doesn't have a mapping, so it's unmapped
                if (!isMapped) {
                  unmappedTracks.add(originalTrackName);
                  console.log(`Found unmapped track: ${originalTrackName} (car: ${carName})`);
                } else {
                  console.log(`Found mapped track: ${originalTrackName} -> ${mappedTrackName} (car: ${carName})`);
                }
                break; // Found the car/track pair, move to next result path
              }
            }
          }
        }
        
        onProgress?.({
          type: "success",
          message: `Successfully downloaded ${carName} (${cardIndex + 1}/${cardsToProcess})`,
          timestamp: new Date(),
        });
        
      } catch (error) {
        // Get car name for error reporting (re-declare since it's in the try block scope)
        const carName = searchResults.cardDetails[cardIndex]?.title || `Setup ${cardIndex + 1}`;
        console.log(`Error processing setup card ${cardIndex + 1}:`, error);
        
        onProgress?.({
          type: "error",
          message: `Failed to download ${carName} (${cardIndex + 1}/${searchResults.totalCards}): ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date(),
        });
      }
      
      // Small delay between setups to avoid overwhelming the server
      if (cardIndex < searchResults.totalCards - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
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
