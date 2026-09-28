import { z } from 'zod';
import type {
  CacheHealthDetails,
  CacheHealthResult,
  DatabaseHealthDetails,
  DatabaseHealthResult,
  HealthCheckName,
  HealthCheckResult,
  HealthLivenessResponse,
  HealthReadinessResponse,
  HealthStatus,
  MailHealthDetails,
  MailHealthResult,
  StorageHealthDetails,
  StorageHealthResult,
  SystemHealthReport,
  SystemOperationalStatus,
} from '@kalya/types';

/**
 * Zod schema for health check operational status.
 */
export const HealthStatusSchema: z.ZodType<HealthStatus> = z.enum([
  'healthy',
  'degraded',
  'unhealthy',
]);

/**
 * Zod schema for system-wide operational state.
 */
export const SystemOperationalStatusSchema: z.ZodType<SystemOperationalStatus> = z.enum([
  'operational',
  'degraded',
  'down',
  'maintenance',
]);

/**
 * Zod schema for subsystem check identifiers.
 */
export const HealthCheckNameSchema: z.ZodType<HealthCheckName> = z.union([
  z.enum(['database', 'storage', 'mail', 'cache']),
  z.string(),
]);

/**
 * Helper to construct a typed HealthCheckResult schema.
 */
export const createHealthCheckResultSchema = <TDetails>(
  detailsSchema: z.ZodType<TDetails>
): z.ZodType<HealthCheckResult<TDetails>> =>
  z.object({
    name: HealthCheckNameSchema,
    status: HealthStatusSchema,
    latencyMs: z.number().nonnegative(),
    message: z.string().optional(),
    checkedAt: z.iso.datetime(),
    details: detailsSchema.optional(),
  });

/**
 * Database health check diagnostic details schema.
 */
export const DatabaseHealthDetailsSchema: z.ZodType<DatabaseHealthDetails> = z.object({
  driver: z.string(),
  writable: z.boolean().optional(),
  activeConnections: z.number().int().nonnegative().optional(),
  openTransactions: z.number().int().nonnegative().optional(),
  slowQueryCount: z.number().int().nonnegative().optional(),
});

/**
 * Storage health check diagnostic details schema.
 */
export const StorageHealthDetailsSchema: z.ZodType<StorageHealthDetails> = z.object({
  provider: z.union([z.enum(['local', 'cloudinary']), z.string()]),
  writable: z.boolean(),
  freeSpaceBytes: z.number().nonnegative().optional(),
  uploadDir: z.string().optional(),
});

/**
 * Mail delivery health check diagnostic details schema.
 */
export const MailHealthDetailsSchema: z.ZodType<MailHealthDetails> = z.object({
  provider: z.union([z.enum(['smtp', 'resend']), z.string()]),
  connected: z.boolean(),
  host: z.string().optional(),
});

/**
 * Cache health check diagnostic details schema.
 */
export const CacheHealthDetailsSchema: z.ZodType<CacheHealthDetails> = z.object({
  provider: z.string(),
  connected: z.boolean(),
  keyCount: z.number().int().nonnegative().optional(),
});

/**
 * Specific typed result schemas for each subsystem.
 */
export const DatabaseHealthResultSchema: z.ZodType<DatabaseHealthResult> =
  createHealthCheckResultSchema(DatabaseHealthDetailsSchema);

export const StorageHealthResultSchema: z.ZodType<StorageHealthResult> =
  createHealthCheckResultSchema(StorageHealthDetailsSchema);

export const MailHealthResultSchema: z.ZodType<MailHealthResult> =
  createHealthCheckResultSchema(MailHealthDetailsSchema);

export const CacheHealthResultSchema: z.ZodType<CacheHealthResult> =
  createHealthCheckResultSchema(CacheHealthDetailsSchema);

/**
 * Generic result schema for an individual subsystem health check.
 */
export const HealthCheckResultSchema: z.ZodType<HealthCheckResult<unknown>> =
  createHealthCheckResultSchema(z.unknown());

/**
 * Zod Schema for GET /health/live (Liveness Probe).
 */
export const HealthLivenessResponseSchema: z.ZodType<HealthLivenessResponse> = z.object({
  status: z.literal('alive'),
  uptimeSeconds: z.number().int().nonnegative(),
  timestamp: z.iso.datetime(),
});

/**
 * Zod Schema for GET /health/ready (Readiness Probe).
 */
export const HealthReadinessResponseSchema: z.ZodType<HealthReadinessResponse> = z.object({
  status: z.enum(['ready', 'not_ready']),
  service: z.string(),
  environment: z.string(),
  checks: z.record(z.string(), HealthStatusSchema),
  timestamp: z.iso.datetime(),
});

/**
 * Zod Schema for GET /health (Comprehensive Diagnostics).
 */
export const SystemHealthReportSchema: z.ZodType<SystemHealthReport> = z.object({
  status: SystemOperationalStatusSchema,
  service: z.string(),
  environment: z.string(),
  version: z.string(),
  message: z.string(),
  uptimeSeconds: z.number().int().nonnegative(),
  timestamp: z.iso.datetime(),
  checks: z
    .object({
      database: DatabaseHealthResultSchema.optional(),
      storage: StorageHealthResultSchema.optional(),
      mail: MailHealthResultSchema.optional(),
      cache: CacheHealthResultSchema.optional(),
    })
    .catchall(HealthCheckResultSchema.optional()),
});

// Inferred Types from Zod Schemas
export type HealthLivenessResponseOutput = z.infer<typeof HealthLivenessResponseSchema>;
export type HealthReadinessResponseOutput = z.infer<typeof HealthReadinessResponseSchema>;
export type SystemHealthReportOutput = z.infer<typeof SystemHealthReportSchema>;
export type DatabaseHealthResultOutput = z.infer<typeof DatabaseHealthResultSchema>;
export type StorageHealthResultOutput = z.infer<typeof StorageHealthResultSchema>;
export type MailHealthResultOutput = z.infer<typeof MailHealthResultSchema>;
export type CacheHealthResultOutput = z.infer<typeof CacheHealthResultSchema>;
