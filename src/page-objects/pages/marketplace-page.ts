import { Locator, Page } from "playwright-core";
import { LoggedInPage } from "./loggedin-page";
import { load, waitFor } from "../../util";
import { SelectorElement } from "../elements";
import { SetupCardElement } from "../elements/setup-card";

export class MarketplacePage extends LoggedInPage {
  get seriesButtons(): Locator {
    return this.page.locator(".items-start + div > button");
  }

  get filterButton(): Locator {
    return this.page.locator("[data-slot=sheet-trigger]", {
      hasText: "Filters",
    });
  }

  get applyFilterButton(): Locator {
    return this.page.locator("button", {
      hasText: "Apply Filters",
    });
  }
  get clearFiltersButton(): Locator {
    return this.page.locator("button", {
      hasText: "Clear all filters",
    });
  }

  get selectSeasonsSelector(): SelectorElement {
    return new SelectorElement(
      this.page,
      this.page.locator("[role=dialog] [data-slot=popover-trigger]").nth(1)
    );
  }
  get selectWeeksSelector(): SelectorElement {
    return new SelectorElement(
      this.page,
      this.page.locator("[role=dialog] [data-slot=popover-trigger]").nth(2)
    );
  }

  get cards(): Locator {
    return this.page.locator(".grid .group");
  }

  constructor(public page: Page) {
    super(page);
  }

  async selectSeries(name: string) {
    const button = this.seriesButtons.filter({
      hasText: name,
    });

    await button.first().click();
  }

  async selectFilter(filter: {
    series?: string;
    years?: string[];
    weeks?: string[];
    seasons?: string[];
  }) {
    await this.clearFiltersButton.click();
    await waitFor(500);

    if (filter.series) {
      await this.selectSeries(filter.series);
    }

    await waitFor(500);
    await this.filterButton.click();

    await waitFor(500);

    await this.selectSeasonsSelector.select(filter.seasons || []);
    await waitFor(500);

    await this.selectWeeksSelector.select(filter.weeks || []);
    await waitFor(500);

    await this.applyFilterButton.click();
    await waitFor(1000);
  }

  async getCards(): Promise<SetupCardElement[]> {
    const cards: SetupCardElement[] = (await this.cards.all()).map(
      (card) => new SetupCardElement(this.page, card)
    );

    return cards;
  }
}
