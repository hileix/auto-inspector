import { Injectable } from '@nestjs/common';
import { ProgressReporter, SharedProgressRepository, JobProgressLog } from './progress-reporter';
import { v4 as uuidv4 } from 'uuid';

export interface JobInfo {
  id: string;
  progressRepository: SharedProgressRepository;
  managerAgentReporter: ProgressReporter;
  evaluationAgentReporter: ProgressReporter;
  startTime: number;
  endTime?: number;
  status: 'running' | 'completed' | 'failed';
}

@Injectable()
export class JobsService {
  private jobs: Map<string, JobInfo> = new Map();

  createJob(): JobInfo {
    const jobId = uuidv4();
    const progressRepository = new SharedProgressRepository();
    const job: JobInfo = {
      id: jobId,
      progressRepository,
      managerAgentReporter: new ProgressReporter('Manager Agent', progressRepository),
      evaluationAgentReporter: new ProgressReporter('Evaluation Agent', progressRepository),
      startTime: Date.now(),
      status: 'running',
    };
    this.jobs.set(jobId, job);
    return job;
  }

  getJob(jobId: string): JobInfo | undefined {
    return this.jobs.get(jobId);
  }

  getJobProgress(jobId: string): JobProgressLog[] | null {
    const job = this.jobs.get(jobId);
    if (!job) {
      return null;
    }
    return job.progressRepository.getLogs();
  }

  completeJob(jobId: string, status: 'completed' | 'failed') {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = status;
      job.endTime = Date.now();
    }
  }
}
