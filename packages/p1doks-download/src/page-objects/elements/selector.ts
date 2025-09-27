import { Locator, Page } from "playwright-core";
import { waitFor } from "../../util";

export class SelectorElement {
  constructor(
    public page: Page,
    private wrapper: Locator
  ) {}

  async select(options: string[]) {
    await this.wrapper.click();

    for (const option of options) {
      const button = this.page.locator(
        '[role=dialog][data-state="open"] [data-slot="command-item"]',
        {
          hasText: option,
        }
      );

      if ((await button.count()) !== 0) {
        if (
          (await button.locator("div.text-primary-foreground").count()) === 0
        ) {
          await button.first().click();
          await waitFor(250);
        }
      }
    }

    await this.page.locator("body").click();
  }
}
