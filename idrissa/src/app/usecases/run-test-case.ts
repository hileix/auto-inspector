import { TaskManagerService } from "@/core/services/task-manager-service.js";
import { ManagerAgent } from "../agents/manager-agent.js";
import { DomService } from "@/infra/services/dom-service.js";
import { BrowserService } from "@/infra/services/browser-service.js";
import { LLMService } from "@/infra/services/llm-service.js";
import { FileSystemService } from "@/infra/services/file-system.service.js";
import { ScreenshotService } from "@/infra/services/screenshot-service.js";

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
