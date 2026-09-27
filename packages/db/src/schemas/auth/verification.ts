import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idCol, nullableTimestamp, timestamps } from '../_columns';

export const verification = sqliteTable(
  'verification',
  {
    id: idCol(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    // Caller-supplied, not defaulted — same reasoning as session.expiresAt.
    expiresAt: nullableTimestamp('expires_at').notNull(),
    ...timestamps(),
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)]
);

export type VerificationRow = typeof verification.$inferSelect;
export type VerificationEntity = typeof verification.$inferInsert;
