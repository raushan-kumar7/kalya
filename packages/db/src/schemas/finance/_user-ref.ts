import { text } from 'drizzle-orm/sqlite-core';
import { user } from '../auth';

/** Owning-user FK column, present on almost every finance table. */
export const userIdCol = () =>
  text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' });
