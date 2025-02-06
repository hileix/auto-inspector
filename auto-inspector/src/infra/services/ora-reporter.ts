import { Reporter } from "@/core/interfaces/reporter.interface";
import { Task } from "@/core/entities/task";

import ora from "ora-classic";

export class OraReporter implements Reporter {
  private spinner: ora.Ora | undefined;

  reportProgress(thinking: boolean, task?: Task): void {
    if (!this.spinner || thinking || !task) {
      this.spinner = ora().start(task?.goal ?? "🧠 Thinking...");
      return;
    }

    switch (task.status) {
      case "pending":
        this.spinner.text = task.goal;
        break;
      case "completed":
        this.spinner.stopAndPersist({
          symbol: "✅",
          text: `${task.goal} - ${task.reason}`,
        });
        break;
      case "failed":
        this.spinner?.stopAndPersist({
          symbol: "❌",
          text: `${task.goal} - ${task.reason}`,
        });
        break;
    }
  }

  info(message: string): void {}

  success(message: string): void {}

  error(message: string): void {}
}
