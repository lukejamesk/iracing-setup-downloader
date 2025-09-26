import {chromium} from "playwright";
import {downloadSetups, DownloadProgress} from "./download-setups";
import {Config} from "./config";

export const runDownload = async (
  config: Config,
  onProgress?: (progress: DownloadProgress) => void,
  signal?: AbortSignal,
  onBrowserCreated?: (browser: any) => void
) => {
  const browser = await chromium.launch({
    headless: config.runHeadless ?? true,
  });

  // Notify the caller that browser is created
  if (onBrowserCreated) {
    onBrowserCreated(browser);
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await downloadSetups(browser, context, page, config, onProgress, signal);
  } finally {
    // Always close the browser, even if cancelled
    await browser.close();
  }
};
