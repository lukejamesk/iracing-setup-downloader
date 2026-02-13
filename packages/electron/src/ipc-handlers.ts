import {ipcMain, dialog, BrowserWindow, shell} from "electron";
import {runDownload as runP1DoksDownload, Config as P1DoksConfig, DownloadProgress, DownloadCompletionInfo} from "@iracing-setup-downloader/p1doks-download";
import {runDownload as runHymoDownload, Config as HymoConfig} from "@iracing-setup-downloader/hymo-download";
import {Browser} from "playwright-core";
import * as fs from "fs";
import * as path from "path";

// Store active download controllers and browser instances by sender ID
const activeDownloads = new Map<
  number,
  {controller: AbortController; browser?: Browser}
>();

export const setupIpcHandlers = (mainWindow: BrowserWindow): void => {
  // Remove existing handlers to prevent duplicate registration
  ipcMain.removeAllListeners("download-setups");
  ipcMain.removeAllListeners("cancel-download");
  ipcMain.removeAllListeners("select-folder");
  ipcMain.removeAllListeners("open-folder");
  ipcMain.removeAllListeners("rename-folders-for-mapping");

  // IPC handler for download functionality
  ipcMain.handle("download-setups", async (event, service: string, config: any) => {
    console.log('Received config:', JSON.stringify(config, null, 2));
    
    
    const senderId = event.sender.id;
    const controller = new AbortController();
    activeDownloads.set(senderId, {controller});

    try {
      // Choose the appropriate download function based on service
      const runDownloadFunction = service === 'hymo' ? runHymoDownload : runP1DoksDownload;
      
      await runDownloadFunction(
        config,
        (progress: DownloadProgress) => {
          // Send progress updates to the renderer
          event.sender.send("download-progress", progress);
        },
        (completionInfo: DownloadCompletionInfo) => {
          // Send completion info with mapping data to the renderer
          event.sender.send("download-completed", completionInfo);
        },
        controller.signal,
        (browser: Browser) => {
          // Store the browser instance for forceful termination
          const downloadInfo = activeDownloads.get(senderId);
          if (downloadInfo) {
            downloadInfo.browser = browser;
            activeDownloads.set(senderId, downloadInfo);
          }
        }
      );
      return {success: true, completed: true};
    } catch (error) {
      console.error("Download failed for sender ID:", senderId, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Check if it was cancelled (either by abort signal or browser closure)
      if (
        errorMessage === "Download cancelled" ||
        errorMessage.includes(
          "Target page, context or browser has been closed"
        ) ||
        errorMessage.includes("browser has been closed")
      ) {
        return {success: false, error: "Download cancelled", cancelled: true};
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // Always delete the download info from the map
      activeDownloads.delete(senderId);
    }
  });

  // IPC handler for cancelling downloads
  ipcMain.handle("cancel-download", async (event) => {
    const senderId = event.sender.id;

    const downloadInfo = activeDownloads.get(senderId);

    if (downloadInfo) {
      downloadInfo.controller.abort();

      // Forcefully close the browser if it exists
      if (downloadInfo.browser) {
        try {
          await downloadInfo.browser.close();
        } catch (error) {
          console.error("Error closing browser:", error);
        }
      }

      activeDownloads.delete(senderId);
      return {success: true};
    }

    return {success: false, error: "No active download found"};
  });

  // IPC handler for folder picker
  ipcMain.handle("select-folder", async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "Select Download Folder",
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return {success: true, path: result.filePaths[0]};
    }

    return {success: false, error: "No folder selected"};
  });

  // IPC handler for opening folder in OS file explorer
  ipcMain.handle("open-folder", async (event, path: string) => {
    try {
      await shell.openPath(path);
      return {success: true};
    } catch (error) {
      console.error("Error opening folder:", error);
      return {success: false, error: "Failed to open folder"};
    }
  });

  // Helper function to recursively merge directories
  const mergeDirectories = (src: string, dest: string) => {
    if (!fs.existsSync(src)) return;
    
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src, { withFileTypes: true });
    
    for (const item of items) {
      const srcPath = path.join(src, item.name);
      const destPath = path.join(dest, item.name);
      
      if (item.isDirectory()) {
        // Recursively merge subdirectories
        mergeDirectories(srcPath, destPath);
      } else {
        // Copy files (don't overwrite existing files)
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
  };

  // IPC handler for renaming folders when a mapping is added
  ipcMain.handle("rename-folders-for-mapping", async (event, params: {
    downloadPath: string;
    type: 'car' | 'track';
    oldName: string;
    newName: string;
    teams: string[]; // Changed from Array<{name: string}> to string[]
    year: string;
    season: string;
    service?: string; // Add service parameter
  }) => {
    try {
      const { downloadPath, type, oldName, newName, teams, year, season, service } = params;
      
      
      if (type === 'car') {
        // For car mappings, rename the entire car folder: {downloadPath}/{oldName} to {downloadPath}/{newName}
        // This folder contains all teams and seasons for this car
        const oldCarFolder = path.join(downloadPath, oldName);
        const newCarFolder = path.join(downloadPath, newName);
        
        
        if (fs.existsSync(oldCarFolder)) {
          if (fs.existsSync(newCarFolder)) {
            // Merge the old folder contents into the existing new folder
            mergeDirectories(oldCarFolder, newCarFolder);
            // Remove the old folder after successful merge
            fs.rmSync(oldCarFolder, { recursive: true, force: true });
          } else {
            // Simply rename if the new folder doesn't exist
            fs.renameSync(oldCarFolder, newCarFolder);
          }
        }
      } else {
        // For track mappings, use the same structure for both P1Doks and Hymo
        // Structure: {downloadPath}/{car}/{team}/{year} Season {season}/{track}/{service}
        for (const team of teams) {
          // Get all car folders in the download path
          const carFolders = fs.readdirSync(downloadPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

          for (const carFolder of carFolders) {
            // Collect the year/season paths to search
            const teamPath = path.join(downloadPath, carFolder, team);
            let seasonPaths: string[] = [];

            if (year && season) {
              // Specific year/season selected — use it directly
              seasonPaths = [path.join(teamPath, `${year} Season ${season}`)];
            } else if (fs.existsSync(teamPath)) {
              // "All" was selected — search all year/season folders under this team
              seasonPaths = fs.readdirSync(teamPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => path.join(teamPath, dirent.name));
            }

            for (const teamSeasonPath of seasonPaths) {
              if (fs.existsSync(teamSeasonPath)) {
                // Look for the old track folder
                const oldTrackFolder = path.join(teamSeasonPath, oldName);
                const newTrackFolder = path.join(teamSeasonPath, newName);

                if (fs.existsSync(oldTrackFolder)) {
                  if (fs.existsSync(newTrackFolder)) {
                    // Merge the old track folder contents into the existing new track folder
                    mergeDirectories(oldTrackFolder, newTrackFolder);
                    // Remove the old track folder after successful merge
                    fs.rmSync(oldTrackFolder, { recursive: true, force: true });
                  } else {
                    // Simply rename if the new track folder doesn't exist
                    fs.renameSync(oldTrackFolder, newTrackFolder);
                  }
                }
              }
            }
          }
        }
      }
      
      return {success: true};
    } catch (error) {
      console.error("Error renaming folders:", error);
      return {success: false, error: `Failed to rename folders: ${error instanceof Error ? error.message : String(error)}`};
    }
  });
};
