import type {
  AuditSeverity,
  AuditStatus,
  Identifiable,
  ISODate,
  ISOTimestamp,
  SystemOperationalStatus,
  UserRole,
  UserStatus,
  UUID,
} from '../core';
import type { User } from '../auth';
import type { SystemHealthReport } from '../health';

/**
 * Standard audit trail log entry capturing platform activity.
 */
export interface AuditLog extends Identifiable {
  /** User ID of the actor initiating the action (null if automated system task) */
  actorId?: UUID | null;
  /** Snapshot of the actor email for audit permanence if user deleted */
  actorEmail?: string | null;
  /** Role of the actor at the time the action took place */
  actorRole?: UserRole | null;
  /** Standard event verb (e.g. 'AUTH_SIGN_IN', 'USER_ROLE_UPDATED', 'SERVICE_DEGRADED') */
  action: string;
  /** Target entity domain category (e.g. 'USER', 'SESSION', 'DATABASE', 'JOB_QUEUE') */
  entityType: string;
  /** Target entity unique identifier */
  entityId?: string | null;
  /** Incident severity classification */
  severity: AuditSeverity;
  /** Human-readable description of the operation */
  description: string;
  /** Structured contextual payload (diffs, parameters, error stack traces) */
  metadata?: Record<string, unknown> | null;
  /** Client IP address recorded during action */
  ipAddress?: string | null;
  /** Device / User-Agent string */
  userAgent?: string | null;
  /** Execution outcome status */
  status: AuditStatus;
  /** ISO timestamp when the event was recorded */
  createdAt: ISOTimestamp;
}

/**
 * Extended user row representation with operational metrics for admin tables.
 */
export interface AdminUserDetail extends User {
  /** Count of active valid sessions */
  activeSessionCount?: number;
  /** Total transaction / expense count recorded */
  transactionCount?: number;
  /** Total digital assets tracked */
  assetCount?: number;
}

/**
 * High-level platform health & KPI overview statistics for the command center.
 */
export interface AdminOverviewStats {
  /** Total registered user accounts */
  totalUsers: number;
  /** Number of users active within the last 24 hours */
  activeUsersToday: number;
  /** Total new account registrations in the past 7 days */
  newUsersThisWeek: number;
  /** Total suspended or banned user accounts */
  suspendedUsers: number;
  /** Overall platform operational status */
  systemStatus: SystemOperationalStatus;
  /** Total background jobs processed today */
  jobsProcessedToday: number;
  /** Number of currently active background worker processes */
  activeWorkers: number;
  /** Number of failed jobs requiring administrative retry */
  failedJobs: number;
}

/**
 * Query filters and pagination for retrieving platform users.
 */
export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: 'createdAt' | 'name' | 'email' | 'lastActiveAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query filters and pagination for streaming platform audit logs.
 */
export interface AdminAuditLogsQuery {
  page?: number;
  limit?: number;
  actorId?: UUID;
  action?: string;
  entityType?: string;
  severity?: AuditSeverity;
  status?: AuditStatus;
  startDate?: ISODate;
  endDate?: ISODate;
  search?: string;
}

/**
 * DTO for updating an existing user's privilege role.
 */
export interface UpdateUserRoleDto {
  role: UserRole;
  reason?: string;
}

/**
 * DTO for suspending, banning, or reactivating a user account.
 */
export interface UpdateUserStatusDto {
  status: UserStatus;
  banReason?: string;
}

/**
 * Detailed real-time diagnostics of all application subsystems for Super-Admin.
 */
export interface SubsystemDiagnostics extends SystemHealthReport {
  /** SQLite-specific database diagnostics */
  sqlite?: {
    journalMode: string;
    walFileSizeEstimateBytes?: number;
    tableCounts: {
      users: number;
      sessions: number;
      auditLogs: number;
      expenses: number;
    };
  };
  /** Background job queue statistics */
  jobQueue?: {
    activeWorkers: number;
    queueDepths: {
      pending: number;
      processing: number;
      completed: number;
      failed: number;
    };
  };
  /** Server runtime process diagnostics */
  process?: {
    memoryRssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
    nodeVersion: string;
    platform: string;
    pid: number;
  };
}
