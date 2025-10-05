import { Locator } from "playwright-core";

export class SetupCard {
  constructor(private cardLocator: Locator) {}

  // Setup card title/name
  get title(): Locator {
    return this.cardLocator.locator('span span');
  }

  // Setup card subscription details
  get subscription(): Locator {
    return this.cardLocator.locator('[data-testid="setupcard-subscription-details"]');
  }

  // Setup card image
  get image(): Locator {
    return this.cardLocator.locator('img[alt="Setup Card Image"]');
  }

  // Setup card container (the div with the card styling)
  get container(): Locator {
    return this.cardLocator.locator('div.m-3.rounded-md.bg-grey-500');
  }

  // Get the href attribute (setup URL)
  async getHref(): Promise<string> {
    return await this.cardLocator.getAttribute('href') || '';
  }

  // Get the title text
  async getTitleText(): Promise<string> {
    try {
      const titleText = await this.title.textContent();
      return titleText?.trim() || '';
    } catch (error) {
      console.log('⚠️ Could not get title text:', error);
      return '';
    }
  }

  // Get the subscription text
  async getSubscriptionText(): Promise<string> {
    try {
      const subscriptionText = await this.subscription.textContent();
      return subscriptionText?.trim() || '';
    } catch (error) {
      console.log('⚠️ Could not get subscription text:', error);
      return '';
    }
  }

  // Click the setup card
  async click(): Promise<void> {
    await this.cardLocator.click();
  }

  // Click the setup card and open in new tab
  async clickWithNewTab(): Promise<void> {
    await this.cardLocator.click({ modifiers: ['Control'] });
  }

  // Check if the card is visible
  async isVisible(): Promise<boolean> {
    try {
      return await this.cardLocator.isVisible();
    } catch (error) {
      return false;
    }
  }

  // Get all card details
  async getDetails(): Promise<{
    title: string;
    subscription: string;
    href: string;
  }> {
    const title = await this.getTitleText();
    const subscription = await this.getSubscriptionText();
    const href = await this.getHref();
    
    return {
      title,
      subscription,
      href
    };
  }
}
