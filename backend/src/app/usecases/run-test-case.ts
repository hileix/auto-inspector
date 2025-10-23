import { TaskManagerService } from '@/core/services/task-manager-service';
import { ManagerAgent } from '@/core/agents/manager-agent/manager-agent';
import { DomService } from '@/infra/services/dom-service';
import { OpenAI4o } from '@/infra/services/openai4o';
import { InMemoryFileSystem } from '@/infra/services/in-memory-file-system';
import { PlaywrightScreenshoter } from '@/infra/services/playwright-screenshotter';
import { ChromiumBrowser } from '@/infra/services/chromium-browser';
import { EvaluationAgent } from '@/core/agents/evaluation-agent/evaluation-agent';
import {
  DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
  DEFAULT_AGENT_MAX_RETRIES,
} from '@/core/agents/manager-agent/manager-agent.config';
import { OraReporter } from '@/infra/services/ora-reporter';
import { Variable } from '@/core/entities/variable';
import { AgentReporter } from '@/core/interfaces/agent-reporter.interface';

export type RunTestCaseOptions = {
  managerAgentReporter?: AgentReporter;
  evaluationAgentReporter?: AgentReporter;
};

export class RunTestCase {
  async execute(
    startUrl: string,
    initialPrompt: string,
    options?: RunTestCaseOptions,
  ) {
    const fileSystem = new InMemoryFileSystem();
    const screenshotService = new PlaywrightScreenshoter(fileSystem);
    const browser = new ChromiumBrowser();

    const llm = new OpenAI4o();

    const managerReporter = options?.managerAgentReporter || new OraReporter('Manager Agent');
    const evaluatorReporter = options?.evaluationAgentReporter || new OraReporter('Evaluation Agent');

    const evaluationAgent = new EvaluationAgent(
      llm,
      browser,
      screenshotService,
      evaluatorReporter,
    );

    const managerAgent = new ManagerAgent({
      variables: [
        new Variable({
          name: 'user_email',
          value: 'demo@magicinspector.com',
          isSecret: false,
        }),
        new Variable({
          name: 'user_password',
          value: 'demopassword',
          isSecret: true,
        }),
      ],
      taskManager: new TaskManagerService(),
      domService: new DomService(screenshotService, browser),
      browserService: browser,
      llmService: llm,
      reporter: managerReporter,
      evaluator: evaluationAgent,
      maxActionsPerTask: DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
      maxRetries: DEFAULT_AGENT_MAX_RETRIES,
    });

    const result = await managerAgent.launch(startUrl, initialPrompt);

    browser.close();

    return result;
  }
}
