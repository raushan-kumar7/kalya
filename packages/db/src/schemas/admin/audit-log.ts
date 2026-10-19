import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createdAt, idCol, uuidCol } from '../_columns';
import { user } from '../auth/user';

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: idCol(),
    actorId: uuidCol('actor_id').references(() => user.id, { onDelete: 'set null' }),
    actorEmail: text('actor_email'),
    actorRole: text('actor_role', { enum: ['USER', 'ADMIN', 'SUPER_ADMIN'] }),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    severity: text('severity', { enum: ['INFO', 'WARN', 'ERROR', 'CRITICAL'] })
      .notNull()
      .default('INFO'),
    description: text('description').notNull(),
    metadata: text('metadata', { mode: 'json' }),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    status: text('status', { enum: ['SUCCESS', 'FAILURE', 'ATTEMPT'] })
      .notNull()
      .default('SUCCESS'),
    createdAt: createdAt(),
  },
  (t) => [
    index('audit_actor_idx').on(t.actorId),
    index('audit_action_idx').on(t.action),
    index('audit_severity_idx').on(t.severity),
    index('audit_created_at_idx').on(t.createdAt),
  ]
);

export type AuditLogRow = typeof auditLogs.$inferSelect;
export type AuditLogEntity = typeof auditLogs.$inferInsert;
