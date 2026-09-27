import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idCol, nullableTimestamp, timestamps, uuidCol } from '../_columns';
import { user } from './user';

export const session = sqliteTable(
  'session',
  {
    id: idCol(),
    userId: uuidCol('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    // Caller-supplied, not defaulted — a session that expires the instant
    // it's created is a bug, not a feature (see _columns.nullableTimestamp).
    expiresAt: nullableTimestamp('expires_at').notNull(),
    ...timestamps(),
  },
  (t) => [index('session_user_idx').on(t.userId)]
);

export type SessionRow = typeof session.$inferSelect;
export type SessionEntity = typeof session.$inferInsert;
