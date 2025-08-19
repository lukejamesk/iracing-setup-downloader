import { chromium } from "playwright";
import "dotenv/config";
import { downloadSetups } from "./download-setups";
import { cp } from "fs";
import { CONFIG } from "./config";

(async () => {
  const browser = await chromium.launch({
    headless: process.env.RUN_HEADLESS === "true",
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  await downloadSetups(browser, context, page);

  if (CONFIG.iracingDocumentsPath !== "") {
    cp(
      "./setups",
      `${CONFIG.iracingDocumentsPath}/setups`,
      { recursive: true, force: false },
      (err) => {
        if (err) {
          console.error("Error copying setups:", err);
        } else {
          console.log("Setups copied successfully.");
        }
        process.exit();
      }
    );
  } else {
    console.log("Didn't copy files to iracing folder");
    process.exit();
  }
})();
