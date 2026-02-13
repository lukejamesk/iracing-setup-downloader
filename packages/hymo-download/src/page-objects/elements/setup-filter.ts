import { Locator, Page } from "playwright-core";

export class SetupFilter {
  private wrapper: Locator | Page;
  private page: Page;

  constructor(page: Page, wrapper?: Locator) {
    this.page = page;
    this.wrapper = wrapper || page;
  }

  // Helper method to find React Select input by label text
  private getSelectInputByLabel(labelText: string): Locator {
    // Find the specific filter container that contains the label text
    // Each filter is in its own "w-full flex flex-col gap-2" container
    return this.wrapper
      .locator(`.w-full.flex.flex-col.gap-2:has(div:has-text("${labelText}"))`)
      .locator('input[role="combobox"]');
  }

  // Period filter - find by label "Period"
  get periodFilter(): Locator {
    return this.getSelectInputByLabel("Period");
  }

  // Car filter - find by label "Car"
  get carFilter(): Locator {
    return this.getSelectInputByLabel("Car");
  }

  // Track filter - find by label "Track"
  get trackFilter(): Locator {
    return this.getSelectInputByLabel("Track");
  }

  // Driver filter - find by label "Driver"
  get driverFilter(): Locator {
    return this.getSelectInputByLabel("Driver");
  }

  // Series filter - find by label "Series"
  get seriesFilter(): Locator {
    return this.getSelectInputByLabel("Series");
  }

  // Checkbox filters - these are in the bottom section with specific styling
  get ownedCheckbox(): Locator {
    return this.wrapper.locator('button.text-white.flex.items-center:has-text("Owned")');
  }

  get notOwnedCheckbox(): Locator {
    return this.wrapper.locator('button.text-white.flex.items-center:has-text("Not Owned")');
  }

  get includesWetSetupCheckbox(): Locator {
    return this.wrapper.locator('button.text-white.flex.items-center:has-text("Includes Wet Setup")');
  }

  // Apply and Reset buttons
  get applyButton(): Locator {
    return this.wrapper.locator('button:has-text("Apply")');
  }

  get resetButton(): Locator {
    return this.wrapper.locator('button:has-text("Reset")');
  }

  // Helper method to select from React Select dropdown
  async selectFromDropdown(filterInput: Locator, optionText: string): Promise<void> {
    console.log(`🔍 Selecting "${optionText}" from dropdown...`);
    
    // Click to open dropdown
    await filterInput.click();
    console.log('🔽 Dropdown clicked, waiting for options...');
    
    // Wait for dropdown menu to appear - React Select creates a portal outside the container
    await this.page.waitForSelector('[class*="css-"][class*="menu"]', { timeout: 5000 });
    console.log('📋 Dropdown menu appeared');
    
    // Type to filter options
    await filterInput.fill(optionText);
    console.log(`⌨️ Typed "${optionText}" to filter options`);
    
    // Wait a moment for filtering
    await this.page.waitForTimeout(500);
    
    // Click the first matching option in the dropdown menu
    const option = this.page.locator('[class*="css-"][class*="option"]').first();
    await option.click();
    console.log('✅ Option selected');
    
    // Wait for dropdown to close
    await this.page.waitForTimeout(500);
  }

  // Helper method to create period string from components
  // Returns undefined if any component is missing (all three are needed for a valid period filter)
  static createPeriodString(season?: string, week?: string, year?: string): string | undefined {
    if (!season || !week || !year) return undefined;
    return `iRacing Season ${season} Week ${week} ${year}`;
  }

  // Filter methods
  async selectPeriod(period: string): Promise<void> {
    console.log(`🗓️ Selecting period: ${period}`);
    await this.selectFromDropdown(this.periodFilter, period);
  }

  async selectCar(car: string): Promise<void> {
    await this.selectFromDropdown(this.carFilter, car);
  }

  async selectTrack(track: string): Promise<void> {
    await this.selectFromDropdown(this.trackFilter, track);
  }

  async selectDriver(driver: string): Promise<void> {
    await this.selectFromDropdown(this.driverFilter, driver);
  }


  async selectSeries(series: string): Promise<void> {
    await this.selectFromDropdown(this.seriesFilter, series);
  }

  async toggleOwned(): Promise<void> {
    await this.ownedCheckbox.click();
  }

  async toggleNotOwned(): Promise<void> {
    await this.notOwnedCheckbox.click();
  }

  async toggleIncludesWetSetup(): Promise<void> {
    await this.includesWetSetupCheckbox.click();
  }

  // Method to apply multiple filters at once
  async applyFilters(filters: {
    period?: string;
    car?: string;
    track?: string;
    driver?: string;
    series?: string;
    owned?: boolean;
    notOwned?: boolean;
    includesWetSetup?: boolean;
  }): Promise<void> {
    console.log('🔧 Applying filters...');
    
    // Apply all the filters
    if (filters.period) await this.selectPeriod(filters.period);
    if (filters.car) await this.selectCar(filters.car);
    if (filters.track) await this.selectTrack(filters.track);
    if (filters.driver) await this.selectDriver(filters.driver);
    if (filters.series) await this.selectSeries(filters.series);
    
    if (filters.owned) await this.toggleOwned();
    if (filters.notOwned) await this.toggleNotOwned();
    if (filters.includesWetSetup) await this.toggleIncludesWetSetup();
    
    // Click the Apply button to submit the filters
    console.log('✅ Clicking Apply button to submit filters...');
    await this.applyButton.click();
    
    // Wait a moment for the filters to be applied and results to load
    await this.page.waitForTimeout(1000);
    console.log('🎯 Filters applied successfully!');
  }
}
