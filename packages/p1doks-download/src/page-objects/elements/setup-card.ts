import { Locator, Page } from "playwright-core";
import { SetupPage } from "../pages/setup-page";

export class SetupCardElement {
  constructor(
    public page: Page,
    private wrapper: Locator
  ) {}

  async getTrack(): Promise<string> {
    return (
      (await this.wrapper
        .locator(".text-muted-foreground")
        .nth(0)
        .textContent()) || ""
    );
  }

  async getWeek(): Promise<string> {
    const text: string =
      (await this.wrapper
        .locator(".text-muted-foreground")
        .nth(2)
        .textContent()) || "";
    const match = text.match(/(Season\s+\d+)\s+(Week\s+\d+)/i);

    if (match) {
      return match[2];
    }
    return "";
  }

  async getSeason(): Promise<string> {
    const text: string =
      (await this.wrapper
        .locator(".text-muted-foreground")
        .nth(2)
        .textContent()) || "";
    const match = text.match(/(Season\s+\d+)\s+(Week\s+\d+)/i);

    if (match) {
      return match[1];
    }
    return "";
  }

  async getCar(): Promise<string> {
    return (await this.wrapper.locator("h3").textContent()) || "";
  }

  async getDetails(): Promise<{
    track: string;
    week: string;
    season: string;
    car: string;
    url: string;
  }> {
    return {
      track: await this.getTrack(),
      week: await this.getWeek(),
      season: await this.getSeason(),
      car: await this.getCar(),
      url: await this.getUrl(),
    };
  }

  select() {
    return new SetupPage(this.page);
  }

  async getUrl(): Promise<string> {
    const url = await this.wrapper.getAttribute("href");
    if (!url) {
      throw new Error("Setup card does not have a valid href attribute");
    }
    return `https://p1doks.com${url}`;
  }
}
