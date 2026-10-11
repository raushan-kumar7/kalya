import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { boolCol, idCol, timestamps, uuidCol } from '../_columns';
import { userIdCol } from './_user-ref';
import { user } from '../auth';

export const splitContactMember = sqliteTable(
  'split_contact_member',
  {
    id: idCol(),
    userId: userIdCol(),
    linkedUserId: uuidCol('linked_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    name: text('name'),
    phone: text('phone'),
    email: text('email'),
    image: text('image'),
    isLinked: boolCol('is_linked', false),
    autoSyncProfile: boolCol('auto_sync_profile', true),
    ...timestamps(),
  },
  (t) => [
    index('split_contact_member_user_idx').on(t.userId),
    index('split_contact_member_linked_user_idx').on(t.linkedUserId),
  ]
);

export type SplitContactMemberRow = typeof splitContactMember.$inferSelect;
export type SplitContactMemberEntity = typeof splitContactMember.$inferInsert;
