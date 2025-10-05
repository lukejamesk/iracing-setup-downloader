import { Locator, Page } from "playwright-core";

export class SelectorElement {
  private wrapper: Locator | Page;

  constructor(page: Page, selector: string, wrapper?: Locator) {
    this.wrapper = wrapper || page;
    this.selector = selector;
  }

  public selector: string;

  get locator(): Locator {
    return this.wrapper.locator(this.selector);
  }

  async click(): Promise<void> {
    await this.locator.click();
  }

  async fill(text: string): Promise<void> {
    await this.locator.fill(text);
  }

  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  async isEnabled(): Promise<boolean> {
    return await this.locator.isEnabled();
  }

  async text(): Promise<string> {
    return await this.locator.textContent() || '';
  }
}
