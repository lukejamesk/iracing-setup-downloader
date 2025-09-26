import {app, BrowserWindow, ipcMain, dialog} from "electron";
import * as path from "path";
import {runDownload, Config, DownloadProgress} from "@p1doks-downloader/core";

let mainWindow: BrowserWindow;

const createWindow = (): void => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the app
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // Load from the UI package
    mainWindow.loadFile(path.join(__dirname, "../../ui/dist/index.html"));
  }
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Store active download controllers and browser instances by sender ID
const activeDownloads = new Map<
  number,
  {controller: AbortController; browser?: any}
>();

// IPC handler for download functionality
ipcMain.handle("download-setups", async (event, config: Config) => {
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
      (browser) => {
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

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
