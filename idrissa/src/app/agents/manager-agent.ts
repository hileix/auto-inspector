import { Browser, Cookie, Page } from "playwright";
import { Task, TaskManager } from "../task-manager";
import { OpenAI4o } from "../../../../../openai-model";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { AgentPrompt } from "./prompts";
import { HumanPrompt } from "../human.prompt";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Coordinates, DomNode, DomService } from "../dom.service";
import { ManagerAction, ManagerResponse } from "./types";
import { ReporterInterface } from "@/reporters/reporter";
import { parseReadonlyDef } from "zod-to-json-schema";
import { MagicAssistantThoughts } from "@/common/schema";
import { Result } from "@/shared/result.type";
import { BrowserService } from "@/infra/services/browser-service.js";

export interface ManagerAgentReporter {
  updateScreenshot(): Promise<void>;
  reportProgress(task: MagicAssistantThoughts[]): void;
  info(message: string): void;
  success(message: string): void;
  error(message: string): void;
}

export class ManagerAgent {
  private isSuccess: boolean = false;
  private isFailure: boolean = false;
  private reason: string = "";

  constructor(
    private readonly page: Page,
    private readonly taskManager: TaskManager,
    private readonly domService: DomService,
    private readonly browserService: BrowserService,
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

  private async success(message: string) {
    this.reporter?.success(message);
  }

  private async error(message: string) {
    this.reporter?.error(message);
  }

  private async reportProgress() {
    const thoughts = this.taskManager.getTasksForReport();
    this.reporter?.reportProgress(thoughts);
  }

  private async reportAction(action: ManagerAction) {
    this.info(`[Performing action...]: ${JSON.stringify(action.name)}`);
  }

  private async reportActionDone(action: ManagerAction) {
    this.info(`[Action done...]: ${JSON.stringify(action.name)}`);
  }

  private async beforeAction(action: ManagerAction) {
    await this.reportAction(action);
    await this.reporter?.updateScreenshot();
  }

  private async afterAction(action: ManagerAction) {
    await this.reportActionDone(action);
    await this.reporter?.updateScreenshot();
    await this.reportProgress();
  }

  get isCompleted() {
    return this.isSuccess || this.isFailure;
  }

  async init(initialPrompt: string) {
    this.taskManager.initWithEndGoal(initialPrompt);

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

  async evaluateTasks(taskManager: TaskManager) {
    const model = OpenAI4o();

    const parser = new JsonOutputParser<ManagerResponse>();

    const prompt = new AgentPrompt(3).getSystemPrompt();

    const { screenshot, domState, selectorMap, stringifiedDomState } =
      await this.domService.getInteractiveElements();

    this.reporter?.updateScreenshot();

    const humanMessage = new HumanPrompt().getHumanMessage({
      serializedTasks: taskManager.getSerializedTasks(),
      screenshotUrl: screenshot,
      stringifiedDomState,
      pageUrl: this.browserService.getPageUrl(),
    });

    const messages = [
      new SystemMessage({
        content: prompt,
      }),
      humanMessage,
    ];

    const response = await model.invoke(messages);

    try {
      const parsedResponse = await parser.invoke(response);

      return parsedResponse;
    } catch (error) {
      console.error("Error parsing response:", error);
      return {
        currentState: {
          nextGoal: "Keep trying",
        },
        actions: [],
      };
    }
  }

  async executeActions(goal: string, actions: ManagerAction[]) {
    for (const action of actions) {
      try {
        await this.executeAction(action);
      } catch (error) {
        this.taskManager.addCompletedTask({
          goal,
          actions: actions,
          status: "failed",
        });
        return;
      }
    }

    this.taskManager.addCompletedTask({
      goal,
      actions: actions,
      status: "completed",
    });
    this.reportProgress();
  }

  private async executeAction(action: ManagerAction) {
    let coordinates: Coordinates | null = null;

    await this.beforeAction(action);

    switch (action.name) {
      case "clickElement":
        console.log("clickElement", action.params.index);
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
        await this.domService.highlightForSoM(this.browserService.getPage());
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
