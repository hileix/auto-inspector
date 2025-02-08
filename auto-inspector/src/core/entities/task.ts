import { ManagerAgentAction } from "@/core/agents/manager-agent/manager-agent.types";

export class Task {
  constructor(
    public readonly id: string,
    public readonly goal: string,
    readonly actions: ManagerAgentAction[],
    private _status: "pending" | "completed" | "failed" | "partially_completed",
    private _reason: string | undefined = undefined,
  ) {}

  static InitPending(goal: string, actions: ManagerAgentAction[]) {
    return new Task(crypto.randomUUID(), goal, actions, "pending");
  }

  get status() {
    return this._status;
  }

  get reason() {
    return this._reason;
  }

  cancel(reason: string) {
    this._status = "partially_completed";
    this._reason = reason;
  }

  complete() {
    this._status = "completed";
  }

  fail(reason: string) {
    this._status = "failed";
    this._reason = reason;
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
