import { TaskManagerService } from "@/core/services/task-manager-service";
import { ManagerAgent } from "@/core/agents/manager-agent/manager-agent";
import { DomService } from "@/infra/services/dom-service";
import { OpenAI4o } from "@/infra/services/openai4o";
import { InMemoryFileSystem } from "@/infra/services/in-memory-file-system";
import { PlaywrightScreenshoter } from "@/infra/services/playwright-screenshotter";
import { ChromiumBrowser } from "@/infra/services/chromium-browser";
import { LogReporter } from "@/infra/services/log-reporter";
import { EvaluationAgent } from "@/core/agents/evaluation-agent/evaluation-agent";

export class RunTestCase {
  async execute(startUrl: string, initialPrompt: string) {
    const fileSystem = new InMemoryFileSystem();
    const screenshotService = new PlaywrightScreenshoter(fileSystem);
    const browser = new ChromiumBrowser();

    const llm = new OpenAI4o();
    const reporter = new LogReporter();

    const evaluationAgent = new EvaluationAgent(
      llm,
      browser,
      screenshotService,
    );

    const managerAgent = new ManagerAgent(
      new TaskManagerService(),
      new DomService(screenshotService, browser),
      browser,
      llm,
      reporter,
      evaluationAgent,
    );

    const result = await managerAgent.launch(startUrl, initialPrompt);

    return result;
  }
}
