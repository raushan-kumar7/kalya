import { JobQueueRow } from '@kalya/db';
import { JobQueueService } from './job-queue.service';
import { EmailJobHandler } from './handlers/email-job.handler';
import { PushJobHandler } from './handlers/push-job.handler';
import { log } from '@/logger';
import { generateId } from '@kalya/utils';

export class JobWorker {
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;
  private readonly workerId = `worker-${generateId()}`;

  constructor(
    private readonly jobQueue: JobQueueService,
    private readonly emailHandler: EmailJobHandler,
    private readonly pushHandler: PushJobHandler,
    private readonly pollIntervalMs: number = 2500
  ) {}

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    log.info(`Background Job Worker started [${this.workerId}]`);
    this.scheduleNextTick();
  }

  stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    log.info(`Background Job Worker stopped [${this.workerId}]`);
  }

  wakeUp(): void {
    if (!this.isRunning) return;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    // Instantly wake up worker on next tick
    setImmediate(() => {
      this.tick().catch((err) => {
        log.error('Unexpected error in JobWorker instant wakeUp tick', { error: String(err) });
      });
    });
  }

  private scheduleNextTick(delayMs?: number): void {
    if (!this.isRunning) return;
    this.timer = setTimeout(() => {
      this.tick().catch((err) => {
        log.error('Unexpected error in JobWorker tick', { error: String(err) });
      });
    }, delayMs ?? this.pollIntervalMs);
  }

  private async tick(): Promise<void> {
    if (!this.isRunning) return;

    // Dequeue batch of ready jobs
    const jobs = await this.jobQueue.dequeueBatch(this.workerId, 5);

    if (jobs.length > 0) {
      // Process batch concurrently so slow email requests don't block fast push notifications
      await Promise.allSettled(jobs.map((job) => this.processJob(job)));

      // If jobs were processed, yield briefly and drain remaining immediately
      this.scheduleNextTick(25);
    } else {
      // Queue is empty, wait for next poll interval or immediate wakeUp signal
      this.scheduleNextTick(this.pollIntervalMs);
    }
  }

  private async processJob(job: JobQueueRow): Promise<void> {
    const startTime = Date.now();
    log.debug(`Processing job #${job.id} [${job.queue}/${job.jobType}]`, {
      attempts: job.attempts,
    });

    try {
      const payload = job.payload as any;

      switch (job.jobType) {
        case 'SEND_EMAIL':
          await this.emailHandler.handle(payload);
          break;

        case 'DISPATCH_PUSH':
          await this.pushHandler.handle(payload);
          break;

        default:
          log.warn(`Unrecognized jobType: ${job.jobType}, marking complete`, { jobId: job.id });
          break;
      }

      await this.jobQueue.complete(job.id);
      log.debug(`Job #${job.id} completed successfully in ${Date.now() - startTime}ms`);
    } catch (err) {
      log.error(`Job #${job.id} failed: ${String(err)}`, {
        jobId: job.id,
        jobType: job.jobType,
      });

      await this.jobQueue.fail(job.id, err, job.attempts, job.maxAttempts, job.backoffDelayMs);
    }
  }
}
