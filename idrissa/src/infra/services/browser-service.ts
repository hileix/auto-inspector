import { Page, chromium } from "playwright";

export type Coordinates = {
  x: number;
  y: number;
};

export class BrowserService {
  private page: Page | null = null;

  constructor() {}

  async launch(url: string) {
    const browser = await chromium.launch({
      headless: false,
    });
    this.page = await browser.newPage();
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

  async fillInput(text: string, coordinates: Coordinates) {
    await this.getPage().mouse.click(coordinates.x, coordinates.y);
    await this.getPage().keyboard.type(text, { delay: 100 });
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
