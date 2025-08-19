import { Page } from "playwright-core";
import { LoggedOutPage } from "./loggedout-page";

export class HomePage extends LoggedOutPage {
  constructor(public page: Page) {
    super(page);
  }
}
