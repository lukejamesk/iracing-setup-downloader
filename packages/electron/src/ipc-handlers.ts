import {ipcMain, dialog, BrowserWindow, shell} from "electron";
import {runDownload, Config, DownloadProgress} from "@p1doks-downloader/p1doks-download";
import {Browser} from "playwright-core";

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

  // IPC handler for download functionality
  ipcMain.handle("download-setups", async (event, config: Config) => {
    console.log('Received config:', JSON.stringify(config, null, 2));
    
    // Expand tilde in download path if present
    if (config.downloadPath.startsWith('~/')) {
      const os = require('os');
      const path = require('path');
      config.downloadPath = path.join(os.homedir(), config.downloadPath.slice(2));
    }
    
    const senderId = event.sender.id;
    const controller = new AbortController();
    activeDownloads.set(senderId, {controller});

    try {
      await runDownload(
        config,
        (progress: DownloadProgress) => {
          // Send progress updates to the renderer
          event.sender.send("download-progress", progress);
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
};
