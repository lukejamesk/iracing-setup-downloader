import { Locator, Page } from "playwright-core";
import { SetupCard } from "./setup-card";

export class SetupCardList {
  private wrapper: Locator | Page;
  private page: Page;

  constructor(page: Page, wrapper?: Locator) {
    this.page = page;
    this.wrapper = wrapper || page;
  }

  // Main container for the setup cards
  get setupCardsContainer(): Locator {
    return this.wrapper.locator('.flex.flex-col.items-center.justify-start.w-full');
  }

  // Individual setup cards
  get setupCards(): Locator {
    return this.wrapper.locator('a[href^="/setup/iRacing/"]');
  }

  // Setup card by index (returns SetupCard element)
  getSetupCard(index: number): SetupCard {
    const cardLocator = this.setupCards.nth(index);
    return new SetupCard(cardLocator);
  }

  // Get all SetupCard elements
  async getAllSetupCards(): Promise<SetupCard[]> {
    const count = await this.getSetupCardCount();
    const cards: SetupCard[] = [];
    
    for (let i = 0; i < count; i++) {
      cards.push(this.getSetupCard(i));
    }
    
    return cards;
  }

  // Period title (e.g., "iRacing Season 4 Week 4 2025 (Active)")
  get periodTitle(): Locator {
    return this.wrapper.locator('.text-2xl.font-bold.text-center.mb-2');
  }

  // Method to get all currently visible setup cards as SetupCard elements
  async getVisibleSetupCards(): Promise<SetupCard[]> {
    const cardLocators = await this.setupCards.all();
    return cardLocators.map(locator => new SetupCard(locator));
  }

  // Method to get the count of visible setup cards
  async getSetupCardCount(): Promise<number> {
    const count = await this.setupCards.count();
    return count;
  }

  // Method to scroll down and trigger lazy loading
  async scrollToLoadMore(): Promise<void> {
    console.log('📜 Scrolling to trigger lazy loading...');
    
    // Scroll to the bottom of the page
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait a moment for lazy loading to trigger
    await this.page.waitForTimeout(1000);
  }

  // Method to load all setup cards by scrolling until no more load
  async loadAllSetupCards(): Promise<number> {
    console.log('🔄 Loading all setup cards...');
    
    let previousCount = 0;
    let currentCount = await this.getSetupCardCount();
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite scrolling
    
    console.log(`📊 Initial setup card count: ${currentCount}`);
    
    while (currentCount > previousCount && attempts < maxAttempts) {
      previousCount = currentCount;
      
      // Scroll to load more
      await this.scrollToLoadMore();
      
      // Wait for new cards to potentially load
      await this.page.waitForTimeout(2000);
      
      // Get new count
      currentCount = await this.getSetupCardCount();
      
      attempts++;
      
      if (currentCount > previousCount) {
        console.log(`📈 Loaded more cards! New count: ${currentCount}`);
      } else {
        console.log(`✅ No more cards to load. Final count: ${currentCount}`);
      }
    }
    
    if (attempts >= maxAttempts) {
      console.log(`⚠️ Reached maximum scroll attempts (${maxAttempts}). Final count: ${currentCount}`);
    }
    
    return currentCount;
  }

  // Method to get setup card details using SetupCard element
  async getSetupCardDetails(cardIndex: number): Promise<{
    title: string;
    subscription: string;
    href: string;
  }> {
    const setupCard = this.getSetupCard(cardIndex);
    return await setupCard.getDetails();
  }

  // Method to get all setup card details using SetupCard elements
  async getAllSetupCardDetails(): Promise<Array<{
    title: string;
    subscription: string;
    href: string;
  }>> {
    const count = await this.getSetupCardCount();
    const details: Array<{ title: string; subscription: string; href: string; }> = [];
    
    console.log(`📋 Getting details for ${count} setup cards...`);
    
    for (let i = 0; i < count; i++) {
      const setupCard = this.getSetupCard(i);
      const cardDetails = await setupCard.getDetails();
      details.push(cardDetails);
      
      if ((i + 1) % 10 === 0 || i === count - 1) {
        console.log(`📝 Processed ${i + 1}/${count} cards`);
      }
    }
    
    return details;
  }
}
