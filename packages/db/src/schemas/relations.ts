import { relations } from 'drizzle-orm';
import { account, session, user } from './auth';
import {
  alert,
  bucket,
  budget,
  category,
  digitalAsset,
  equityAsset,
  expense,
  goal,
  income,
  monthlySummary,
  notificationPreference,
  splitContactMember,
  splitExpense,
  splitInvitation,
} from './finance';

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),

  buckets: many(bucket),
  categories: many(category),
  incomes: many(income),
  budgets: many(budget),
  goals: many(goal),
  expenses: many(expense),
  splitExpenses: many(splitExpense),
  splitContactMembers: many(splitContactMember),
  sentSplitInvitations: many(splitInvitation, { relationName: 'sentInvitations' }),
  receivedSplitInvitations: many(splitInvitation, { relationName: 'receivedInvitations' }),
  digitalAssets: many(digitalAsset),
  equityAssets: many(equityAsset),
  monthlySummaries: many(monthlySummary),
  alerts: many(alert),
  notificationPreferences: many(notificationPreference),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const bucketRelations = relations(bucket, ({ one, many }) => ({
  owner: one(user, { fields: [bucket.userId], references: [user.id] }),
  categories: many(category),
  budgets: many(budget),
  goals: many(goal),
}));

export const categoryRelations = relations(category, ({ one, many }) => ({
  owner: one(user, { fields: [category.userId], references: [user.id] }),
  bucket: one(bucket, {
    fields: [category.bucketId],
    references: [bucket.id],
  }),
  expenses: many(expense),
}));

export const incomeRelations = relations(income, ({ one, many }) => ({
  owner: one(user, { fields: [income.userId], references: [user.id] }),
  budgets: many(budget),
}));

export const budgetRelations = relations(budget, ({ one }) => ({
  owner: one(user, { fields: [budget.userId], references: [user.id] }),
  bucket: one(bucket, {
    fields: [budget.bucketId],
    references: [bucket.id],
  }),
  income: one(income, {
    fields: [budget.incomeId],
    references: [income.id],
  }),
}));

export const goalRelations = relations(goal, ({ one }) => ({
  owner: one(user, { fields: [goal.userId], references: [user.id] }),
  bucket: one(bucket, {
    fields: [goal.bucketId],
    references: [bucket.id],
  }),
}));

export const expenseRelations = relations(expense, ({ one, many }) => ({
  owner: one(user, { fields: [expense.userId], references: [user.id] }),
  category: one(category, {
    fields: [expense.categoryId],
    references: [category.id],
  }),
  paidByMember: one(splitContactMember, {
    fields: [expense.paidBy],
    references: [splitContactMember.id],
  }),
  splits: many(splitExpense),
}));

export const splitContactMemberRelations = relations(splitContactMember, ({ one, many }) => ({
  owner: one(user, {
    fields: [splitContactMember.userId],
    references: [user.id],
    relationName: 'contactOwner',
  }),
  linkedUser: one(user, {
    fields: [splitContactMember.linkedUserId],
    references: [user.id],
    relationName: 'linkedUserProfile',
  }),
  expensesPaid: many(expense),
  splitLines: many(splitExpense),
}));

export const splitExpenseRelations = relations(splitExpense, ({ one }) => ({
  owner: one(user, { fields: [splitExpense.userId], references: [user.id] }),
  expense: one(expense, {
    fields: [splitExpense.expenseId],
    references: [expense.id],
  }),
  member: one(splitContactMember, {
    fields: [splitExpense.splitMemberId],
    references: [splitContactMember.id],
  }),
  creator: one(user, {
    fields: [splitExpense.creatorUserId],
    references: [user.id],
    relationName: 'expenseCreator',
  }),
  invitation: one(splitInvitation, {
    fields: [splitExpense.invitationId],
    references: [splitInvitation.id],
  }),
}));

export const splitInvitationRelations = relations(splitInvitation, ({ one }) => ({
  sender: one(user, {
    fields: [splitInvitation.senderUserId],
    references: [user.id],
    relationName: 'sentInvitations',
  }),
  receiver: one(user, {
    fields: [splitInvitation.receiverUserId],
    references: [user.id],
    relationName: 'receivedInvitations',
  }),
  expense: one(expense, {
    fields: [splitInvitation.expenseId],
    references: [expense.id],
  }),
  splitExpense: one(splitExpense, {
    fields: [splitInvitation.splitExpenseId],
    references: [splitExpense.id],
  }),
}));

export const digitalAssetRelations = relations(digitalAsset, ({ one }) => ({
  owner: one(user, { fields: [digitalAsset.userId], references: [user.id] }),
}));

export const equityAssetRelations = relations(equityAsset, ({ one }) => ({
  owner: one(user, { fields: [equityAsset.userId], references: [user.id] }),
}));

export const monthlySummaryRelations = relations(monthlySummary, ({ one }) => ({
  owner: one(user, {
    fields: [monthlySummary.userId],
    references: [user.id],
  }),
}));

export const alertRelations = relations(alert, ({ one }) => ({
  owner: one(user, { fields: [alert.userId], references: [user.id] }),
}));

export const notificationPreferenceRelations = relations(notificationPreference, ({ one }) => ({
  owner: one(user, {
    fields: [notificationPreference.userId],
    references: [user.id],
  }),
}));
