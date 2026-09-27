import { index, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { idCol, nullableTimestamp, timestamps, uuidCol } from '../_columns';
import { user } from './user';

export const account = sqliteTable(
  'account',
  {
    id: idCol(),
    issuer: text('issuer'),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: uuidCol('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: nullableTimestamp('access_token_expires_at'),
    refreshTokenExpiresAt: nullableTimestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('account_issuer_account_id_uq').on(t.issuer, t.accountId),
    index('account_user_idx').on(t.userId),
  ]
);

export type AccountRow = typeof account.$inferSelect;
export type AccountEntity = typeof account.$inferInsert;
