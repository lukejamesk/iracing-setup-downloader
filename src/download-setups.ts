import { Browser, BrowserContext, Page } from "playwright-core";
import { HomePage } from "./page-objects/pages/home-page";
import { CONFIG } from "./config";
import { load, waitFor } from "./util";
import { SetupPage } from "./page-objects/pages/setup-page";
import path from "path";
import fs from "fs";
import {
  mapCarP1DoksToIracing,
  mapSeasonP1DoksToWBR,
  mapTrackP1DoksToWBR,
} from "./mappers";

export const downloadSetups = async (
  browser: Browser,
  context: BrowserContext,
  page: Page
) => {
  await page.goto("https://p1doks.com/");

  console.log("BEGIN Login");
  const homePage = new HomePage(page);
  const loginPage = homePage.clickLogin();
  const marketplacePage = await loginPage.login(CONFIG.email, CONFIG.password);
  console.log("END Login");

  const filter = {
    series: CONFIG.series,
    seasons: CONFIG.seasons,
    weeks: CONFIG.weeks,
  };
  console.log("BEGIN Filter", filter);
  await marketplacePage.selectFilter(filter);
  console.log("END Filter");

  const cards = await marketplacePage.getCards();

  for (const card of cards) {
    const details = await card.getDetails();

    const secondPage = await context.newPage();
    await secondPage.goto(details.url);
    await load(secondPage);

    const setupPage = new SetupPage(secondPage);
    await waitFor(500);

    const setupBoxes = await setupPage.getSetupBoxes();

    for (const box of setupBoxes) {
      const downloadPromise = secondPage.waitForEvent("download");
      await box.download();

      const download = await downloadPromise;

      const folder = path.join(
        "./setups",
        mapCarP1DoksToIracing(details.car),
        `Garage 61 - ${CONFIG.teamName}`,
        mapSeasonP1DoksToWBR(details.season),
        mapTrackP1DoksToWBR(details.track),
        "p1doks"
      );
      fs.mkdirSync(folder, { recursive: true });
      const filePath = path.join(folder, download.suggestedFilename());
      await download.saveAs(filePath);

      console.log(`Saved ${download.suggestedFilename()} to ${filePath}`);

      await waitFor(250);
    }
    await waitFor(500);
    await secondPage.close();
  }

  await browser.close();
};
