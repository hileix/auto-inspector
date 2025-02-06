import { TaskManagerService } from "@/core/services/task-manager-service";
import { ManagerAgent } from "@/core/agents/manager-agent/manager-agent";
import { DomService } from "@/infra/services/dom-service";
import { OpenAI4o } from "@/infra/services/openai4o";
import { InMemoryFileSystem } from "@/infra/services/in-memory-file-system";
import { PlaywrightScreenshoter } from "@/infra/services/playwright-screenshotter";
import { ChromiumBrowser } from "@/infra/services/chromium-browser";
import { EvaluationAgent } from "@/core/agents/evaluation-agent/evaluation-agent";
import {
  DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
  DEFAULT_AGENT_MAX_RETRIES,
} from "@/core/agents/manager-agent/manager-agent.config";
import { OraReporter } from "@/infra/services/ora-reporter";

export class RunTestCase {
  async execute(startUrl: string, initialPrompt: string) {
    const fileSystem = new InMemoryFileSystem();
    const screenshotService = new PlaywrightScreenshoter(fileSystem);
    const browser = new ChromiumBrowser();

    const llm = new OpenAI4o();
    const reporter = new OraReporter();

    const evaluationAgent = new EvaluationAgent(
      llm,
      browser,
      screenshotService,
    );

    const managerAgent = new ManagerAgent({
      taskManager: new TaskManagerService(),
      domService: new DomService(screenshotService, browser),
      browserService: browser,
      llmService: llm,
      reporter,
      evaluator: evaluationAgent,
      maxActionsPerTask: DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
      maxRetries: DEFAULT_AGENT_MAX_RETRIES,
    });

    const result = await managerAgent.launch(startUrl, initialPrompt);

    return result;
  }
}
