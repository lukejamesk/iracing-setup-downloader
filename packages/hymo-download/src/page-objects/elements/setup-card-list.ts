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
    // Scroll to the last card element rather than just the page bottom,
    // which is more reliable for triggering intersection-observer lazy loading
    const lastCard = this.setupCards.last();
    if (await lastCard.count() > 0) {
      await lastCard.scrollIntoViewIfNeeded();
    } else {
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
    }

    // Then scroll a bit past to ensure the trigger zone is reached
    await this.page.evaluate(() => {
      window.scrollBy(0, 500);
    });
  }

  // Method to load all setup cards by scrolling until no more load
  async loadAllSetupCards(): Promise<number> {
    console.log('🔄 Loading all setup cards...');

    let currentCount = await this.getSetupCardCount();
    let staleScrolls = 0;
    const maxStaleScrolls = 3; // Allow a few scrolls with no new cards before giving up
    const maxTotalScrolls = 50; // Safety limit
    let totalScrolls = 0;

    console.log(`📊 Initial setup card count: ${currentCount}`);

    while (staleScrolls < maxStaleScrolls && totalScrolls < maxTotalScrolls) {
      const previousCount = currentCount;

      // Scroll to load more
      await this.scrollToLoadMore();

      // Wait for new cards to appear (check periodically instead of one fixed wait)
      let loaded = false;
      for (let i = 0; i < 5; i++) {
        await this.page.waitForTimeout(500);
        currentCount = await this.getSetupCardCount();
        if (currentCount > previousCount) {
          loaded = true;
          break;
        }
      }

      // If polling didn't find new cards, also wait for network idle as a fallback
      if (!loaded) {
        await this.page.waitForLoadState('networkidle').catch(() => {});
        currentCount = await this.getSetupCardCount();
        loaded = currentCount > previousCount;
      }

      totalScrolls++;

      if (loaded) {
        staleScrolls = 0; // Reset stale counter on success
        console.log(`📈 Loaded more cards! New count: ${currentCount} (scroll ${totalScrolls})`);
      } else {
        staleScrolls++;
        console.log(`⏳ No new cards on scroll ${totalScrolls} (stale ${staleScrolls}/${maxStaleScrolls})`);
      }
    }

    if (totalScrolls >= maxTotalScrolls) {
      console.log(`⚠️ Reached max scroll limit (${maxTotalScrolls}). Final count: ${currentCount}`);
    } else {
      console.log(`✅ All cards loaded. Final count: ${currentCount}`);
    }

    // Scroll back to top so card locators are accessible from the start
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForTimeout(500);

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
