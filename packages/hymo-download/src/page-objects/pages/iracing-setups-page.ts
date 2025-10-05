import { Locator, Page } from "playwright-core";
import { load } from "../../util";
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
  async searchSetups(series: string, season: string, week: string, year: string) {
    console.log(`Searching for setups: ${series} - Season ${season}, Week ${week}, Year ${year}`);
    
    // Map season/week/year to period filter format using the helper method
    const periodString = SetupFilter.createPeriodString(season, week, year);
    console.log(`🗓️ Using period filter: ${periodString}`);
    
    // Use the setup filter to apply filters
    await this.setupFilter.applyFilters({
      series: series,
      period: periodString
    });
    
    // Wait for setup cards to appear (reduced delay)
    console.log('⏳ Waiting for setup cards to load...');
    await this.page.waitForTimeout(1000);
    
    // Load all setup cards using lazy loading
    const totalCards = await this.setupCardList.loadAllSetupCards();
    console.log(`🎯 Total setup cards loaded: ${totalCards}`);
    
    // Get details of all setup cards
    const cardDetails = await this.setupCardList.getAllSetupCardDetails();
    console.log('📋 Setup card details:');
    cardDetails.forEach((card, index) => {
      console.log(`  ${index + 1}. ${card.title} (${card.subscription})`);
    });
    
    // Return both the details and the total count for iteration
    return {
      cardDetails,
      totalCards: totalCards,
      setupCardList: this.setupCardList
    };
  }

  async downloadSetup(setupIndex: number) {
    // TODO: Implement setup download logic
    console.log(`Downloading setup at index: ${setupIndex}`);
  }

  // Method to click a setup card and open it in a new tab, then download the setup
  async clickSetupCardAndDownload(cardIndex: number, downloadPath?: string, selectedTeams?: string[], config?: Config): Promise<string> {
    console.log(`🖱️ Clicking setup card ${cardIndex + 1} and opening in new tab...`);
    
    // Get the setup card
    const setupCard = this.setupCardList.getSetupCard(cardIndex);
    
    // Get card details for logging
    const cardDetails = await setupCard.getDetails();
    console.log(`📋 Opening: ${cardDetails.title}`);
    
    // Click the card with Ctrl+Click to open in new tab
    await setupCard.clickWithNewTab();
    
    // Wait for the new tab to load (reduced delay)
    await this.page.waitForTimeout(1000);
    
    // Get all pages (tabs) and find the new one
    const pages = this.page.context().pages();
    const newPage = pages[pages.length - 1]; // The newest tab
    
    // Create a CarSetupPage instance for the new tab
    const carSetupPage = new CarSetupPage(newPage);
    
    // Wait for the car setup page to load
    await carSetupPage.waitForPageLoad();
    
    // Download the setup with team information
    const downloadResult = await carSetupPage.downloadSetup(downloadPath, selectedTeams, config);
    
    // Close the new tab after download
    await newPage.close();
    
    console.log(`✅ Setup card ${cardIndex + 1} processed: ${downloadResult}`);
    
    return downloadResult;
  }

  async getAllSetups() {
    // TODO: Implement logic to get all visible setups
    console.log("Getting all visible setups");
    return [];
  }
}
