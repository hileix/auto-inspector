import { HumanMessage } from "@langchain/core/messages";

export class HumanPrompt {
  constructor() {}

  getHumanMessage({
    serializedTasks,
    stringifiedDomState,
    screenshotUrl,
    pageUrl,
  }: {
    serializedTasks: string;
    stringifiedDomState: string;
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

          EXTRACTED DOM ELEMENTS: ${stringifiedDomState} that you can match with the screenshot.

          TEST SCENARIO AND TASKS: ${serializedTasks}
          `,
        },
      ],
    });
  }
}
