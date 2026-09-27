import { index, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { boolCol, idCol, money, timestamps, uuidCol } from '../_columns';
import { userIdCol } from './_user-ref';
import { bucket } from './bucket';
import { income } from './income';

export const budget = sqliteTable(
  'budget',
  {
    id: idCol(),
    userId: userIdCol(),
    bucketId: uuidCol('bucket_id')
      .notNull()
      .references(() => bucket.id, { onDelete: 'cascade' }),
    incomeId: uuidCol('income_id')
      .notNull()
      .references(() => income.id, { onDelete: 'cascade' }),
    period: text('period', {
      enum: ['monthly', 'quarterly', 'annual', 'financial_year'],
    })
      .notNull()
      .default('monthly'),
    amount: money('amount', { notNull: true }), // derived: income.totalIncome * bucket.targetPercent
    alertThresholdAmber: real('alert_threshold_amber').notNull().default(80),
    alertThresholdRed: real('alert_threshold_red').notNull().default(100),
    rollover: boolCol('rollover', false),
    status: text('status', { enum: ['under', 'warning', 'over'] })
      .notNull()
      .default('under'),
    ...timestamps(),
  },
  (t) => [index('budget_user_bucket_income_idx').on(t.userId, t.bucketId, t.incomeId)]
);

export type BudgetRow = typeof budget.$inferSelect;
export type BudgetEntity = typeof budget.$inferInsert;
