import {app} from "electron";
import * as path from "path";
import {initializeApp} from "./app-lifecycle";

// Set the app icon before initializing
const iconPath = path.join(__dirname, "assets/icon.png");
app.dock?.setIcon(iconPath); // macOS dock icon

// Initialize the Electron application
initializeApp();
