import {
  ALERT_REFERENCE_TYPE_OPTIONS,
  ALERT_TYPE_OPTIONS,
  BUDGET_PERIOD_OPTIONS,
  BUDGET_STATUS_OPTIONS,
  DIGITAL_ASSET_TYPE_OPTIONS,
  EXCHANGE_TYPE_OPTIONS,
  GOAL_STATUS_OPTIONS,
  NOTIFICATION_CATEGORY_OPTIONS,
  NOTIFICATION_CHANNEL_OPTIONS,
  NOTIFICATION_FREQUENCY_OPTIONS,
  ORIGIN_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PUSH_PLATFORM_OPTIONS,
  JOB_QUEUE_OPTIONS,
  JOB_STATUS_OPTIONS,
  JOB_TYPE_OPTIONS,
  SETTLEMENT_METHOD_OPTIONS,
  SPLIT_TYPE_OPTIONS,
} from './constants';
import { Extensible } from './primitives';

/**
 * Defines the deployment environments for the Kalya application ecosystem.
 */
export type AppEnvironment = 'local' | 'development' | 'staging' | 'production';

/**
 * Standardized logging levels across the application for Observability.
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

/**
 * Valid SameSite cookie policy attributes for session management.
 */
export type CookieSameSite = 'lax' | 'strict' | 'none';

/**
 * Standard operational states for health checks and individual subsystems.
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Overall system operational status.
 */
export type SystemOperationalStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

/**
 * Subsystem categories monitored by the system.
 */
export type HealthCheckName = 'database' | 'storage' | 'mail' | 'cache' | (string & {});

/** Strict literal union for Origin */
export type BaseOrigin = (typeof ORIGIN_OPTIONS)[number];
/** Tables: bucket, category | Column: origin */
export type Origin = Extensible<BaseOrigin>;

/** Strict literal union for BudgetPeriod */
export type BaseBudgetPeriod = (typeof BUDGET_PERIOD_OPTIONS)[number];
/** Table: budget | Column: period */
export type BudgetPeriod = Extensible<BaseBudgetPeriod>;

/** Strict literal union for BudgetStatus */
export type BaseBudgetStatus = (typeof BUDGET_STATUS_OPTIONS)[number];
/** Table: budget | Column: status */
export type BudgetStatus = Extensible<BaseBudgetStatus>;

/** Strict literal union for DigitalAssetType */
export type BaseDigitalAssetType = (typeof DIGITAL_ASSET_TYPE_OPTIONS)[number];
/** Table: digital_asset | Column: type */
export type DigitalAssetType = Extensible<BaseDigitalAssetType>;

/** Strict literal union for ExchangeType */
export type BaseExchangeType = (typeof EXCHANGE_TYPE_OPTIONS)[number];
/** Table: equity_asset | Column: exchange_type */
export type ExchangeType = Extensible<BaseExchangeType>;

/** Strict literal union for SplitType */
export type BaseSplitType = (typeof SPLIT_TYPE_OPTIONS)[number];
/** Table: expense | Column: split_type */
export type SplitType = Extensible<BaseSplitType>;

/** Strict literal union for PaymentMethod */
export type BasePaymentMethod = (typeof PAYMENT_METHOD_OPTIONS)[number];
/** Table: expense | Column: payment_method */
export type PaymentMethod = Extensible<BasePaymentMethod>;

/** Strict literal union for SettlementMethod */
export type BaseSettlementMethod = (typeof SETTLEMENT_METHOD_OPTIONS)[number];
/** Table: split_expense | Column: settled_via */
export type SettlementMethod = Extensible<BaseSettlementMethod>;

/** Strict literal union for GoalStatus */
export type BaseGoalStatus = (typeof GOAL_STATUS_OPTIONS)[number];
/** Table: goal | Column: status */
export type GoalStatus = Extensible<BaseGoalStatus>;

/** Strict literal union for AlertType */
export type BaseAlertType = (typeof ALERT_TYPE_OPTIONS)[number];
/** Table: alert | Column: type */
export type AlertType = Extensible<BaseAlertType>;

/** Strict literal union for AlertReferenceType */
export type BaseAlertReferenceType = (typeof ALERT_REFERENCE_TYPE_OPTIONS)[number];
/** Table: alert | Column: reference_type — name of the table an alert points back to */
export type AlertReferenceType = Extensible<BaseAlertReferenceType>;

/** Strict literal union for NotificationCategory */
export type BaseNotificationCategory = (typeof NOTIFICATION_CATEGORY_OPTIONS)[number];
/** Table: notification_preference | Column: category */
export type NotificationCategory = Extensible<BaseNotificationCategory>;

/** Strict literal union for NotificationChannel */
export type BaseNotificationChannel = (typeof NOTIFICATION_CHANNEL_OPTIONS)[number];
/** Table: notification_preference | Column: channel */
export type NotificationChannel = Extensible<BaseNotificationChannel>;

/** Strict literal union for NotificationFrequency */
export type BaseNotificationFrequency = (typeof NOTIFICATION_FREQUENCY_OPTIONS)[number];
/** Table: notification_preference | Column: frequency */
export type NotificationFrequency = Extensible<BaseNotificationFrequency>;

/** Strict literal union for PushPlatform */
export type BasePushPlatform = (typeof PUSH_PLATFORM_OPTIONS)[number];
/** Table: push_subscription | Column: platform */
export type PushPlatform = Extensible<BasePushPlatform>;

/** Strict literal union for JobQueueName */
export type BaseJobQueueName = (typeof JOB_QUEUE_OPTIONS)[number];
/** Table: job_queue | Column: queue */
export type JobQueueName = Extensible<BaseJobQueueName>;

/** Strict literal union for JobStatus */
export type BaseJobStatus = (typeof JOB_STATUS_OPTIONS)[number];
/** Table: job_queue | Column: status */
export type JobStatus = Extensible<BaseJobStatus>;

/** Strict literal union for JobType */
export type BaseJobType = (typeof JOB_TYPE_OPTIONS)[number];
/** Table: job_queue | Column: job_type */
export type JobType = Extensible<BaseJobType>;
