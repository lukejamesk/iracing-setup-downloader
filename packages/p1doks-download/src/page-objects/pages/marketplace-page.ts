import {Locator, Page} from "playwright-core";
import {LoggedInPage} from "./loggedin-page";
import {load, waitFor} from "../../util";
import {SelectorElement} from "../elements";
import {SetupCardElement} from "../elements/setup-card";

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

  get selectYearsSelector(): SelectorElement {
    return new SelectorElement(
      this.page,
      this.page.locator("[role=dialog] [data-slot=popover-trigger]").nth(0)
    );
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

  get paginationContainer(): Locator {
    // Look for the flex container with gap-2 that contains pagination buttons
    return this.page.locator(".flex.items-center.gap-2");
  }

  get paginationButtons(): Locator {
    return this.paginationContainer.locator("button");
  }

  get nextPageButton(): Locator {
    return this.paginationButtons.filter({ hasText: "Next page" }).first();
  }

  get previousPageButton(): Locator {
    return this.paginationButtons.filter({ hasText: "Previous page" }).first();
  }

  get currentPageButton(): Locator {
    return this.paginationButtons.filter({ hasText: "bg-blue-500" }).first();
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

    await this.selectYearsSelector.select(filter.years || []);
    await waitFor(500);

    await this.selectSeasonsSelector.select(filter.seasons || []);
    await waitFor(500);

    await this.selectWeeksSelector.select(filter.weeks || []);
    await waitFor(500);

    await this.applyFilterButton.click();
    await waitFor(1000);
  }

  async hasPagination(): Promise<boolean> {
    try {
      // Look for pagination container
      const paginationContainers = await this.page.locator(".flex.items-center.gap-2").all();
      
      for (let i = 0; i < paginationContainers.length; i++) {
        const container = paginationContainers[i];
        
        // Check if this container has both Previous and Next page buttons
        const hasPrevious = await container.locator("button:has-text('Previous page')").count() > 0;
        const hasNext = await container.locator("button:has-text('Next page')").count() > 0;
        
        if (hasPrevious && hasNext) {
          // Count numbered buttons
          const buttons = await container.locator("button").all();
          let numberedButtons = 0;
          
          for (const button of buttons) {
            const text = await button.textContent();
            if (text && /^\d+$/.test(text.trim())) {
              numberedButtons++;
            }
          }
          
          // If there are multiple numbered buttons, there's pagination
          if (numberedButtons > 1) {
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async hasNextPage(): Promise<boolean> {
    try {
      // Look for pagination containers
      const paginationContainers = await this.page.locator(".flex.items-center.gap-2").all();
      
      for (let i = 0; i < paginationContainers.length; i++) {
        const container = paginationContainers[i];
        
        // Check if this container has both Previous and Next page buttons
        const hasPrevious = await container.locator("button:has-text('Previous page')").count() > 0;
        const hasNext = await container.locator("button:has-text('Next page')").count() > 0;
        
        if (hasPrevious && hasNext) {
          const nextButton = container.locator("button:has-text('Next page')").first();
          const isDisabled = await nextButton.isDisabled();
          return !isDisabled;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async goToNextPage(): Promise<void> {
    // Look for pagination containers
    const paginationContainers = await this.page.locator(".flex.items-center.gap-2").all();
    
    for (let i = 0; i < paginationContainers.length; i++) {
      const container = paginationContainers[i];
      
      // Check if this container has both Previous and Next page buttons
      const hasPrevious = await container.locator("button:has-text('Previous page')").count() > 0;
      const hasNext = await container.locator("button:has-text('Next page')").count() > 0;
      
      if (hasPrevious && hasNext) {
        const nextButton = container.locator("button:has-text('Next page')").first();
        const isDisabled = await nextButton.isDisabled();
        
        if (!isDisabled) {
          await nextButton.click();
          await waitFor(1000); // Wait for page to load
          return;
        }
      }
    }
  }

  async getAllCards(): Promise<SetupCardElement[]> {
    const allCards: SetupCardElement[] = [];
    
    // Get cards from the first page
    let currentPageCards = await this.getCards();
    allCards.push(...currentPageCards);
    
    // Check if there's pagination and navigate through all pages
    while (await this.hasNextPage()) {
      await this.goToNextPage();
      currentPageCards = await this.getCards();
      allCards.push(...currentPageCards);
    }
    
    return allCards;
  }

  async getCards(): Promise<SetupCardElement[]> {
    const cards: SetupCardElement[] = (await this.cards.all()).map(
      (card) => new SetupCardElement(this.page, card)
    );

    return cards;
  }
}
