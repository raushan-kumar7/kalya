import { z } from 'zod';
import {
  ALERT_REFERENCE_TYPE_OPTIONS,
  ALERT_TYPE_OPTIONS,
  AlertFilterQueryDto,
  CreateAlertDto,
  MarkAlertsAsReadDto,
  NOTIFICATION_CATEGORY_OPTIONS,
  NOTIFICATION_CHANNEL_OPTIONS,
  NOTIFICATION_FREQUENCY_OPTIONS,
  NOTIFICATION_LIMITS,
  NotificationPreferenceFilterQueryDto,
  UpdateAlertDto,
  UpdateNotificationPreferenceDto,
  UpsertNotificationPreferenceDto,
} from '@kalya/types';
import { ISOTimestampSchema, UUIDSchema } from '../core';

// ============================================================================
// Alert Validation Schemas
// ============================================================================

/**
 * Zod schema for Alert classification types.
 */
export const AlertTypeSchema = z.enum(ALERT_TYPE_OPTIONS, {
  error: 'Invalid alert type',
});

/**
 * Zod schema for table reference types.
 */
export const AlertReferenceTypeSchema = z.enum(ALERT_REFERENCE_TYPE_OPTIONS, {
  error: 'Invalid alert reference type',
});

/**
 * Arbitrary JSON value validator for alert metadata.
 */
export const JSONValueSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JSONValueSchema),
    z.record(z.string(), JSONValueSchema),
  ])
);

/**
 * Full Alert entity validation schema.
 */
export const AlertSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  type: AlertTypeSchema,
  title: z
    .string()
    .min(
      NOTIFICATION_LIMITS.MIN_TITLE_LENGTH,
      `Title must be at least ${NOTIFICATION_LIMITS.MIN_TITLE_LENGTH} character`
    )
    .max(
      NOTIFICATION_LIMITS.MAX_TITLE_LENGTH,
      `Title cannot exceed ${NOTIFICATION_LIMITS.MAX_TITLE_LENGTH} characters`
    ),
  message: z
    .string()
    .min(
      NOTIFICATION_LIMITS.MIN_MESSAGE_LENGTH,
      `Message must be at least ${NOTIFICATION_LIMITS.MIN_MESSAGE_LENGTH} character`
    )
    .max(
      NOTIFICATION_LIMITS.MAX_MESSAGE_LENGTH,
      `Message cannot exceed ${NOTIFICATION_LIMITS.MAX_MESSAGE_LENGTH} characters`
    ),
  is_read: z.boolean(),
  reference_type: AlertReferenceTypeSchema.nullable().optional(),
  reference_id: UUIDSchema.nullable().optional(),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
  metadata: z.record(z.string(), JSONValueSchema),
  created_at: ISOTimestampSchema,
  read_at: ISOTimestampSchema.nullable().optional(),
});
export type AlertInput = z.infer<typeof AlertSchema>;

/**
 * Schema for dispatching/creating an alert event.
 */
export const CreateAlertSchema: z.ZodType<CreateAlertDto> = z.object({
  user_id: UUIDSchema.optional(),
  type: AlertTypeSchema,
  title: z
    .string({ error: 'Title is required' })
    .trim()
    .min(NOTIFICATION_LIMITS.MIN_TITLE_LENGTH, 'Title is required')
    .max(NOTIFICATION_LIMITS.MAX_TITLE_LENGTH, 'Title is too long'),
  message: z
    .string({ error: 'Message is required' })
    .trim()
    .min(NOTIFICATION_LIMITS.MIN_MESSAGE_LENGTH, 'Message is required')
    .max(NOTIFICATION_LIMITS.MAX_MESSAGE_LENGTH, 'Message is too long'),
  reference_type: AlertReferenceTypeSchema.nullable().optional(),
  reference_id: UUIDSchema.nullable().optional(),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
  metadata: z.record(z.string(), JSONValueSchema).optional(),
});
export type CreateAlertInput = z.infer<typeof CreateAlertSchema>;

/**
 * Schema for updating an alert (e.g. read status).
 */
export const UpdateAlertSchema: z.ZodType<UpdateAlertDto> = z.object({
  is_read: z.boolean().optional(),
  read_at: ISOTimestampSchema.nullable().optional(),
});
export type UpdateAlertInput = z.infer<typeof UpdateAlertSchema>;

