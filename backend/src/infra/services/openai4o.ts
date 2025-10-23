import OpenAI from "openai";
import "dotenv/config";
import { LLM } from "@/core/interfaces/llm.interface";
import { BaseMessage } from "@langchain/core/messages";
import { JsonOutputParser } from "@langchain/core/output_parsers";

export class OpenAI4o implements LLM {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async invokeAndParse<T extends Record<string, any>>(
    messages: BaseMessage[],
    parser: JsonOutputParser<T>,
  ): Promise<T> {
    const completion = await this.client.chat.completions.create({
      model: "Gemini-2.5-Pro",
      temperature: 0,
      messages: messages.map((msg) => ({
        role: msg._getType() as "user" | "assistant" | "system",
        content: msg.content as string,
      })),
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    return parser.invoke({ content } as any);
  }
}
