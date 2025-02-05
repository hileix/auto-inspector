import { TaskManagerService } from "@/core/services/task-manager-service";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import {
  ManagerAgentPrompt,
  ManagerAgentHumanPrompt,
} from "./manager-agent.prompt";
import { DomService } from "@/infra/services/dom-service";
import { BrowserService, Coordinates } from "@/infra/services/browser-service";
import { LLMService } from "@/infra/services/llm-service";
import { DEFAULT_AGENT_RETRY_COUNT } from "./manager-agent.config";
import { ManagerAgentAction, ManagerResponse } from "./manager-agent.types";
import { ManagerAgentReporter } from "@/core/interfaces/manager-agent-reporter.interface";

export class ManagerAgent {
  private isSuccess: boolean = false;
  private isFailure: boolean = false;
  private reason: string = "";

  constructor(
    private readonly taskManager: TaskManagerService,
    private readonly domService: DomService,
    private readonly browserService: BrowserService,
    private readonly llmService: LLMService,
    private readonly reporter?: ManagerAgentReporter,
  ) {}

  private onSuccess(reason: string) {
    this.reporter?.success(`Manager agent completed successfully: ${reason}`);
    this.isSuccess = true;
    this.reason = reason;
  }

  private onFailure(reason: string) {
    this.reporter?.error(`Manager agent failed: ${reason}`);
    this.isFailure = true;
    this.reason = reason;
  }

  private async info(message: string) {
    this.reporter?.info(message);
  }

  private async reportProgress() {
    const thoughts = this.taskManager.getTasksForReport();
    this.reporter?.reportProgress(thoughts);
  }

  private async reportAction(action: ManagerAgentAction) {
    this.info(`[Performing action...]: ${JSON.stringify(action.name)}`);
  }

  private async reportActionDone(action: ManagerAgentAction) {
    this.info(`[Action done...]: ${JSON.stringify(action.name)}`);
  }

  private async beforeAction(action: ManagerAgentAction) {
    await this.reportAction(action);
  }

  private async afterAction(action: ManagerAgentAction) {
    await this.reportActionDone(action);
    await this.reportProgress();
  }

  get isCompleted() {
    return this.isSuccess || this.isFailure;
  }

  async launch(startUrl: string, initialPrompt: string) {
    await this.browserService.launch(startUrl);

    this.taskManager.setEndGoal(initialPrompt);

    return this.run();
  }

  async run(): Promise<{
    status: "success" | "failure";
    reason: string;
  }> {
    return new Promise(async (resolve, reject) => {
      this.reporter?.info("Starting manager agent");

      while (!this.isCompleted) {
        const response = await this.evaluateTasks(this.taskManager);

        this.taskManager.addPendingTask({
          goal: response.currentState.nextGoal,
          actions: response.actions,
        });

        await this.reportProgress();

        await this.executeActions(
          response.currentState.nextGoal,
          response.actions,
        );
      }

      resolve({
        status: this.isSuccess ? "success" : "failure",
        reason: this.reason,
      });
    });
  }

  async evaluateTasks(taskManager: TaskManagerService) {
    const parser = new JsonOutputParser<ManagerResponse>();

    const systemMessage = new ManagerAgentPrompt(
      DEFAULT_AGENT_RETRY_COUNT,
    ).getSystemMessage();

    const { screenshot, stringifiedDomState } =
      await this.domService.getInteractiveElements();

    const humanMessage = new ManagerAgentHumanPrompt().getHumanMessage({
      serializedTasks: taskManager.getSerializedTasks(),
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

      return parsedResponse;
    } catch (error) {
      console.error("Error parsing agent response:", error);
      return {
        currentState: {
          nextGoal: "Keep trying",
        },
        actions: [],
      };
    }
  }

  async executeActions(goal: string, actions: ManagerAgentAction[]) {
    for (const action of actions) {
      try {
        await this.executeAction(action);
      } catch (error) {
        this.taskManager.addCompletedTask({
          goal,
          actions: actions,
        });
        return;
      }
    }

    this.taskManager.addCompletedTask({
      goal,
      actions: actions,
    });
    this.reportProgress();
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
        console.log("fillInput", action.params.index);
        coordinates = this.domService.getIndexSelector(action.params.index);

        if (!coordinates) {
          throw new Error("Index or coordinates not found");
        }

        await this.domService.highlightElementPointer(coordinates);
        await this.browserService.fillInput(action.params.text, coordinates);
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
