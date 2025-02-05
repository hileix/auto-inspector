import { ManagerAgentAction } from "@/core/agents/manager-agent/manager-agent.types";

export interface Task {
  id: string;
  goal: string;
  actions: ManagerAgentAction[];
  status: "pending" | "completed" | "failed";
}

export class TaskManagerService {
  private tasks: Task[] = [];
  private endGoal: string | null = null;

  constructor() {}

  setEndGoal(endGoal: string) {
    this.endGoal = endGoal;
  }

  generateId() {
    return `${this.tasks.length + 1}`;
  }

  addCompletedTask(task: Omit<Task, "id" | "status">) {
    const index = this.tasks.findIndex((t) => t.goal === task.goal);

    if (index === -1) {
      this.tasks.push({
        id: this.generateId(),
        ...task,
        status: "completed",
      });
    } else {
      this.tasks[index]!.status = "completed";
      this.tasks[index]!.actions = task.actions;
    }
  }

  addPendingTask(task: Omit<Task, "id" | "status">) {
    this.tasks.push({
      id: this.generateId(),
      ...task,
      status: "pending",
    });
  }

  getSerializedTasks() {
    return JSON.stringify({
      endGoal: this.endGoal,
      latestTaskCompleted: this.tasks[this.tasks.length - 1] ?? null,
    });
  }

  getTasksForReport() {
    return this.tasks.map((task) => ({
      goal: task.goal,
      actions: task.actions.map((action) => ({
        name: action.name,
        status: task.status,
      })),
      status: task.status,
    }));
  }
}
