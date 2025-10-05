import { Locator, Page } from "playwright-core";
import { LoginPage } from "./login-page";

export class HomePage {
  constructor(public page: Page) {}

  // Since we're navigating directly to the login page URL,
  // we can just return the LoginPage directly
  clickLogin(): LoginPage {
    return new LoginPage(this.page);
  }
}
