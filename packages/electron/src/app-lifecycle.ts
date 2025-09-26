import {app, BrowserWindow} from "electron";
import * as path from "path";
import {createMainWindow} from "./window-manager";
import {setupIpcHandlers} from "./ipc-handlers";

let mainWindow: BrowserWindow;

export const initializeApp = (): void => {
  // This method will be called when Electron has finished initialization
  app.whenReady().then(() => {
    mainWindow = createMainWindow();
    setupIpcHandlers(mainWindow);

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow();
        setupIpcHandlers(mainWindow);
      }
    });
  });

  // Quit when all windows are closed
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
};
