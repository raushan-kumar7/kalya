/**
 * Valid gender selections available to user profiles.
 * Corresponds to the database-level enum representation.
 */
export const GENDER_OPTIONS = [
  'MALE',
  'FEMALE',
  'NON_BINARY',
  'PREFER_NOT_TO_SAY',
  'OTHER',
] as const;

/**
 * User self-identified gender type.
 */
export type Gender = (typeof GENDER_OPTIONS)[number];

/**
 * Synchronization state options for multi-device and offline-first clients.
 * Corresponds to the database-level sync_status column enum.
 */
export const SYNC_STATUS_OPTIONS = ['PENDING', 'SYNCED', 'CONFLICT', 'FAILED'] as const;

/**
 * Synchronization status type for tracked database entities.
 */
export type SyncStatus = (typeof SYNC_STATUS_OPTIONS)[number];

/**
 * Maximum allowed payload size for uploaded user avatars (5 MB in bytes).
 */
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/**
 * Permitted MIME types for uploaded avatar images.
 */
export const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * Type representing valid avatar MIME types.
 */
export type AllowedAvatarMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number];

/**
 * Permitted file extensions for uploaded avatar images.
 */
export const ALLOWED_AVATAR_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;

/**
 * Type representing valid avatar file extensions.
 */
export type AllowedAvatarExtension = (typeof ALLOWED_AVATAR_EXTENSIONS)[number];

/**
 * Standard input length boundaries for authentication credentials and profile fields.
 */
export const AUTH_LIMITS = {
  /** Minimum character length for user handle / username */
  MIN_USERNAME_LENGTH: 3,
  /** Maximum character length for user handle / username */
  MAX_USERNAME_LENGTH: 30,
  /** Minimum character length for account password */
  MIN_PASSWORD_LENGTH: 8,
  /** Maximum character length for account password */
  MAX_PASSWORD_LENGTH: 128,
  /** Minimum character length for first / last names */
  MIN_NAME_LENGTH: 1,
  /** Maximum character length for first / last names */
  MAX_NAME_LENGTH: 100,
} as const;

/**
 * Lifecycle states during real-time field uniqueness / availability checks
 * (e.g. verifying if a username or email is already registered).
 */
export const AVAILABILITY_STATUS_OPTIONS = [
  'idle',
  'invalid',
  'checking',
  'available',
  'taken',
  'error',
] as const;

/**
 * Real-time field availability verification status.
 */
export type AvailabilityStatus = (typeof AVAILABILITY_STATUS_OPTIONS)[number];

/**
 * Outcome payload of a field availability verification request.
 */
export interface AvailabilityCheckResult {
  /** The value string that was checked for uniqueness */
  value: string;
  /** Verification outcome state */
  status: 'available' | 'taken' | 'error';
  /** Optional human-readable message or explanation */
  message?: string;
}

/**
 * Shorthand alias for `AvailabilityStatus`.
 */
export type Status = AvailabilityStatus;

/**
 * Shorthand alias for `AvailabilityCheckResult`.
 */
export type Result = AvailabilityCheckResult;

/**
 * Valid origin sources for buckets and categories.
 */
export const ORIGIN_OPTIONS = ['built-in', 'custom'] as const;

/**
 * Valid recurring budget calculation periods.
 */
export const BUDGET_PERIOD_OPTIONS = ['monthly', 'quarterly', 'annual', 'financial_year'] as const;

/**
 * Health states for budget consumption.
 */
export const BUDGET_STATUS_OPTIONS = ['under', 'warning', 'over'] as const;

/**
 * Supported digital asset types (precious metals).
 */
export const DIGITAL_ASSET_TYPE_OPTIONS = ['gold', 'silver'] as const;

/**
 * Supported Indian stock exchanges.
 */
export const EXCHANGE_TYPE_OPTIONS = ['BSE', 'NSE'] as const;

/**
 * Expense split algorithms.
 */
export const SPLIT_TYPE_OPTIONS = ['equal', 'exact', 'percentage', 'shares'] as const;

/**
 * Supported payment methods for expenses.
 */
export const PAYMENT_METHOD_OPTIONS = [
  'upi',
  'phonepe',
  'paytm',
  'gpay',
  'debit_card',
  'credit_card',
] as const;

/**
 * Methods for settling split expense balances.
 */
export const SETTLEMENT_METHOD_OPTIONS = ['cash', 'upi', 'bank_transfer'] as const;

/**
 * Lifecycle states of a financial savings goal.
 */
export const GOAL_STATUS_OPTIONS = [
  'not_started',
  'in_progress',
  'on_track',
  'behind',
  'completed',
  'paused',
] as const;

/**
 * Standard input length and numeric boundaries for finances.
 */
export const FINANCE_LIMITS = {
  MIN_LABEL_LENGTH: 1,
  MAX_LABEL_LENGTH: 100,
  MIN_KEY_LENGTH: 1,
  MAX_KEY_LENGTH: 50,
  MIN_DESCRIPTION_LENGTH: 1,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_NAME_LENGTH: 100,
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 1_000_000_000,
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,
  DEFAULT_AMBER_THRESHOLD: 80,
  DEFAULT_RED_THRESHOLD: 100,
} as const;

/**
 * Recognized alert categories dispatched to users.
 */
export const ALERT_TYPE_OPTIONS = [
  'budget_alert',
  'split_update',
  'goal_milestone',
  'system',
] as const;

/**
 * Domain entity tables that alerts can link back to.
 */
export const ALERT_REFERENCE_TYPE_OPTIONS = [
  'budget',
  'split_expense',
  'goal',
  'expense',
  'income',
] as const;

/**
 * Notification preference categories.
 */
export const NOTIFICATION_CATEGORY_OPTIONS = [
  'statement',
  'budget_alerts',
  'large_transactions',
  'split_reminders',
  'smart_insights',
  'marketing',
  'system',
] as const;

/**
 * Communication delivery channels.
 */
export const NOTIFICATION_CHANNEL_OPTIONS = ['email', 'push', 'in_app'] as const;

/**
 * Frequency cadence for notification digests and alerts.
 */
export const NOTIFICATION_FREQUENCY_OPTIONS = [
  'immediate',
  'daily',
  'weekly',
  'monthly',
  'custom',
  'off',
] as const;

/**
 * Supported push notification device platforms.
 */
export const PUSH_PLATFORM_OPTIONS = ['web', 'ios', 'android'] as const;

/**
 * Supported background job queues.
 */
export const JOB_QUEUE_OPTIONS = ['email', 'notification', 'scheduled', 'system'] as const;

/**
 * Supported background job execution statuses.
 */
export const JOB_STATUS_OPTIONS = [
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
] as const;

/**
 * Supported background job task types.
 */
export const JOB_TYPE_OPTIONS = [
  'SEND_EMAIL',
  'DISPATCH_PUSH',
  'SYNC_IN_APP_ALERT',
  'EVALUATE_BUDGET_THRESHOLDS',
  'DISPATCH_SPLIT_REMINDERS',
  'GENERATE_WEEKLY_DIGEST',
  'COMPILE_MONTHLY_STATEMENT',
  'CLEANUP_STALE_TOKENS',
] as const;

/**
 * Standard input boundaries for notifications and alerts.
 */
export const NOTIFICATION_LIMITS = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 200,
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGE_LENGTH: 2000,
} as const;
