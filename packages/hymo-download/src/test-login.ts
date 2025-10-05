import { runDownload } from "./download";
import { DownloadProgress, DownloadCompletionInfo } from "./download-setups";
import { Config } from "./config";

// Test configuration
const testConfig: Config = {
  login: process.env.HYMO_LOGIN || "",
  password: process.env.HYMO_PASSWORD || "",
  series: "GT Sprint",
  season: "4",
  year: "2025",
  week: "3",
  selectedTeams: ["Garage 61", "Garage 61 - Team LK"],
  downloadPath: "C:\\Users\\lukej\\Downloads\\hymo-test-setups",
  runHeadless: false,
  mappings: {
    trackHymoToIracing: {
      // No mappings - all tracks should be reported as unmapped
    }
  }
};

async function testLogin() {
  console.log("Testing TrackTitan Login...");
  console.log("Email:", testConfig.login);
  console.log("URL: https://app.tracktitan.io/login");
  
  if (!testConfig.login || !testConfig.password) {
    console.error("Error: HYMO_LOGIN and HYMO_PASSWORD environment variables must be set");
    process.exit(1);
  }
  
  try {
    await runDownload(
      testConfig,
      (progress: DownloadProgress) => {
        console.log(`[${progress.type.toUpperCase()}] ${progress.message}`);
      },
      (completionInfo: DownloadCompletionInfo) => {
        console.log("Download completed!");
        console.log("Unmapped cars:", completionInfo.unmappedCars);
        console.log("Unmapped tracks:", completionInfo.unmappedTracks);
      }
    );
    
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testLogin();
