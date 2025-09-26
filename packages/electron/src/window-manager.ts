import {BrowserWindow, app} from "electron";
import * as path from "path";

export const createMainWindow = (): BrowserWindow => {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 950,
    autoHideMenuBar: true, // Hide the menu bar but keep title bar
    icon: path.join(__dirname, "assets/icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the app
  // Always try dev server first in development, fallback to built files
  console.log("Attempting to load from dev server: http://localhost:5173");
  mainWindow.loadURL("http://localhost:5173").then(() => {
    console.log("Successfully loaded from dev server on port 5173");
  }).catch(() => {
    console.log("Port 5173 not available, trying port 5174");
    mainWindow.loadURL("http://localhost:5174").then(() => {
      console.log("Successfully loaded from dev server on port 5174");
    }).catch((error) => {
      console.log("Dev server not running, loading from built files. Error:", error.message);
      mainWindow.loadFile(path.join(__dirname, "../ui-dist/index.html"));
    });
  });
  
  // Open dev tools in development
  if (process.env.NODE_ENV === "development" || !app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
};
