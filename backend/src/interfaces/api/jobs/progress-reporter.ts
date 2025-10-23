import { AgentReporter } from '@/core/interfaces/agent-reporter.interface';

export interface JobProgressLog {
  timestamp: number;
  message: string;
}

/**
 * Shared progress repository for capturing logs from multiple agents
 */
export class SharedProgressRepository {
  private logs: JobProgressLog[] = [];

  addLog(agentName: string, symbol: string, message: string) {
    const formattedMessage = `[${agentName}] ${symbol} ${message}`;
    this.logs.push({
      timestamp: Date.now(),
      message: formattedMessage,
    });
    console.log(formattedMessage);
  }

  getLogs(): JobProgressLog[] {
    return this.logs;
  }

  getFormattedLogs(): string {
    return this.logs.map((log) => log.message).join('\n');
  }
}

/**
 * Reporter that stores logs in a shared repository with a specific agent name
 */
export class ProgressReporter implements AgentReporter {
  constructor(
    private readonly name: string,
    private readonly repository: SharedProgressRepository,
  ) {}

  success(message: string): void {
    this.repository.addLog(this.name, '✅', message);
  }

  failure(message: string): void {
    this.repository.addLog(this.name, '❌', message);
  }

  loading(message: string): void {
    this.repository.addLog(this.name, '⏳', message);
  }

  info(message: string): void {
    this.repository.addLog(this.name, '💡', message);
  }
}


