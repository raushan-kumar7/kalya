import { Identifiable, ISOTimestamp, JobQueueName, JobStatus, JobType, UUID } from '../core';

export interface EnqueueJobOptions {
  queue?: JobQueueName;
  priority?: number;
  maxAttempts?: number;
  scheduledFor?: Date | string;
  delayMs?: number;
}

export interface JobRecord extends Identifiable {
  queue: JobQueueName;
  job_type: JobType;
  payload: Record<string, unknown>;
  status: JobStatus;
  priority: number;
  attempts: number;
  max_attempts: number;
  backoff_delay_ms: number;
  last_error?: string | null;
  scheduled_for?: ISOTimestamp | null;
  locked_at?: ISOTimestamp | null;
  locked_by?: string | null;
  completed_at?: ISOTimestamp | null;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

export interface SendEmailJobPayload {
  to: string | string[];
  subject: string;
  templateName: string;
  props: Record<string, unknown>;
  from?: string;
  userId?: UUID;
}

export interface DispatchPushJobPayload {
  userId: UUID;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: Record<string, unknown>;
}
