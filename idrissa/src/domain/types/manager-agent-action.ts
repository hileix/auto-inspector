import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export const ManagerAgentActionSchema = z
  .union([
    z.object({
      name: z.literal("clickElement"),
      params: z.object({
        index: z.number(),
      }),
    }),
    z.object({
      name: z.literal("fillInput"),
      params: z.object({
        index: z.number(),
        text: z.string(),
      }),
    }),
    z.object({
      name: z.literal("scrollDown"),
    }),
    z.object({
      name: z.literal("scrollUp"),
    }),
    z.object({
      name: z.literal("goToUrl"),
      params: z.object({
        url: z.string(),
      }),
    }),
    z.object({
      name: z.literal("done"),
      params: z.object({
        result: z.string(),
      }),
    }),
    z.object({
      name: z.literal("takeScreenshot"),
    }),
    z.object({
      name: z.literal("triggerSuccess"),
      params: z.object({
        reason: z.string(),
      }),
    }),
    z.object({
      name: z.literal("triggerFailure"),
      params: z.object({
        reason: z.string(),
      }),
    }),
  ])
  .describe(
    'The action to be executed. e.g. { name: "clickElement", params: { index: "login button" } }',
  );

export type ManagerAgentAction = z.infer<typeof ManagerAgentActionSchema>;
