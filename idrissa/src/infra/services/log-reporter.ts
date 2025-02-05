import { ManagerAgentReporter } from "@/core/interfaces/manager-agent-reporter.interface";

export class LogReporter implements ManagerAgentReporter {
  reportProgress(task: any): void {
    console.log(task);
  }

  info(message: string): void {
    console.log(message);
  }

  success(message: string): void {
    console.log(message);
  }

  error(message: string): void {
    console.error(message);
  }
}
