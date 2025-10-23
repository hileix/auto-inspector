import { Controller, Post, Body, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { RunTestCase } from '@/app/usecases/run-test-case';
import { RunTestDto } from './dtos/run.test.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('test.run')
  async runTest(@Body() body: RunTestDto) {
    const job = this.jobsService.createJob();
    const runTestCase = new RunTestCase();

    /**
     * This is a POC, we'll improve that later.
     */
    runTestCase.execute(body.startUrl, body.userStory, {
      managerAgentReporter: job.managerAgentReporter,
      evaluationAgentReporter: job.evaluationAgentReporter,
    })
      .then(() => {
        this.jobsService.completeJob(job.id, 'completed');
      })
      .catch((error) => {
        console.error(error);
        this.jobsService.completeJob(job.id, 'failed');
      });

    return { 
      jobId: job.id,
      sessionUrl: `ws://localhost:6080/websockify`, 
      password: 'secret' 
    };
  }

  @Get(':jobId/progress')
  async getJobProgress(@Param('jobId') jobId: string) {
    const progress = this.jobsService.getJobProgress(jobId);
    
    if (progress === null) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }

    const job = this.jobsService.getJob(jobId);
    
    return {
      jobId,
      status: job?.status,
      logs: progress,
      formattedLogs: progress.map((log) => log.message).join('\n'),
    };
  }
}
