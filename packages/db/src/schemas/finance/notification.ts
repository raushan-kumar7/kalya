import { index, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { boolCol, createdAt, idCol, nullableTimestamp, updatedAt, uuidCol } from '../_columns';
import { userIdCol } from './_user-ref';

export const alert = sqliteTable(
  'alert',
  {
    id: idCol(),
    userId: userIdCol(),
    type: text('type', {
      enum: ['budget_alert', 'split_update', 'goal_milestone', 'system'],
    }).notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    isRead: boolCol('is_read', false),
    referenceType: text('reference_type'),
    referenceId: uuidCol('reference_id'),
    metadata: text('metadata', { mode: 'json' }).notNull().$type<Record<string, unknown>>(),
    createdAt: createdAt(),

    readAt: nullableTimestamp('read_at'),
  },
  (t) => [index('alert_user_read_created_idx').on(t.userId, t.isRead, t.createdAt)]
);

export const notificationPreference = sqliteTable(
  'notification_preference',
  {
    id: idCol(),
    userId: userIdCol(),
    category: text('category', {
      enum: [
        'statement',
        'budget_alerts',
        'large_transactions',
        'split_reminders',
        'smart_insights',
        'marketing',
        'system',
      ],
    })
      .notNull()
      .default('statement'),
    channel: text('channel', { enum: ['email', 'push', 'in_app'] }).notNull(),
    frequency: text('frequency', {
      enum: ['immediate', 'daily', 'weekly', 'monthly', 'custom', 'off'],
    })
      .notNull()
      .default('immediate'),
    customSchedule: text('custom_schedule'),
    metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
    isEnabled: boolCol('is_enabled', true),

    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('notification_preference_user_category_channel_uq').on(
      t.userId,
      t.category,
      t.channel
    ),
  ]
);

export type AlertRow = typeof alert.$inferSelect;
export type AlertEntity = typeof alert.$inferInsert;

export type NotificationPreferenceRow = typeof notificationPreference.$inferSelect;
export type NotificationPreferenceEntity = typeof notificationPreference.$inferInsert;
