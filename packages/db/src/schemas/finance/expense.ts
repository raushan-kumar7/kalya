import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { boolCol, idCol, isoDate, money, timestamps, uuidCol } from '../_columns';
import { userIdCol } from './_user-ref';
import { category } from './category';
import { splitContactMember } from './split-contact';

export const expense = sqliteTable(
  'expense',
  {
    id: idCol(),
    userId: userIdCol(),
    date: isoDate('date').notNull(),
    categoryId: uuidCol('category_id')
      .notNull()
      .references(() => category.id, { onDelete: 'restrict' }),
    description: text('description').notNull(),
    amount: money('amount', { notNull: true }),
    paymentMethod: text('payment_method', {
      enum: ['upi', 'phonepe', 'paytm', 'gpay', 'debit_card', 'credit_card'],
    }).default('upi'),
    isSplit: boolCol('is_split', false),
    paidBy: uuidCol('paid_by').references(() => splitContactMember.id, {
      onDelete: 'set null',
    }),
    yourShare: money('your_share', { notNull: true }),
    splitType: text('split_type', {
      enum: ['equal', 'exact', 'percentage', 'shares'],
    })
      .notNull()
      .default('equal'),
    ...timestamps(),
  },
  (t) => [
    index('expense_user_category_split_idx').on(t.userId, t.categoryId, t.isSplit),
    index('expense_user_date_idx').on(t.userId, t.date), // date-range reports
  ]
);

export const splitExpense = sqliteTable(
  'split_expense',
  {
    id: idCol(),
    userId: userIdCol(),
    expenseId: uuidCol('expense_id')
      .notNull()
      .references(() => expense.id, { onDelete: 'cascade' }),
    splitMemberId: uuidCol('split_member_id')
      .notNull()
      .references(() => splitContactMember.id, { onDelete: 'cascade' }),
    amount: money('amount'),
    settledAmount: money('settled_amount'),
    settled: boolCol('settled', false),
    settledVia: text('settled_via'),
    settledAt: isoDate('settled_at'),
  },
  (t) => [
    index('split_expense_expense_member_idx').on(t.expenseId, t.splitMemberId),
    index('split_expense_member_idx').on(t.splitMemberId), // "what do I owe overall"
  ]
);

export type ExpenseRow = typeof expense.$inferSelect;
export type ExpenseEntity = typeof expense.$inferInsert;

export type SplitExpenseRow = typeof splitExpense.$inferSelect;
export type SplitExpenseEntity = typeof splitExpense.$inferInsert;
