import type { HealthCheckName, HealthStatus, ISOTimestamp, SystemOperationalStatus } from '@/core';

/**
 * Standard result contract for an individual subsystem health check.
 */
export interface HealthCheckResult<TDetails = unknown> {
  /** Name of the subsystem or dependency evaluated */
  name: HealthCheckName;
  /** Operational status of the subsystem */
  status: HealthStatus;
  /** Latency of the check execution in milliseconds */
  latencyMs: number;
  /** Informative message or error description if degraded or unhealthy */
  message?: string;
  /** ISO timestamp when the check was performed */
  checkedAt: ISOTimestamp;
  /** Additional component-specific diagnostic metadata */
  details?: TDetails;
}

/**
 * Backward-compatible alias for HealthCheckResult.
 */
export type DependencyCheckResult<TDetails = unknown> = HealthCheckResult<TDetails>;

/**
 * Diagnostic details specific to database health checks.
 */
export interface DatabaseHealthDetails {
  /** Underlying database engine / driver (e.g. 'sqlite', 'better-sqlite3', 'pg') */
  driver: string;
  /** Whether the database accepts write operations */
  writable?: boolean;
  /** Active connection pool count */
  activeConnections?: number;
  /** Number of open active transactions */
  openTransactions?: number;
  /** Count of slow queries detected */
  slowQueryCount?: number;
}

/**
 * Health check result for database subsystems.
 */
export type DatabaseHealthResult = HealthCheckResult<DatabaseHealthDetails>;

/**
 * Diagnostic details specific to file storage health checks (Local / Cloudinary).
 */
export interface StorageHealthDetails {
  /** Storage backend provider */
  provider: 'local' | 'cloudinary' | (string & {});
  /** Whether the storage destination is writable */
  writable: boolean;
  /** Free disk space in bytes (for local storage) */
  freeSpaceBytes?: number;
  /** Configured destination directory */
  uploadDir?: string;
}

/**
 * Health check result for storage subsystems.
 */
export type StorageHealthResult = HealthCheckResult<StorageHealthDetails>;

/**
 * Diagnostic details specific to email delivery health checks (SMTP / Resend).
 */
export interface MailHealthDetails {
  /** Active mail service provider */
  provider: 'smtp' | 'resend' | (string & {});
  /** Connection / reachability status */
  connected: boolean;
  /** Mail server host or API target */
  host?: string;
}

/**
 * Health check result for mail delivery subsystems.
 */
export type MailHealthResult = HealthCheckResult<MailHealthDetails>;

/**
 * Diagnostic details specific to caching subsystems (e.g. Redis / In-Memory).
 */
export interface CacheHealthDetails {
  /** Cache provider identifier */
  provider: string;
  /** Connection status */
  connected: boolean;
  /** Approximate number of cached items */
  keyCount?: number;
}

/**
 * Health check result for cache subsystems.
 */
export type CacheHealthResult = HealthCheckResult<CacheHealthDetails>;

/**
 * Liveness Probe Response DTO (e.g. GET /health/live).
 * Intended for container orchestrators to confirm process responsiveness without dependency overhead.
 */
export interface HealthLivenessResponse {
  status: 'alive';
  uptimeSeconds: number;
  timestamp: ISOTimestamp;
}

/**
 * Backward-compatible alias for HealthLivenessResponse.
 */
export type LivenessResponse = HealthLivenessResponse;

/**
 * Readiness Probe Response DTO (e.g. GET /health/ready).
 * Intended for ingress / load balancers to determine whether traffic should be routed to this instance.
 */
export interface HealthReadinessResponse {
  status: 'ready' | 'not_ready';
  service: string;
  environment: string;
  checks: Record<string, HealthStatus>;
  timestamp: ISOTimestamp;
}

/**
 * Backward-compatible alias for HealthReadinessResponse.
 */
export type ReadinessResponse = HealthReadinessResponse;

/**
 * Detailed System Health Report (e.g. GET /health).
 * Comprehensive operational diagnostic summary without heavy telemetry metrics.
 */
export interface SystemHealthReport {
  /** Overall operational status across all subsystems */
  status: SystemOperationalStatus;
  /** Service identifier (e.g. 'kalya-api') */
  service: string;
  /** Deployment environment */
  environment: string;
  /** API / application semantic version */
  version: string;
  /** Human-readable status summary */
  message: string;
  /** Server uptime in seconds */
  uptimeSeconds: number;
  /** ISO timestamp when the health evaluation was finalized */
  timestamp: ISOTimestamp;
  /** Detailed results of all evaluated subsystem checks */
  checks: {
    database?: DatabaseHealthResult;
    storage?: StorageHealthResult;
    mail?: MailHealthResult;
    cache?: CacheHealthResult;
    [subsystem: string]: HealthCheckResult<unknown> | undefined;
  };
}

/**
 * Backward-compatible alias for SystemHealthReport.
 */
export type SystemHealthResponse = SystemHealthReport;

/**
 * Interface contract for pluggable subsystem health check providers.
 */
export interface HealthChecker {
  /** Subsystem check name */
  readonly name: HealthCheckName;
  /** Whether failure of this check renders the readiness probe false */
  readonly isCritical: boolean;
  /** Maximum time allowed for check execution in milliseconds before timeout */
  readonly timeoutMs?: number;
  /** Execute the check and return the diagnostic result */
  check(): Promise<HealthCheckResult>;
}

/**
 * Central registry orchestrating subsystem health checks and probe responses.
 */
export interface HealthCheckRegistry {
  /** Register a subsystem health checker */
  register(checker: HealthChecker): void;
  /** Run a specific named health check */
  runCheck(name: HealthCheckName): Promise<HealthCheckResult>;
  /** Run all registered health checks in parallel or sequence */
  runAllChecks(): Promise<Record<string, HealthCheckResult>>;
  /** Produce a lightweight liveness probe response */
  getLiveness(): HealthLivenessResponse;
  /** Produce a readiness probe response evaluating all critical checks */
  getReadiness(): Promise<HealthReadinessResponse>;
  /** Produce a comprehensive system health report */
  getDetailedHealth(): Promise<SystemHealthReport>;
}

/**
 * Backward-compatible alias for HealthCheckRegistry.
 */
export type IHealthCheckRegistry = HealthCheckRegistry;
