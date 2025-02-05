import { LLM } from "@/core/interfaces/llm.interface";
import {
  EvaluationAgentHumanPrompt,
  EvaluationAgentPrompt,
} from "./evaluation-agent.prompt";
import { Task } from "@/core/entities/task";
import { Browser } from "@/core/interfaces/browser.interface";
import { Screenshotter } from "@/core/interfaces/screenshotter.interface";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { EvaluationAgentResponse } from "./evaluation-agent.types";

export class EvaluationAgent {
  constructor(
    private readonly llm: LLM,
    private readonly browser: Browser,
    private readonly screenshotter: Screenshotter,
  ) {}

  async evaluate(task: Task): Promise<EvaluationAgentResponse> {
    const systemMessage = new EvaluationAgentPrompt().getSystemMessage();

    const screenshotUrl = await this.screenshotter.takeScreenshot(
      this.browser.getPage(),
    );

    const humanMessage = new EvaluationAgentHumanPrompt().getHumanMessage({
      serializedTask: task.serialize(),
      pageUrl: this.browser.getPageUrl(),
      screenshotUrl,
    });

    const parser = new JsonOutputParser<EvaluationAgentResponse>();

    const messages = [systemMessage, humanMessage];

    const response = await this.llm.invokeAndParse(messages, parser);

    return response;
  }
}
