import { Page } from "playwright";

export type Coordinates = {
  x: number;
  y: number;
};

export interface Browser {
  launch(url: string): Promise<void>;
  getPage(): Page;
  getPageUrl(): string;
  mouseClick(x: number, y: number): Promise<void>;
  fillInput(text: string, coordinates: Coordinates): Promise<void>;
  scrollDown(): Promise<void>;
  scrollUp(): Promise<void>;
  goToUrl(url: string): Promise<void>;
}
