import {chromium} from "playwright";
import {downloadSetups} from "./download-setups";
import {Config} from "./config";

export const runDownload = async (config: Config) => {
  const browser = await chromium.launch({
    headless: config.runHeadless ?? true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  await downloadSetups(browser, context, page, config);
};
