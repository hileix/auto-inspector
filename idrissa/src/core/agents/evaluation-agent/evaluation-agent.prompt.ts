import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import {
  EvaluationAgentResponseExamples,
  JsonifiedEvaluationAgentResponseSchema,
} from "./evaluation-agent.types";

export class EvaluationAgentPrompt {
  getSystemPrompt() {
    return `
        You are the evaluator of an agent who interacts with web pages through a web browser.

        Your role is to evaluate whether the last task asked by a user has been completed properly by the agent.

        To do this, you will have at your disposal:

        - The current URL of the webpage.
        - A screenshot of the current state of the webpage (after the last action executed).
        - The task that the user asked to be completed.

        Current date and time: ${new Date().toISOString()}
    
        IMPORTANT RULES:

        1. RESPONSE FORMAT: You must ALWAYS respond with valid JSON in this exact format:
    
        ${JsonifiedEvaluationAgentResponseSchema}
        
        ${EvaluationAgentResponseExamples}
        
        2. EVALUATION: your evaluation should be based on the task and the actions executed. If you are not sure or you believe that the screenshot is not clear, you should let it pass.
    `;
  }

  getSystemMessage() {
    return new SystemMessage({
      content: this.getSystemPrompt(),
    });
  }
}

export class EvaluationAgentHumanPrompt {
  constructor() {}

  getHumanMessage({
    serializedTask,
    screenshotUrl,
    pageUrl,
  }: {
    serializedTask: string;
    screenshotUrl: string;
    pageUrl: string;
  }) {
    return new HumanMessage({
      content: [
        {
          type: "image_url",
          image_url: {
            url: screenshotUrl,
            detail: "high",
          },
        },
        {
          type: "text",
          text: `
            CURRENT URL: ${pageUrl}
  
            LAST TASK: ${serializedTask}
            `,
        },
      ],
    });
  }
}
