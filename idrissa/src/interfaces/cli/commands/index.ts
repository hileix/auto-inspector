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

export const startTest = new Command("test:start")
  .description("Start a test execution")
  .option("-u, --url <URL>", "The webpage to start testing")
  .option("-d, --description <DESCRIPTION>", "The description of the test")
  .action(async (options: { url: string; description: string }) => {
    const spinner = ora("Running tests...").start();

    const runTestCase = new RunTestCase();

    if (!options.url) {
      spinner.fail("URL is required");
      return;
    }

    if (!options.description) {
      spinner.fail("Description is required");
      return;
    }

    const result = await runTestCase.execute(options.url, options.description);

    if (result.status === "success") {
      spinner.succeed("Tests completed");
    } else {
      spinner.fail("Tests failed");
    }
  });

export default {
  startTest,
};
