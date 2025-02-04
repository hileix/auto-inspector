import { Page } from "playwright-core";

export type Coordinates = {
  x: number;
  y: number;
};

export class BrowserService {
  constructor(private readonly page: Page) {}

  getPage() {
    return this.page;
  }

  getPageUrl() {
    return this.page.url();
  }

  mouseClick(x: number, y: number) {
    return this.page.mouse.click(x, y);
  }

  async fillInput(text: string, coordinates: Coordinates) {
    await this.page.mouse.click(coordinates.x, coordinates.y);
    await this.page.keyboard.type(text, { delay: 100 });
  }

  async scrollDown() {
    await this.page.mouse.wheel(0, 500);
    await this.page.waitForTimeout(300);
  }

  async scrollUp() {
    await this.page.mouse.wheel(0, -500);
    await this.page.waitForTimeout(300);
  }

  async goToUrl(url: string) {
    await this.page.goto(url);
  }
}
