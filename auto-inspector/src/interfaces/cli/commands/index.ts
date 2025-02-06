import { RunTestCase } from "@/app/usecases/run-test-case";
import { Command, program } from "commander";
import ora from "ora-classic";
import "dotenv/config";

if (!process.env.OPENAI_API_KEY) {
  console.error(
    "Error: OPENAI_API_KEY is not set in the environment variables.",
  );
  process.exit(1);
}

export const startTest = new Command("run:scenario")
  .description("Run a test scenario")
  .option("-u, --url <URL>", "The webpage to start testing")
  .option(
    "-s, --user-story <USER STORY DESCRIPTION>",
    "The description of the user story to test",
  )
  .action(async (options: { url: string; userStory: string }) => {
    // const spinner = ora("Running tests...").start();

    const runTestCase = new RunTestCase();

    if (!options.url) {
      console.log("--url argument is required");
      return;
    }

    if (!options.userStory) {
      console.log("--user-story argument is required");
      return;
    }

    const result = await runTestCase.execute(options.url, options.userStory);

    if (result.status === "success") {
      console.log("✅ Tests completed successfully!");
    } else {
      console.log("❌ Tests failed");
    }
  });

export default {
  startTest,
};
