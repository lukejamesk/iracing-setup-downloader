import { Locator, Page } from "playwright-core";
import { LoginPage } from "./login-page";

export class LoggedOutPage {
  get loginButton(): Locator {
    return this.page.locator("a", {
      hasText: "Login",
    });
  }

  constructor(public page: Page) {}

  clickLogin() {
    this.loginButton.click();
    return new LoginPage(this.page);
  }
}
