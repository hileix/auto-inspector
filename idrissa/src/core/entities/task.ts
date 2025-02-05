import { ManagerAgentAction } from "@/core/agents/manager-agent/manager-agent.types";

export class Task {
  private reason?: string;

  constructor(
    private id: string,
    private goal: string,
    readonly actions: ManagerAgentAction[],
    private status: "pending" | "completed" | "failed",
  ) {}

  static InitPending(goal: string, actions: ManagerAgentAction[]) {
    return new Task(crypto.randomUUID(), goal, actions, "pending");
  }

  complete(reason: string) {
    this.status = "completed";
    this.reason = reason;
  }

  fail(reason: string) {
    this.status = "failed";
    this.reason = reason;
  }

  public serialize(): string {
    return JSON.stringify({
      id: this.id,
      goal: this.goal,
      actions: this.actions,
      status: this.status,
      reason: this.reason,
    });
  }

  public asObject() {
    return {
      id: this.id,
      goal: this.goal,
      actions: this.actions,
      status: this.status,
      reason: this.reason,
    };
  }
}
