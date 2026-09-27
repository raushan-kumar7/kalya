import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { idCol, isoDate, timestamps } from '../_columns';

export const user = sqliteTable('user', {
  id: idCol(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  username: text('username').notNull().unique(),
  displayUsername: text('display_username'),
  first_name: text('first_name').notNull(),
  middle_name: text('middle_name'),
  last_name: text('last_name').notNull(),
  gender: text('gender', {
    enum: ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY', 'OTHER'],
  }),
  dateOfBirth: isoDate('date_of_birth'),
  phone: text('phone'),
  locale: text('locale'),
  timezone: text('timezone'),
  currency: text('currency'),
  sync_status: text('sync_status', {
    enum: ['PENDING', 'SYNCED', 'CONFLICT', 'FAILED'],
  }).default('SYNCED'),
  ...timestamps(),
});

export type UserRow = typeof user.$inferSelect;
export type UserEntity = typeof user.$inferInsert;
