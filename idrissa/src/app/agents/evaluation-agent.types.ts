import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const EvaluationAgentResponseSchema = z
  .object({
    isCompleted: z
      .boolean()
      .describe("Whether you think the task has been completed or not."),
    reason: z.string().describe("The reason for the completion or failure."),
  })
  .describe(
    'The result of your evaluation e.g. { isCompleted: true, reason: "The task has been completed." }',
  );

export type EvaluationAgentResponse = z.infer<
  typeof EvaluationAgentResponseSchema
>;

export const JsonifiedEvaluationAgentResponseSchema = JSON.stringify(
  zodToJsonSchema(EvaluationAgentResponseSchema, "ExpectedResponseFormat"),
);

export const EvaluationAgentResponseExamples = `
Example Response 1:
{
  "isCompleted": true,
  "reason": "The task has been completed."
}

Example Response 2:
{
  "isCompleted": false,
  "reason": "The firstName input is still empty."
}

Example Response 3:
{
  "isCompleted": false,
  "reason": "The popup is still visible and has not been closed."
}
`;
