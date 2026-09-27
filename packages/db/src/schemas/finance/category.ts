import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idCol, timestamps, uuidCol } from '../_columns';
import { userIdCol } from './_user-ref';
import { bucket } from './bucket';

export const category = sqliteTable(
  'category',
  {
    id: idCol(),
    userId: userIdCol(),
    bucketId: uuidCol('bucket_id')
      .notNull()
      .references(() => bucket.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    label: text('label').notNull(),
    origin: text('origin', { enum: ['built-in', 'custom'] }).notNull(),
    color: text('color').notNull(),
    icon: text('icon').notNull(),
    ...timestamps(),
  },
  (t) => [index('category_user_bucket_idx').on(t.userId, t.bucketId)]
);

export type CategoryRow = typeof category.$inferSelect;
export type CategoryEntity = typeof category.$inferInsert;
