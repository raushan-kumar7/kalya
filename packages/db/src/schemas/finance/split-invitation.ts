import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idCol, isoDate, money, timestamps, uuidCol } from '../_columns';
import { user } from '../auth';
import { expense, splitExpense } from './expense';

export const splitInvitation = sqliteTable(
  'split_invitation',
  {
    id: idCol(),
    senderUserId: uuidCol('sender_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    receiverUserId: uuidCol('receiver_user_id').references(() => user.id, {
      onDelete: 'cascade',
    }),
    inviteeEmail: text('invitee_email'),
    inviteePhone: text('invitee_phone'),
    expenseId: uuidCol('expense_id')
      .notNull()
      .references(() => expense.id, { onDelete: 'cascade' }),
    splitExpenseId: uuidCol('split_expense_id')
      .notNull()
      .references(() => splitExpense.id, { onDelete: 'cascade' }),
    shareAmount: money('share_amount', { notNull: true }),
    status: text('status', {
      enum: ['pending', 'accepted', 'declined', 'cancelled', 'expired'],
    })
      .notNull()
      .default('pending'),
    responseNote: text('response_note'),
    respondedAt: isoDate('responded_at'),
    expiresAt: isoDate('expires_at'),
    ...timestamps(),
  },
  (t) => [
    index('split_invitation_sender_idx').on(t.senderUserId),
    index('split_invitation_receiver_status_idx').on(t.receiverUserId, t.status),
    index('split_invitation_expense_idx').on(t.expenseId),
    index('split_invitation_email_idx').on(t.inviteeEmail),
  ]
);

export type SplitInvitationRow = typeof splitInvitation.$inferSelect;
export type SplitInvitationEntity = typeof splitInvitation.$inferInsert;
