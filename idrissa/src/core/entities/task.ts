import { ManagerAgentAction } from "@/app/agents/manager-agent.types.js";

export type InitTaskParams = {
  id: string;
  goal: string;
  actions: ManagerAgentAction[];
  status: "pending" | "completed" | "failed";
};

export class Task {
  constructor(
    private readonly id: string,
    private readonly goal: string,
    private readonly actions: ManagerAgentAction[],
    private readonly status: "pending" | "completed" | "failed",
  ) {}

  public serialize(): string {
    return JSON.stringify({
      id: this.id,
      goal: this.goal,
      actions: this.actions,
      status: this.status,
    });
  }
}
