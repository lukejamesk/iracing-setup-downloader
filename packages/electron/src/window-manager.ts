import {BrowserWindow} from "electron";
import * as path from "path";

export const createMainWindow = (): BrowserWindow => {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    icon: path.join(__dirname, "assets/icon.png"),
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

  return mainWindow;
};
