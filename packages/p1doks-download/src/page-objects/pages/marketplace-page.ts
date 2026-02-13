import {Locator, Page} from "playwright-core";
import {LoggedInPage} from "./loggedin-page";
import {waitFor} from "../../util";
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
  get selectSeriesSelector(): SelectorElement {
    return new SelectorElement(
      this.page,
      this.page.locator("[role=dialog] [data-slot=popover-trigger]").nth(5)
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
    series?: string[];
    years?: string[];
    weeks?: string[];
    seasons?: string[];
  }) {
    await this.clearFiltersButton.click();
    await waitFor(500);

    await this.filterButton.click();
    await waitFor(500);

    await this.selectYearsSelector.select(filter.years || []);
    await waitFor(500);

    await this.selectSeasonsSelector.select(filter.seasons || []);
    await waitFor(500);

    await this.selectWeeksSelector.select(filter.weeks || []);
    await waitFor(500);

    await this.selectSeriesSelector.select(filter.series || []);
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

  // Get the numbered page buttons from the pagination container, sorted by page number
  private async getNumberedPageButtons(): Promise<{ number: number; button: Locator }[]> {
    const paginationContainers = await this.page.locator(".flex.items-center.gap-2").all();

    for (const container of paginationContainers) {
      const hasPrevious = await container.locator("button:has-text('Previous page')").count() > 0;
      const hasNext = await container.locator("button:has-text('Next page')").count() > 0;

      if (hasPrevious && hasNext) {
        const buttons = await container.locator("button").all();
        const numbered: { number: number; button: Locator }[] = [];

        for (const button of buttons) {
          const text = await button.textContent();
          if (text && /^\d+$/.test(text.trim())) {
            numbered.push({ number: parseInt(text.trim(), 10), button });
          }
        }

        return numbered.sort((a, b) => a.number - b.number);
      }
    }

    return [];
  }

  // Jump to the last visible page, then keep jumping until Next is disabled
  async goToLastPage(): Promise<number> {
    while (true) {
      if (!(await this.hasNextPage())) {
        // We're on the last page - get its number from the active button
        const numbered = await this.getNumberedPageButtons();
        return numbered.length > 0 ? numbered[numbered.length - 1].number : 1;
      }

      // Click the highest visible numbered button
      const numbered = await this.getNumberedPageButtons();
      if (numbered.length === 0) break;

      const highest = numbered[numbered.length - 1];
      await highest.button.click();
      await waitFor(1000);
    }

    return 1;
  }

  // Jump to page 1 by clicking the lowest visible numbered button repeatedly
  async goToFirstPage(): Promise<void> {
    while (true) {
      const numbered = await this.getNumberedPageButtons();
      if (numbered.length === 0) break;

      const lowest = numbered[0];
      if (lowest.number === 1) {
        // Page 1 is visible but might not be active - click it if we're not already on it
        const isActive = await lowest.button.evaluate(
          (el) => el.classList.contains('bg-blue-500')
        );
        if (!isActive) {
          await lowest.button.click();
          await waitFor(1000);
        }
        break;
      }

      // Click the lowest visible page to shift the window back
      await lowest.button.click();
      await waitFor(1000);
    }
  }

  async countTotalCards(): Promise<{ totalCards: number; totalPages: number }> {
    // Count cards on the first page
    const firstPageCards = (await this.cards.all()).length;

    if (!(await this.hasNextPage())) {
      // Only one page
      return { totalCards: firstPageCards, totalPages: 1 };
    }

    // Jump to the last page to find total pages and last page card count
    const totalPages = await this.goToLastPage();
    const lastPageCards = (await this.cards.all()).length;

    // Total = (totalPages - 1) * firstPageCards + lastPageCards
    const totalCards = (totalPages - 1) * firstPageCards + lastPageCards;

    // Navigate back to page 1
    await this.goToFirstPage();

    return { totalCards, totalPages };
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
