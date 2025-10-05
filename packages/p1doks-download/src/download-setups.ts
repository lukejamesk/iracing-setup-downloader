import {Browser, BrowserContext, Page} from "playwright-core";
import {HomePage} from "./page-objects/pages/home-page";
import {Config} from "./config";
import {load, waitFor} from "./util";
import {SetupPage} from "./page-objects/pages/setup-page";
import path from "path";
import fs from "fs";
// Helper functions to apply mappings from config
const applyCarMapping = (car: string, mappings?: Record<string, string>): { mapped: string; wasMapped: boolean } => {
  if (mappings?.[car]) {
    return { mapped: mappings[car], wasMapped: true };
  } else {
    return { mapped: car, wasMapped: false };
  }
};

const applyTrackMapping = (track: string, mappings?: Record<string, string>): { mapped: string; wasMapped: boolean } => {
  if (mappings?.[track]) {
    return { mapped: mappings[track], wasMapped: true };
  } else {
    return { mapped: track, wasMapped: false };
  }
};


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
  // Track unmapped items
  const unmappedCars = new Set<string>();
  const unmappedTracks = new Set<string>();
  // Check for cancellation before starting
  checkCancellation(signal);

  await safePlaywrightOperation(() => page.goto("https://p1doks.com/"), signal);

  // Check for cancellation after page load
  checkCancellation(signal);

  // Add a small delay to make cancellation testing easier
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check for cancellation after delay
  checkCancellation(signal);

  console.log("BEGIN Login");
  onProgress?.({
    type: "info",
    message: "Starting login process...",
    timestamp: new Date(),
  });

  const marketplacePage = await safePlaywrightOperation(async () => {
    const homePage = new HomePage(page);
    const loginPage = homePage.clickLogin();
    return await loginPage.login(config.email, config.password);
  }, signal);

  // Check for cancellation after login
  checkCancellation(signal);

  onProgress?.({
    type: "success",
    message: "Login successful!",
    timestamp: new Date(),
  });
  console.log("END Login");

  const filter = {
    series: config.series,
    seasons: [config.season],
    weeks: [config.week],
    years: [config.year],
  };
  console.log("BEGIN Filter", filter);
  onProgress?.({
    type: "info",
    message: `Applying filters: ${config.series} - Season ${config.season}, Week ${config.week}, ${config.year}`,
    timestamp: new Date(),
  });
  await marketplacePage.selectFilter(filter);
  onProgress?.({
    type: "success",
    message: "Filters applied successfully!",
    timestamp: new Date(),
  });
  console.log("END Filter");

  onProgress?.({
    type: "info",
    message: "Searching for setup cards across all pages...",
    timestamp: new Date(),
  });

  // Process each page individually to maintain page context
  let totalCards = 0;
  let currentPage = 1;
  
  while (true) {
    // Check for cancellation before processing each page
    if (signal?.aborted) {
      throw new Error("Download cancelled");
    }

    onProgress?.({
      type: "info",
      message: `Processing page ${currentPage}...`,
      timestamp: new Date(),
    });

    const cards = await marketplacePage.getCards();
    totalCards += cards.length;
    
    onProgress?.({
      type: "info",
      message: `Found ${cards.length} setup cards on page ${currentPage}`,
      timestamp: new Date(),
    });

    for (const card of cards) {
    // Check for cancellation before processing each card
    if (signal?.aborted) {
      throw new Error("Download cancelled");
    }

    const details = await card.getDetails();
    onProgress?.({
      type: "info",
      message: `Processing: ${details.car} at ${details.track}`,
      timestamp: new Date(),
    });

    const secondPage = await context.newPage();
    await secondPage.goto(details.url);
    await load(secondPage);

    const setupPage = new SetupPage(secondPage);
    await waitFor(500);

    const setupBoxes = await setupPage.getSetupBoxes();
    onProgress?.({
      type: "info",
      message: `Found ${setupBoxes.length} setup files for ${details.car}`,
      timestamp: new Date(),
    });

    for (const box of setupBoxes) {
      // Check for cancellation before downloading each file
      if (signal?.aborted) {
        await secondPage.close();
        throw new Error("Download cancelled");
      }

      const downloadPromise = secondPage.waitForEvent("download");
      await box.download();

      const download = await downloadPromise;
      const filename = download.suggestedFilename();
      onProgress?.({
        type: "info",
        message: `Downloading: ${filename}`,
        timestamp: new Date(),
      });

      const carMappingResult = applyCarMapping(details.car, config.mappings?.carP1DoksToIracing);
      const trackMappingResult = applyTrackMapping(details.track, config.mappings?.trackP1DoksToWBR);
      
      const mappedCar = carMappingResult.mapped;
      const mappedTrack = trackMappingResult.mapped;
      
      // Track unmapped items
      if (!carMappingResult.wasMapped) {
        unmappedCars.add(details.car);
      }
      if (!trackMappingResult.wasMapped) {
        unmappedTracks.add(details.track);
      }

      // Download for each selected team
      for (const team of config.selectedTeams) {
        // Handle both string and Team object formats
        const teamName = typeof team === 'string' ? team : team.name;
        
        const folder = path.join(
          config.downloadPath,
          mappedCar,
          teamName,
          `${config.year} Season ${config.season}`,
          mappedTrack,
          "p1doks"
        );
        fs.mkdirSync(folder, {recursive: true});
        const filePath = path.join(folder, filename);
        await download.saveAs(filePath);

        onProgress?.({
          type: "success",
          message: `Saved to ${teamName}: ${filename}`,
          timestamp: new Date(),
        });
      }

      await waitFor(250);
    }
    await waitFor(500);
    await secondPage.close();
    }

    // Check if there's a next page, if not break the loop
    if (!(await marketplacePage.hasNextPage())) {
      break;
    }

    // Move to next page
    await marketplacePage.goToNextPage();
    currentPage++;
  }

  onProgress?.({
    type: "info",
    message: `Completed processing all pages. Total cards processed: ${totalCards}`,
    timestamp: new Date(),
  });

  // Only show completion message if not cancelled
  if (!signal?.aborted) {
    // Add a small delay to ensure cancellation is processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Final cancellation check
    if (!signal?.aborted) {
      // Call onCompleted with mapping info
      onCompleted?.({
        unmappedCars: Array.from(unmappedCars),
        unmappedTracks: Array.from(unmappedTracks),
      });

      onProgress?.({
        type: "success",
        message: "Download process completed!",
        timestamp: new Date(),
      });
    }
  }
  await browser.close();
};
