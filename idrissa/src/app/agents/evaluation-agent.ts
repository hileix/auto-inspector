import { LLMService } from "@/infra/services/llm-service";
import { Task } from "langchain/experimental/babyagi";
import { EvaluationAgentResponse } from "./evaluation-agent.types";

export class EvaluationAgent {
  constructor(private readonly llmService: LLMService) {}

  evaluate(task: Task): Promise<Task> {
    const prompt = `
      You are an evaluation agent that evaluates whether a task has been completed.
      `;

    this.llmService.invokeAndParse();
  }
}
