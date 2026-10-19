import { type DatabaseClient, schema } from '@kalya/db';
import { log } from '@/logger';
import type { AuditSeverity, AuditStatus, UserRole } from '@kalya/types';

export interface RecordAuditLogParams {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: UserRole | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  severity?: AuditSeverity;
  description: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status?: AuditStatus;
}

/**
 * Service orchestrating structured platform audit logging.
 */
export class AuditLogService {
  constructor(private readonly db: DatabaseClient) {}

  /**
   * Safely records an audit log entry in the database.
   * Execution errors are caught and logged to avoid interrupting main business transactions.
   */
  async record(params: RecordAuditLogParams): Promise<void> {
    try {
      await this.db.insert(schema.auditLogs).values({
        actorId: params.actorId ?? null,
        actorEmail: params.actorEmail ?? null,
        actorRole: (params.actorRole as 'USER' | 'ADMIN' | 'SUPER_ADMIN') ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        severity: (params.severity as 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL') ?? 'INFO',
        description: params.description,
        metadata: params.metadata ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        status: (params.status as 'SUCCESS' | 'FAILURE' | 'ATTEMPT') ?? 'SUCCESS',
      });
    } catch (err) {
      log.error('Failed to write audit log entry', {
        action: params.action,
        entityType: params.entityType,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
