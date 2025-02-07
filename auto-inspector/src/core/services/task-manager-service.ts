import { Task } from "@/core/entities/task";

export class TaskManagerService {
  private tasks: Task[] = [];
  private endGoal: string | null = null;

  constructor() {}

  setEndGoal(endGoal: string) {
    this.endGoal = endGoal;
  }

  getEndGoal() {
    return this.endGoal!;
  }

  generateId() {
    return `${this.tasks.length + 1}`;
  }

  add(task: Task) {
    this.tasks.push(task);
  }

  getLatestTask() {
    return this.tasks[this.tasks.length - 1] ?? null;
  }

  getSerializedTasks() {
    return JSON.stringify({
      endGoal: this.endGoal,
      latestTaskCompleted: this.getLatestTask()?.asObject(),
    });
  }
}
