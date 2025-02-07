import { VariableString } from "@/core/entities/variable-string";
import { Browser } from "@/core/interfaces/browser.interface";
import { Page, chromium } from "playwright";

export type Coordinates = {
  x: number;
  y: number;
};

export class ChromiumBrowser implements Browser {
  private page: Page | null = null;

  constructor() {}

  async launch(url: string) {
    const browser = await chromium.launch({
      headless: false,
    });
    const context = await browser.newContext({
      viewport: {
        width: 1440,
        height: 900,
      },
    });
    this.page = await context.newPage();
    await this.getPage()!.goto(url);
  }

  getPage(): Page {
    if (!this.page) {
      throw new Error("Page not initialized");
    }
    return this.page;
  }

  getPageUrl() {
    return this.getPage().url();
  }

  mouseClick(x: number, y: number) {
    return this.getPage().mouse.click(x, y);
  }

  async fillInput(text: VariableString, coordinates: Coordinates) {
    await this.getPage().mouse.click(coordinates.x, coordinates.y);
    await this.getPage().keyboard.type(text.dangerousValue(), { delay: 100 });
  }

  async scrollDown() {
    await this.getPage().mouse.wheel(0, 500);
    await this.getPage().waitForTimeout(300);
  }

  async scrollUp() {
    await this.getPage().mouse.wheel(0, -500);
    await this.getPage().waitForTimeout(300);
  }

  async goToUrl(url: string) {
    await this.getPage().goto(url);
  }
}
