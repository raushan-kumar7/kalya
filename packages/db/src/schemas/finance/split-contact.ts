import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { boolCol, idCol, timestamps } from '../_columns';
import { userIdCol } from './_user-ref';

export const splitContactMember = sqliteTable(
  'split_contact_member',
  {
    id: idCol(),
    userId: userIdCol(),
    name: text('name'),
    phone: text('phone'),
    email: text('email'),
    image: text('image'),
    isLinked: boolCol('is_linked', false),
    ...timestamps(),
  },
  (t) => [index('split_contact_member_user_idx').on(t.userId)]
);

export type SplitContactMemberRow = typeof splitContactMember.$inferSelect;
export type SplitContactMemberEntity = typeof splitContactMember.$inferInsert;
