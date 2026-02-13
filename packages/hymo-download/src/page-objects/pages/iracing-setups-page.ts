import { Locator, Page } from "playwright-core";
import { SetupFilter } from "../elements/setup-filter";
import { SetupCardList } from "../elements/setup-card-list";
import { CarSetupPage } from "./car-setup-page";
import { Config } from "../../config";

export class IRacingSetupsPage {
  private _setupFilter: SetupFilter;
  private _setupCardList: SetupCardList;

  constructor(public page: Page) {
    // Create a wrapper for the filter section to scope the SetupFilter
    // Target the main filter container that contains all the dropdowns
    const filterWrapper = page.locator('.flex.flex-col.gap-4.mb-8.bg-grey-500.p-4.rounded-lg.max-w-7xl.w-full.self-center');
    this._setupFilter = new SetupFilter(page, filterWrapper);
    
    // Create a wrapper for the setup cards section (can be the entire page or a specific container)
    // For now, using the entire page, but could be scoped to a specific container if needed
    this._setupCardList = new SetupCardList(page);
  }

  // Access to the setup filter
  get setupFilter(): SetupFilter {
    return this._setupFilter;
  }

  // Access to the setup card list
  get setupCardList(): SetupCardList {
    return this._setupCardList;
  }

  // TODO: Add selectors for setup elements once we have the HTML structure
  // These will be placeholder selectors for now
  
  get setupCards(): Locator {
    return this.page.locator('[data-testid="setup-card"]'); // Placeholder selector
  }

  get downloadButtons(): Locator {
    return this.page.locator('button[data-testid="download-setup"]'); // Placeholder selector
  }

  // Methods for searching and filtering setups
  async searchSetups(series: string | undefined, season?: string, week?: string, year?: string) {
    const seriesLabel = series || 'All series';
    const seasonLabel = season ? `Season ${season}` : 'All Seasons';
    const weekLabel = week ? `Week ${week}` : 'All Weeks';
    const yearLabel = year || 'All Years';
    console.log(`Searching for setups: ${seriesLabel} - ${seasonLabel}, ${weekLabel}, ${yearLabel}`);

    // Map season/week/year to period filter format (requires all three for a valid period string)
    const periodString = SetupFilter.createPeriodString(season, week, year);
    if (periodString) {
      console.log(`🗓️ Using period filter: ${periodString}`);
    } else {
      console.log('🗓️ No period filter applied (downloading all periods)');
    }

    // Use the setup filter to apply filters (only include filters that have values)
    await this.setupFilter.applyFilters({
      ...(series ? { series } : {}),
      ...(periodString ? { period: periodString } : {}),
    });
    
    // Wait for setup cards to appear (reduced delay)
    console.log('⏳ Waiting for setup cards to load...');
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
    
    // Load all setup cards using lazy loading
    const totalCards = await this.setupCardList.loadAllSetupCards();
    console.log(`🎯 Total setup cards loaded: ${totalCards}`);

    // Return the count and card list — card details are fetched lazily during download
    // to avoid timeouts when there are many cards (e.g. "all" filter)
    return {
      totalCards: totalCards,
      setupCardList: this.setupCardList
    };
  }

  async downloadSetup(setupIndex: number) {
    // TODO: Implement setup download logic
    console.log(`Downloading setup at index: ${setupIndex}`);
  }

  // Open a setup card in a new tab and return the page (sequential — must not be called concurrently)
  async openSetupCardTab(cardIndex: number): Promise<Page> {
    const setupCard = this.setupCardList.getSetupCard(cardIndex);

    // Listen for the new tab before clicking to reliably capture it
    const newPagePromise = this.page.context().waitForEvent('page');
    await setupCard.clickWithNewTab();
    const newPage = await newPagePromise;

    await newPage.waitForLoadState('domcontentloaded');
    return newPage;
  }

  // Download a setup from an already-opened tab, then close it
  static async downloadFromTab(newPage: Page, downloadPath?: string, selectedTeams?: string[], config?: Config): Promise<string> {
    const carSetupPage = new CarSetupPage(newPage);

    // Wait for page load with retry on timeout
    try {
      await carSetupPage.waitForPageLoad();
    } catch {
      console.log('⚠️ Page load timed out, retrying...');
      await newPage.reload({ waitUntil: 'domcontentloaded' });
      await carSetupPage.waitForPageLoad();
    }

    const downloadResult = await carSetupPage.downloadSetup(downloadPath, selectedTeams, config);
    await newPage.close();
    return downloadResult;
  }

  async getAllSetups() {
    // TODO: Implement logic to get all visible setups
    console.log("Getting all visible setups");
    return [];
  }
}
