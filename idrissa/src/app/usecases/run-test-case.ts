import { TaskManagerService } from "@/core/services/task-manager-service";
import { ManagerAgent } from "@/core/agents/manager-agent/manager-agent";
import { DomService } from "@/infra/services/dom-service";
import { OpenAI4o } from "@/infra/services/openai4o";
import { InMemoryFileSystem } from "@/infra/services/in-memory-file-system";
import { PlaywrightScreenshoter } from "@/infra/services/playwright-screenshotter";
import { ChromiumBrowser } from "@/infra/services/chromium-browser";
import { LogReporter } from "@/infra/services/log-reporter";

export class RunTestCase {
  async execute(startUrl: string, initialPrompt: string) {
    const fileSystem = new InMemoryFileSystem();
    const screenshotService = new PlaywrightScreenshoter(fileSystem);
    const browser = new ChromiumBrowser();

    const managerAgent = new ManagerAgent(
      new TaskManagerService(),
      new DomService(screenshotService, browser),
      browser,
      new OpenAI4o(),
      new LogReporter(),
    );

    const result = await managerAgent.launch(startUrl, initialPrompt);

    return result;
  }
}
