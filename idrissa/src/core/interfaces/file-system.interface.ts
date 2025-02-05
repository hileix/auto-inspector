export interface FileSystemInterface {
  saveFile(path: string, data: Buffer): Promise<string>;
  saveScreenshot(filename: string, data: Buffer): Promise<string>;
}
