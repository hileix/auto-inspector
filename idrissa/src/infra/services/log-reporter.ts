import { Reporter } from "@/core/interfaces/reporter.interface";

export class LogReporter implements Reporter {
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
