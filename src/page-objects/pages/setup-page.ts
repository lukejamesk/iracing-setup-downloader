import { Locator, Page } from "playwright-core";
import { LoggedInPage } from "./loggedin-page";

export class SetupBoxElement {
  constructor(
    public page: Page,
    public element: Locator
  ) {}

  async download() {
    await this.element.locator("button").click();
  }
}

export class SetupPage extends LoggedInPage {
  constructor(public page: Page) {
    super(page);
  }

  async getSetupBoxes(): Promise<SetupBoxElement[]> {
    const boxes = await this.page
      .locator(".border.border-border.rounded-lg.divide-y > div")
      .filter({
        hasText: ".sto",
      });

    const retBoxes = [];
    const count = await boxes.count();
    for (let i = 0; i < count; i++) {
      const box = boxes.nth(i);
      // bit of a hack because of shitty access to reliable selectors
      // to allow me to retrieve a stable div later
      const text = await box.locator("span").innerText();
      retBoxes.push(
        new SetupBoxElement(
          this.page,
          this.page
            .locator(".border.border-border.rounded-lg.divide-y > div")
            .filter({
              hasText: text,
            })
        )
      );
    }
    return retBoxes;
  }
}
