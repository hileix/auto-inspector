export class RunTestCase {
  async execute(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("RunTestCase");
  }
}
