import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idCol, money, timestamps } from '../_columns';
import { userIdCol } from './_user-ref';

export const income = sqliteTable(
  'income',
  {
    id: idCol(),
    userId: userIdCol(),
    creditDate: text('credit_date').notNull(), // ISO date the income was credited
    month: text('month').notNull(), // "YYYY-MM"
    salary: money('salary', { notNull: true, default: 0 }),
    other: money('other', { notNull: true, default: 0 }),
    previousMonthLeft: money('previous_month_left', {
      notNull: true,
      default: 0,
    }),
    totalIncome: money('total_income', { notNull: true }), // derived: salary + other + previousMonthLeft
    ...timestamps(),
  },
  (t) => [index('income_user_month_idx').on(t.userId, t.month)]
);

export type IncomeRow = typeof income.$inferSelect;
export type IncomeEntity = typeof income.$inferInsert;
