import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage } from "@langchain/core/messages";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import "dotenv/config";

const OpenAI4o = () => {
  return new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY!,
  });
};

export class LLMService {
  private model: ChatOpenAI;

  constructor() {
    this.model = OpenAI4o();
  }

  async invokeAndParse<T extends Record<string, any>>(
    messages: BaseMessage[],
    parser: JsonOutputParser<T>,
  ): Promise<T> {
    const response = await this.model.invoke(messages);

    return parser.invoke(response);
  }
}
