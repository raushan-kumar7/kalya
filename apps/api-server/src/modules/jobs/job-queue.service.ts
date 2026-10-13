import { and, desc, eq, isNull, lte, or, sql, jobQueue, type JobQueueRow } from '@kalya/db';
import { EnqueueJobOptions, JobQueueName, JobType } from '@kalya/types';
import { log } from '@/logger';

export class JobQueueService {
  private onJobEnqueuedCallbacks: Array<() => void> = [];

  constructor(private readonly db: any) {}

  /**
   * Register a wake-up callback triggered immediately when an urgent job is enqueued.
   */
  onJobEnqueued(cb: () => void): void {
    this.onJobEnqueuedCallbacks.push(cb);
  }

  private notifyEnqueued(): void {
    for (const cb of this.onJobEnqueuedCallbacks) {
      try {
        cb();
      } catch {
        // Safe fallback
      }
    }
  }

  /**
   * Enqueue a background job for immediate or scheduled asynchronous execution.
   */
  async enqueue(
    queue: JobQueueName,
    jobType: JobType,
    payload: Record<string, unknown>,
    options?: EnqueueJobOptions
  ): Promise<JobQueueRow> {
    const scheduledFor = options?.delayMs
      ? new Date(Date.now() + options.delayMs)
      : options?.scheduledFor
        ? new Date(options.scheduledFor)
        : new Date();

    const [job] = await this.db
      .insert(jobQueue)
      .values({
        queue,
        jobType,
        payload,
        status: 'pending',
        priority: options?.priority ?? 0,
        maxAttempts: options?.maxAttempts ?? 3,
        scheduledFor,
      })
      .returning();

    log.debug('Background job enqueued', {
      jobId: job.id,
      queue,
      jobType,
      scheduledFor: scheduledFor.toISOString(),
    });

    // If scheduled for immediate run (no future delay), instantly wake up worker
    if (!options?.delayMs && (!options?.scheduledFor || scheduledFor <= new Date())) {
      this.notifyEnqueued();
    }

    return job;
  }

  /**
   * Atomically dequeue and lock up to `limit` pending jobs for concurrent execution.
   */
  async dequeueBatch(workerId: string, limit: number = 5): Promise<JobQueueRow[]> {
    const now = new Date();

    const candidates = await this.db
      .select({ id: jobQueue.id })
      .from(jobQueue)
      .where(
        and(
          eq(jobQueue.status, 'pending'),
          or(isNull(jobQueue.scheduledFor), lte(jobQueue.scheduledFor, now)),
          or(
            isNull(jobQueue.lockedAt),
            lte(jobQueue.lockedAt, new Date(Date.now() - 5 * 60 * 1000))
          )
        )
      )
      .orderBy(desc(jobQueue.priority), jobQueue.createdAt)
      .limit(limit);

    if (!candidates.length) return [];

    const lockedJobs: JobQueueRow[] = [];
    for (const candidate of candidates) {
      const [locked] = await this.db
        .update(jobQueue)
        .set({
          status: 'processing',
          lockedAt: now,
          lockedBy: workerId,
          attempts: sql`${jobQueue.attempts} + 1`,
        })
        .where(and(eq(jobQueue.id, candidate.id), eq(jobQueue.status, 'pending')))
        .returning();

      if (locked) lockedJobs.push(locked);
    }

    return lockedJobs;
  }

  /**
   * Atomically dequeue and lock the next eligible pending job (FIFO ordered by priority desc).
   */
  async dequeueNext(workerId: string): Promise<JobQueueRow | null> {
    const now = new Date();

    // Find next eligible candidate job
    const [candidate] = await this.db
      .select({ id: jobQueue.id })
      .from(jobQueue)
      .where(
        and(
          eq(jobQueue.status, 'pending'),
          or(isNull(jobQueue.scheduledFor), lte(jobQueue.scheduledFor, now)),
          or(
            isNull(jobQueue.lockedAt),
            // Lock expiration safety: if locked > 5 mins ago, worker crashed or timed out
            lte(jobQueue.lockedAt, new Date(Date.now() - 5 * 60 * 1000))
          )
        )
      )
      .orderBy(desc(jobQueue.priority), jobQueue.createdAt)
      .limit(1);

    if (!candidate) return null;

    // Atomically lock and mark as processing
    const [lockedJob] = await this.db
      .update(jobQueue)
      .set({
        status: 'processing',
        lockedAt: now,
        lockedBy: workerId,
        attempts: sql`${jobQueue.attempts} + 1`,
      })
      .where(and(eq(jobQueue.id, candidate.id), eq(jobQueue.status, 'pending')))
      .returning();

    return lockedJob ?? null;
  }

  /**
   * Mark job completed successfully.
   */
  async complete(jobId: string): Promise<void> {
    await this.db
      .update(jobQueue)
      .set({
        status: 'completed',
        lockedAt: null,
        lockedBy: null,
        completedAt: new Date(),
      })
      .where(eq(jobQueue.id, jobId));
  }

  /**
   * Record failure and apply exponential backoff retry or dead-letter state.
   */
  async fail(
    jobId: string,
    error: unknown,
    attempts: number,
    maxAttempts: number,
    backoffMs: number = 5000
  ): Promise<void> {
    const errorMsg = error instanceof Error ? error.stack || error.message : String(error);

    if (attempts >= maxAttempts) {
      // Dead-letter: exhausted max retry attempts
      await this.db
        .update(jobQueue)
        .set({
          status: 'failed',
          lockedAt: null,
          lockedBy: null,
          lastError: errorMsg,
        })
        .where(eq(jobQueue.id, jobId));

      log.error('Background job permanently failed (max attempts exceeded)', {
        jobId,
        attempts,
        error: errorMsg,
      });
    } else {
      // Exponential backoff: backoffMs * (2 ^ (attempts - 1))
      const nextDelay = backoffMs * Math.pow(2, attempts - 1);
      const nextRun = new Date(Date.now() + nextDelay);

      await this.db
        .update(jobQueue)
        .set({
          status: 'pending',
          lockedAt: null,
          lockedBy: null,
          scheduledFor: nextRun,
          lastError: errorMsg,
        })
        .where(eq(jobQueue.id, jobId));

      log.warn('Background job failed, scheduled for retry', {
        jobId,
        nextAttempt: attempts + 1,
        maxAttempts,
        nextRun: nextRun.toISOString(),
        error: errorMsg,
      });
    }
  }
}
