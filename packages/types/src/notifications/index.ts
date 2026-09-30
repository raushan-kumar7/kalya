import {
  AlertReferenceType,
  AlertType,
  Identifiable,
  ISOTimestamp,
  JSONValue,
  NotificationCategory,
  NotificationChannel,
  NotificationFrequency,
  UUID,
} from '../core';

/**
 * Alert notification entity recorded in the system.
 * Lifecycle is tracked by `created_at` and `read_at`.
 */
export interface Alert extends Identifiable {
  /** User who owns and receives this alert */
  user_id: UUID;
  /** Type / classification of the alert */
  type: AlertType;
  /** Short notification headline */
  title: string;
  /** Descriptive body message */
  message: string;
  /** Whether the notification has been acknowledged/read by the user */
  is_read: boolean;
  /** Target domain table this alert points to */
  reference_type: AlertReferenceType;
  /** Foreign key pointing to the target domain record */
  reference_id: UUID;
  /** Contextual JSON payload associated with the alert event */
  metadata: Record<string, JSONValue>;
  /** Timestamp when the alert was triggered/created */
  created_at: ISOTimestamp;
  /** Timestamp when the alert was marked as read, if applicable */
  read_at?: ISOTimestamp | null;
}

/**
 * User-configurable delivery preference for notifications.
 * Uniquely identified per user, category, and delivery channel.
 */
export interface NotificationPreference extends Identifiable {
  /** Foreign key pointing to User.id */
  user_id: UUID;
  /** Notification functional topic/category */
  category: NotificationCategory;
  /** Transport medium (e.g. 'email' | 'push') */
  channel: NotificationChannel;
  /** Cadence of delivery */
  frequency: NotificationFrequency;
  /** Cron expression or date/day logic, used when frequency = 'custom' */
  custom_schedule?: string | null;
  /** Whether notifications for this category/channel are enabled */
  is_enabled: boolean;
  /** Timestamp when preference was last modified */
  updated_at: ISOTimestamp;
}

/**
 * Input DTO for triggering/creating a new Alert record.
 */
export interface CreateAlertDto {
  /** Target user recipient. Injected from auth session if omitted */
  user_id?: UUID;
  /** Type classification */
  type: AlertType;
  /** Alert headline */
  title: string;
  /** Body text */
  message: string;
  /** Related domain table */
  reference_type: AlertReferenceType;
  /** ID in the related table */
  reference_id: UUID;
  /** Optional metadata JSON dictionary */
  metadata?: Record<string, JSONValue>;
}

/**
 * Input DTO for updating an existing Alert.
 */
export interface UpdateAlertDto {
  /** Marked read status */
  is_read?: boolean;
  /** Timestamp marked as read */
  read_at?: ISOTimestamp | null;
}

/**
 * Input DTO for batch-marking alerts as read.
 */
export interface MarkAlertsAsReadDto {
  /** Specific alert IDs to mark as read */
  alert_ids?: UUID[];
  /** Mark all unread alerts for the current user as read */
  all?: boolean;
}

/**
 * Query criteria for listing alerts with pagination.
 */
export interface AlertFilterQueryDto {
  /** Filter by read status */
  is_read?: boolean;
  /** Filter by alert type */
  type?: AlertType;
  /** Filter by linked domain table */
  reference_type?: AlertReferenceType;
  /** Maximum number of records to retrieve */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Paginated list response for alerts.
 */
export interface AlertListResponse {
  /** Retrieved alert records */
  items: Alert[];
  /** Total matching alert records count */
  total: number;
  /** Number of unread alerts currently pending */
  unread_count: number;
}

/**
 * Summary response for unread alert count badge.
 */
export interface UnreadAlertCountResponse {
  /** Total unread alerts count */
  count: number;
}

/**
 * Input DTO for upserting a notification preference.
 */
export interface UpsertNotificationPreferenceDto {
  /** Notification category */
  category: NotificationCategory;
  /** Delivery channel */
  channel: NotificationChannel;
  /** Frequency cadence */
  frequency?: NotificationFrequency;
  /** Custom schedule cron/expression if frequency is 'custom' */
  custom_schedule?: string | null;
  /** Whether the notification preference is toggled on */
  is_enabled?: boolean;
}

/**
 * Input DTO for updating an existing notification preference.
 */
export interface UpdateNotificationPreferenceDto {
  /** Delivery frequency */
  frequency?: NotificationFrequency;
  /** Custom schedule cron/expression */
  custom_schedule?: string | null;
  /** Enabled status toggle */
  is_enabled?: boolean;
}

/**
 * Query filters for retrieving notification preferences.
 */
export interface NotificationPreferenceFilterQueryDto {
  /** Filter by category */
  category?: NotificationCategory;
  /** Filter by channel */
  channel?: NotificationChannel;
  /** Filter by enabled status */
  is_enabled?: boolean;
}

/**
 * List response for notification preferences.
 */
export interface NotificationPreferenceListResponse {
  /** List of configured preferences */
  items: NotificationPreference[];
}
