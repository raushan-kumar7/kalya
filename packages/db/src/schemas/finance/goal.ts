import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idCol, isoDate, money, timestamps, uuidCol } from '../_columns';
import { userIdCol } from './_user-ref';
import { bucket } from './bucket';

export const goal = sqliteTable(
  'goal',
  {
    id: idCol(),
    userId: userIdCol(),
    bucketId: uuidCol('bucket_id')
      .notNull()
      .references(() => bucket.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    targetAmount: money('target_amount', { notNull: true }),
    targetDate: isoDate('target_date').notNull(),
    currentProgress: money('current_progress', { notNull: true, default: 0 }), // auto-recomputed
    monthlyContributionPlan: money('monthly_contribution_plan', {
      notNull: true,
      default: 0,
    }),
    status: text('status', {
      enum: ['not_started', 'in_progress', 'on_track', 'behind', 'completed', 'paused'],
    })
      .notNull()
      .default('not_started'),
    ...timestamps(),
  },
  (t) => [index('goal_user_status_bucket_idx').on(t.userId, t.status, t.bucketId)]
);

export type GoalRow = typeof goal.$inferSelect;
export type GoalEntity = typeof goal.$inferInsert;
