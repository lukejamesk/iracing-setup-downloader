import { Locator, Page } from "playwright-core";
import { load } from "../../util";
import { IRacingSetupsPage } from "./iracing-setups-page";

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
    console.log("🔐 Filling email field...");
    await this.emailAddressField.fill(email);
    
    console.log("🔐 Filling password field...");
    await this.passwordField.fill(password);
    
    console.log("🔐 Clicking login button...");
    await this.signInButton.click();
    
    console.log("⏳ Waiting for navigation after login...");
    // Wait for navigation after login with a timeout
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      console.log("✅ Navigation completed");
    } catch (error) {
      console.log("⚠️ Navigation timeout, continuing...");
    }
    
    // Wait a bit more to ensure page is fully loaded
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("🎯 Login process completed");
    
    // Navigate directly to the iRacing setups page
    console.log("🔗 Navigating to iRacing setups page...");
    await this.page.goto("https://app.tracktitan.io/setups/iRacing");
    await this.page.waitForLoadState('networkidle');
    
    console.log("✅ Successfully navigated to iRacing setups page");
    
    // Return the iRacing setups page object
    return new IRacingSetupsPage(this.page);
  }
}
