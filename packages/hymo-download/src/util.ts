import { Page } from "playwright-core";

export const load = async (page: Page) => {
  await page.waitForLoadState("networkidle");
};

export const waitFor = async (time: number) =>
  await new Promise<void>((res, rej) => {
    setTimeout(() => res(), time);
  });
