import {BrowserWindow, app, Menu} from "electron";
import * as path from "path";
import * as fs from "fs";

// Setup auto-reload for development
const setupAutoReload = (mainWindow: BrowserWindow): void => {
  // Only enable in development
  if (process.env.NODE_ENV === "development" || !app.isPackaged) {
    // Watch UI source files for changes
    const uiSrcPath = path.join(__dirname, "../ui");
    let lastReloadTime = 0;
    
    const reloadWindow = () => {
      const now = Date.now();
      // Prevent rapid reloads (debounce for 1 second)
      if (now - lastReloadTime > 1000) {
        lastReloadTime = now;
        mainWindow.reload();
      }
    };
    
    // Watch for file changes in the UI directory
    if (fs.existsSync(uiSrcPath)) {
      fs.watch(uiSrcPath, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('.tsx') || filename.endsWith('.ts') || filename.endsWith('.css'))) {
          reloadWindow();
        }
      });
    }
  }
};

export const createMainWindow = (): BrowserWindow => {
  // Determine window dimensions - add 400px width in development
  const isDevelopment = process.env.NODE_ENV === "development" || !app.isPackaged;
  const windowWidth = isDevelopment ? 1800 : 1400; // 1400 + 400 = 1800
  
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: 950,
    autoHideMenuBar: !isDevelopment, // Hide menu bar in production, show in development
    icon: path.join(__dirname, "assets/icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      devTools: isDevelopment, // Only enable DevTools in development
    },
  });

  // Load the app
  // Always try dev server first in development, fallback to built files
  mainWindow.loadURL("http://localhost:5173").then(() => {
    setupAutoReload(mainWindow);
  }).catch(() => {
    mainWindow.loadURL("http://localhost:5174").then(() => {
      setupAutoReload(mainWindow);
    }).catch(() => {
      mainWindow.loadFile(path.join(__dirname, "../ui-dist/index.html"));
    });
  });
  
  // Open dev tools in development
  if (process.env.NODE_ENV === "development" || !app.isPackaged) {
    // Create a simple menu with DevTools option
    const template = [
      {
        label: 'View',
        submenu: [
          {
            label: 'Toggle Developer Tools',
            accelerator: 'F12',
            click: () => {
              if (mainWindow.webContents.isDevToolsOpened()) {
                mainWindow.webContents.closeDevTools();
              } else {
                mainWindow.webContents.openDevTools();
              }
            }
          }
        ]
      }
    ];
    
    const menu = Menu.buildFromTemplate(template as any);
    Menu.setApplicationMenu(menu);
    
    // Open DevTools
    mainWindow.webContents.openDevTools();
    
    // Add keyboard shortcut to toggle DevTools (F12)
    const { globalShortcut } = require('electron');
    globalShortcut.register('F12', () => {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    });
  }

  return mainWindow;
};
