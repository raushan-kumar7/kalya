import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idCol, isoDate, money } from '../_columns';
import { userIdCol } from './_user-ref';

export const monthlySummary = sqliteTable(
  'monthly_summary',
  {
    id: idCol(),
    userId: userIdCol(),
    month: text('month').notNull(), // YYYY-MM
    periodStart: isoDate('period_start').notNull(),
    periodEnd: isoDate('period_end').notNull(),
    bucketTotals: text('bucket_totals', { mode: 'json' }).notNull(),
    categoryTotals: text('category_totals', { mode: 'json' }).notNull(),
    totalSpent: money('total_spent', { notNull: true }),
    generatedAt: text('generated_at').notNull(),
  },
  (t) => [index('monthly_summary_user_month_idx').on(t.userId, t.month)]
);

export type MonthlySummaryRow = typeof monthlySummary.$inferSelect;
export type MonthlySummaryEntity = typeof monthlySummary.$inferInsert;
