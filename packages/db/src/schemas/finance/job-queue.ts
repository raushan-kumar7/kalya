import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAt, idCol, nullableTimestamp, updatedAt } from '../_columns';

export const jobQueue = sqliteTable(
  'job_queue',
  {
    id: idCol(),
    queue: text('queue', {
      enum: ['email', 'notification', 'scheduled', 'system'],
    })
      .notNull()
      .default('notification'),
    jobType: text('job_type', {
      enum: [
        'SEND_EMAIL',
        'DISPATCH_PUSH',
        'SYNC_IN_APP_ALERT',
        'EVALUATE_BUDGET_THRESHOLDS',
        'DISPATCH_SPLIT_REMINDERS',
        'GENERATE_WEEKLY_DIGEST',
        'COMPILE_MONTHLY_STATEMENT',
        'CLEANUP_STALE_TOKENS',
      ],
    }).notNull(),
    payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, unknown>>(),
    status: text('status', {
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    })
      .notNull()
      .default('pending'),
    priority: integer('priority').notNull().default(0),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(3),
    backoffDelayMs: integer('backoff_delay_ms').notNull().default(5000),
    lastError: text('last_error'),
    scheduledFor: nullableTimestamp('scheduled_for'),
    lockedAt: nullableTimestamp('locked_at'),
    lockedBy: text('locked_by'),
    completedAt: nullableTimestamp('completed_at'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('job_queue_status_sched_prio_idx').on(t.status, t.scheduledFor, t.priority),
    index('job_queue_queue_status_idx').on(t.queue, t.status),
  ]
);

export type JobQueueRow = typeof jobQueue.$inferSelect;
export type JobQueueEntity = typeof jobQueue.$inferInsert;
