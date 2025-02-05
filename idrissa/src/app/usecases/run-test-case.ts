import { TaskManagerService } from "@/core/services/task-manager-service";
import { ManagerAgent } from "../agents/manager-agent";
import { DomService } from "@/infra/services/dom-service";
import { BrowserService } from "@/infra/services/browser-service";
import { LLMService } from "@/infra/services/llm-service";
import { FileSystemService } from "@/infra/services/file-system.service";
import { ScreenshotService } from "@/infra/services/screenshot-service";

export class RunTestCase {
  async execute(startUrl: string, initialPrompt: string) {
    const fileSystem = new FileSystemService();
    const screenshotService = new ScreenshotService(fileSystem);
    const browserService = new BrowserService();

    const managerAgent = new ManagerAgent(
      new TaskManagerService(),
      new DomService(screenshotService, browserService),
      browserService,
      new LLMService(),
    );

    const result = await managerAgent.launch(startUrl, initialPrompt);

    return result;
  }
}
