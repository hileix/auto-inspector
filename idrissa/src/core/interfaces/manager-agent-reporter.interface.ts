export interface ManagerAgentReporter {
  reportProgress(task: any): void;
  info(message: string): void;
  success(message: string): void;
  error(message: string): void;
}
