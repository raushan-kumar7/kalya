import { index, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { boolCol, createdAt, idCol, nullableTimestamp, updatedAt } from '../_columns';
import { userIdCol } from './_user-ref';

export const pushSubscription = sqliteTable(
  'push_subscription',
  {
    id: idCol(),
    userId: userIdCol(),

    // Platform classification
    platform: text('platform', { enum: ['web', 'ios', 'android'] }).notNull(),
    deviceId: text('device_id').notNull(),
    deviceName: text('device_name').notNull().default('Unknown Device'),

    // Web Push Specific (W3C Push API)
    endpoint: text('endpoint'),
    p256dhKey: text('p256dh_key'),
    authKey: text('auth_key'),

    // Mobile Push Specific (Expo Push / FCM)
    pushToken: text('push_token'),

    // Metadata
    userAgent: text('user_agent'),
    appVersion: text('app_version'),

    isActive: boolCol('is_active', true),
    lastSeenAt: nullableTimestamp('last_seen_at'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('push_sub_user_active_idx').on(t.userId, t.isActive),
    uniqueIndex('push_sub_user_device_uq').on(t.userId, t.deviceId),
    uniqueIndex('push_sub_endpoint_uq').on(t.endpoint),
    uniqueIndex('push_sub_token_uq').on(t.pushToken),
  ]
);

export type PushSubscriptionRow = typeof pushSubscription.$inferSelect;
export type PushSubscriptionEntity = typeof pushSubscription.$inferInsert;
