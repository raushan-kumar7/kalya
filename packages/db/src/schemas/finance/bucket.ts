import { index, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idCol, timestamps } from '../_columns';
import { userIdCol } from './_user-ref';

export const bucket = sqliteTable(
  'bucket',
  {
    id: idCol(),
    userId: userIdCol(),
    key: text('key').notNull(), // machine-readable, e.g. "needs" | "wants" | "savings"
    label: text('label').notNull(),
    origin: text('origin', { enum: ['built-in', 'custom'] }).notNull(),
    targetPercent: real('target_percent'), // percentage, e.g. 30.5 — not money
    color: text('color'),
    icon: text('icon'),
    ...timestamps(),
  },
  (t) => [index('bucket_user_idx').on(t.userId)]
);

export type BucketRow = typeof bucket.$inferSelect;
export type BucketEntity = typeof bucket.$inferInsert;