/**
 * Schema for marking multiple or all alerts as read.
 */
export const MarkAlertsAsReadSchema: z.ZodType<MarkAlertsAsReadDto> = z
  .object({
    alert_ids: z.array(UUIDSchema).optional(),
    all: z.boolean().optional(),
  })
  .refine((data) => data.all === true || (data.alert_ids && data.alert_ids.length > 0), {
    message: 'Either provide alert_ids to mark or specify all: true',
  });
export type MarkAlertsAsReadInput = z.infer<typeof MarkAlertsAsReadSchema>;

/**
 * Schema for querying and paginating alerts.
 */
export const AlertFilterQuerySchema: z.ZodType<AlertFilterQueryDto> = z.object({
  is_read: z
    .union([z.boolean(), z.enum(['true', 'false']).transform((v) => v === 'true')])
    .optional(),
  type: AlertTypeSchema.optional(),
  reference_type: AlertReferenceTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
export type AlertFilterQueryInput = z.infer<typeof AlertFilterQuerySchema>;

// ============================================================================
// Notification Preference Validation Schemas
// ============================================================================

/**
 * Zod schema for notification categories.
 */
export const NotificationCategorySchema = z.enum(NOTIFICATION_CATEGORY_OPTIONS, {
  error: 'Invalid notification category',
});

/**
 * Zod schema for communication channels.
 */
export const NotificationChannelSchema = z.enum(NOTIFICATION_CHANNEL_OPTIONS, {
  error: 'Invalid notification channel',
});

/**
 * Zod schema for notification frequencies.
 */
export const NotificationFrequencySchema = z.enum(NOTIFICATION_FREQUENCY_OPTIONS, {
  error: 'Invalid notification frequency',
});

/**
 * Full Notification Preference entity schema.
 */
export const NotificationPreferenceSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  category: NotificationCategorySchema,
  channel: NotificationChannelSchema,
  frequency: NotificationFrequencySchema,
  custom_schedule: z.string().nullable().optional(),
  is_enabled: z.boolean(),
  updated_at: ISOTimestampSchema,
});
export type NotificationPreferenceInput = z.infer<typeof NotificationPreferenceSchema>;

/**
 * Schema for upserting a user's notification preference.
 */
export const UpsertNotificationPreferenceSchema: z.ZodType<UpsertNotificationPreferenceDto> = z
  .object({
    category: NotificationCategorySchema,
    channel: NotificationChannelSchema,
    frequency: NotificationFrequencySchema.optional().default('daily'),
    custom_schedule: z.string().trim().max(100).nullable().optional(),
    is_enabled: z.boolean().optional().default(true),
  })
  .refine(
    (data) => {
      if (data.frequency === 'custom') {
        return Boolean(data.custom_schedule && data.custom_schedule.length > 0);
      }
      return true;
    },
    {
      message: 'custom_schedule is required when frequency is set to custom',
      path: ['custom_schedule'],
    }
  );
export type UpsertNotificationPreferenceInput = z.infer<typeof UpsertNotificationPreferenceSchema>;

/**
 * Schema for partially updating a notification preference.
 */
export const UpdateNotificationPreferenceSchema: z.ZodType<UpdateNotificationPreferenceDto> = z
  .object({
    frequency: NotificationFrequencySchema.optional(),
    custom_schedule: z.string().trim().max(100).nullable().optional(),
    is_enabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.frequency === 'custom') {
        return Boolean(data.custom_schedule && data.custom_schedule.length > 0);
      }
      return true;
    },
    {
      message: 'custom_schedule is required when frequency is set to custom',
      path: ['custom_schedule'],
    }
  );
export type UpdateNotificationPreferenceInput = z.infer<typeof UpdateNotificationPreferenceSchema>;

/**
 * Schema for filtering preferences.
 */
export const NotificationPreferenceFilterQuerySchema: z.ZodType<NotificationPreferenceFilterQueryDto> =
  z.object({
    category: NotificationCategorySchema.optional(),
    channel: NotificationChannelSchema.optional(),
    is_enabled: z
      .union([z.boolean(), z.enum(['true', 'false']).transform((v) => v === 'true')])
      .optional(),
  });
export type NotificationPreferenceFilterQueryInput = z.infer<
  typeof NotificationPreferenceFilterQuerySchema
>;
