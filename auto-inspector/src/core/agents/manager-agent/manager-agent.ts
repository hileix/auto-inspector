import { TaskManagerService } from "@/core/services/task-manager-service";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import {
  ManagerAgentPrompt,
  ManagerAgentHumanPrompt,
} from "./manager-agent.prompt";
import { DomService } from "@/infra/services/dom-service";
import {
  DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
  DEFAULT_AGENT_MAX_RETRIES,
} from "./manager-agent.config";
import { ManagerAgentAction, ManagerResponse } from "./manager-agent.types";
import { Browser, Coordinates } from "@/core/interfaces/browser.interface";
import { EvaluationAgent } from "../evaluation-agent/evaluation-agent";
import { Task } from "@/core/entities/task";
import { LLM } from "@/core/interfaces/llm.interface";
import { TestResult } from "@/core/entities/test-result";
import { AgentReporter } from "@/core/interfaces/agent-reporter.interface";
import { Variable } from "@/core/entities/variable";
import { VariableString } from "@/core/entities/variable-string";

export type ManagerAgentConfig = {
  maxActionsPerTask?: number;
  maxRetries?: number;
  variables: Variable[];

  taskManager: TaskManagerService;
  domService: DomService;
  browserService: Browser;
  llmService: LLM;
  evaluator: EvaluationAgent;
  reporter: AgentReporter;
};

export class ManagerAgent {
  private lastDomStateHash: string | null = null;
  private isSuccess: boolean = false;
  private isFailure: boolean = false;
  private reason: string = "";
  private retries: number = 0;
  private readonly variables: Variable[];

  private readonly maxActionsPerTask: number;
  private readonly maxRetries: number;

  private readonly taskManager: TaskManagerService;
  private readonly domService: DomService;
  private readonly browserService: Browser;
  private readonly llmService: LLM;
  private readonly reporter: AgentReporter;
  private readonly evaluator: EvaluationAgent;

  constructor(config: ManagerAgentConfig) {
    this.taskManager = config.taskManager;
    this.domService = config.domService;
    this.browserService = config.browserService;
    this.llmService = config.llmService;
    this.reporter = config.reporter;
    this.evaluator = config.evaluator;
    this.variables = config.variables;

    this.maxActionsPerTask =
      config.maxActionsPerTask ?? DEFAULT_AGENT_MAX_ACTIONS_PER_TASK;
    this.maxRetries = config.maxRetries ?? DEFAULT_AGENT_MAX_RETRIES;
  }

  private onSuccess(reason: string) {
    this.reporter.success(`Manager agent completed successfully: ${reason}`);
    this.isSuccess = true;
    this.reason = reason;
  }

  private onFailure(reason: string) {
    this.reporter.failure(`Manager agent failed: ${reason}`);
    this.isFailure = true;
    this.reason = reason;
  }

  private async beforeAction(action: ManagerAgentAction) {
    this.reporter.loading(`Performing action ${action.name}...`);
  }

  private async afterAction(action: ManagerAgentAction) {
    this.reporter.success(`Performing action ${action.name}...`);
  }

  private async incrementRetries() {
    this.retries += 1;
  }

  private async resetRetries() {
    this.retries = 0;
  }

  get isCompleted() {
    return this.isSuccess || this.isFailure;
  }

  async launch(startUrl: string, initialPrompt: string) {
    const vStartUrl = new VariableString(startUrl, this.variables);

    await this.browserService.launch(vStartUrl.dangerousValue());

    const vInitialPrompt = new VariableString(initialPrompt, this.variables);

    this.taskManager.setEndGoal(vInitialPrompt.publicValue());

    return this.run();
  }

  async run(): Promise<TestResult> {
    return new Promise(async (resolve) => {
      this.reporter.loading("Starting manager agent");

      while (!this.isCompleted) {
        if (this.retries >= this.maxRetries) {
          this.onFailure("Max retries reached");

          return resolve({
            status: "failed",
            reason:
              "Max number of retried reached. The agent was not able to complete the test.",
          });
        }

        this.reporter.loading("Defining next task...");

        const task = await this.defineNextTask();

        this.reporter.loading(`Executing task: ${task.goal}`);

        await this.executeTask(task);
      }

      /**
       * If the Manager Agent failed, then we return the failure reason immediately.
       */
      if (this.isFailure) {
        return resolve({
          status: "failed",
          reason: this.reason,
        });
      }

      await this.domService.resetHighlightElements();

      /**
       * If the Manager Agent completed the task, then we evaluate the test result.
       */
      const { status, reason } = await this.evaluator.evaluateTestResult(
        this.taskManager.getSerializedTasks(),
        this.taskManager.getEndGoal(),
      );

      return resolve({
        status,
        reason,
      });
    });
  }

