import {chromium} from "playwright";
import {downloadSetups, DownloadProgress, DownloadCompletionInfo} from "./download-setups";
import {Config} from "./config";

export const runDownload = async (
  config: Config,
  onProgress?: (progress: DownloadProgress) => void,
  onCompleted?: (completionInfo: DownloadCompletionInfo) => void,
  signal?: AbortSignal,
  onBrowserCreated?: (browser: any) => void
) => {
  // Launch system Chrome
  let browser;
  try {
    console.log("Launching system Chrome for Hymo download...");
    browser = await chromium.launch({
      headless: config.runHeadless ?? true,
      channel: "chrome", // This tells Playwright to use the system's Chrome
    });
    console.log("Chrome launched successfully for Hymo");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      "Chrome not found. Please install Google Chrome to use this application.\n\n" +
      `Error: ${errorMessage}\n\n` +
      "Download Chrome from: https://www.google.com/chrome/"
    );
  }

  // Notify the caller that browser is created
  if (onBrowserCreated) {
    onBrowserCreated(browser);
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await downloadSetups(browser, context, page, config, onProgress, onCompleted, signal);
  } finally {
    // Always close the browser, even if cancelled
    await browser.close();
  }
};
