import { Locator, Page } from "playwright-core";
import { MarketplacePage } from "./marketplace-page";
import { load } from "../../util";

export class LoginPage {
  get emailAddressField(): Locator {
    return this.page.locator('input[id="email"]');
  }
  get passwordField(): Locator {
    return this.page.locator('input[id="password"]');
  }

  get signInButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  constructor(public page: Page) {}

  async login(email: string, password: string) {
    await this.emailAddressField.fill(email);
    await this.passwordField.fill(password);
    await this.signInButton.click();
    return new MarketplacePage(this.page);
  }
}
