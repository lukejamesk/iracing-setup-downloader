import { chromium } from "playwright";
import "dotenv/config";
import { downloadSetups } from "./download-setups";
import { CONFIG } from "./config";
import { copyFiles } from "./copyFiles";

export const run = async () => {
  const browser = await chromium.launch({
    headless: process.env.RUN_HEADLESS === "true",
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  await downloadSetups(browser, context, page);

  if (CONFIG.iracingDocumentsPath !== "") {
    console.log("tried to copy");
    copyFiles();
  } else {
    console.log("Didn't copy files to iracing folder");
    process.exit();
  }
};

(async () => {
  await run();
})();