  /**
   * Depending on the website dom states are too often, we need to find an alternative.
   */
  private async didDomStateChange() {
    return false;
    const { domStateHash: currentDomStateHash } =
      await this.domService.getInteractiveElements(false);

    return this.lastDomStateHash !== currentDomStateHash;
  }

  /**
   * Ensures that the triggerSuccess and triggerFailure actions are never called among other actions.
   * This is important because we need to reevaluate actions and ensure that the success or failure
   * actions are executed alone to properly determine the test result.
   */
  private ensureNoTriggerSuccessOrFailureAmongOtherActions(
    actions: ManagerAgentAction[],
  ) {
    if (actions.length < 2) {
      return actions;
    }

    return actions.filter(
      (action) =>
        action.name !== "triggerSuccess" && action.name !== "triggerFailure",
    );
  }

  async defineNextTask(): Promise<Task> {
    const parser = new JsonOutputParser<ManagerResponse>();

    const systemMessage = new ManagerAgentPrompt(
      this.maxActionsPerTask,
    ).getSystemMessage();

    const { screenshot, stringifiedDomState, domStateHash } =
      await this.domService.getInteractiveElements();

    this.lastDomStateHash = domStateHash;

    const humanMessage = new ManagerAgentHumanPrompt().getHumanMessage({
      serializedTasks: this.taskManager.getSerializedTasks(),
      screenshotUrl: screenshot,
      stringifiedDomState,
      pageUrl: this.browserService.getPageUrl(),
    });

    const messages = [systemMessage, humanMessage];

    try {
      const parsedResponse = await this.llmService.invokeAndParse(
        messages,
        parser,
      );

      const safeActions = this.ensureNoTriggerSuccessOrFailureAmongOtherActions(
        parsedResponse.actions,
      );

      return Task.InitPending(
        parsedResponse.currentState.nextGoal,
        safeActions,
      );
    } catch (error) {
      console.error("Error parsing agent response:", error);
      return Task.InitPending("Keep trying", []);
    }
  }

  async executeTask(task: Task) {
    for (const action of task.actions) {
      try {
        if (await this.didDomStateChange()) {
          task.cancel("Dom state changed, need to reevaluate.");
          this.reporter.info("Dom state changed, need to reevaluate.");
          return;
        }

        await this.executeAction(action);
        task.complete();
        this.resetRetries();
      } catch (error: any) {
        task.fail(error?.message ?? "Unknown error");
        this.incrementRetries();
      }
    }

    this.taskManager.add(task);

    this.reporter.success(task.goal);
  }

  private async executeAction(action: ManagerAgentAction) {
    let coordinates: Coordinates | null = null;

    await this.beforeAction(action);

    switch (action.name) {
      case "clickElement":
        coordinates = this.domService.getIndexSelector(action.params.index);

        if (!coordinates) {
          throw new Error("Index or coordinates not found");
        }

        await this.domService.resetHighlightElements();

        await this.domService.highlightElementPointer(coordinates);

        await this.browserService.mouseClick(coordinates.x, coordinates.y);

        await this.domService.resetHighlightElements();

        break;

      case "fillInput":
        coordinates = this.domService.getIndexSelector(action.params.index);

        if (!coordinates) {
          throw new Error("Index or coordinates not found");
        }

        await this.domService.highlightElementPointer(coordinates);
        const variableString = new VariableString(
          action.params.text,
          this.variables,
        );

        await this.browserService.fillInput(variableString, coordinates);
        await this.domService.resetHighlightElements();

        break;

      case "scrollDown":
        await this.browserService.scrollDown();
        await this.domService.resetHighlightElements();
        await this.domService.highlightElementWheel("down");

        break;

      case "scrollUp":
        await this.browserService.scrollUp();

        await this.domService.resetHighlightElements();
        await this.domService.highlightElementWheel("up");

        break;

      case "takeScreenshot":
        await this.domService.resetHighlightElements();
        await this.domService.highlightForSoM();
        break;

      case "goToUrl":
        await this.browserService.goToUrl(action.params.url);
        break;

      case "triggerSuccess":
        this.onSuccess(action.params.reason);
        break;

      case "triggerFailure":
        this.onFailure(action.params.reason);
        break;
    }

    await this.afterAction(action);
  }
}
