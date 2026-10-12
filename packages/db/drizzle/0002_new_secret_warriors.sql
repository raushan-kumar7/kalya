CREATE TABLE `push_subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`platform` text NOT NULL,
	`device_id` text NOT NULL,
	`device_name` text DEFAULT 'Unknown Device' NOT NULL,
	`endpoint` text,
	`p256dh_key` text,
	`auth_key` text,
	`push_token` text,
	`user_agent` text,
	`app_version` text,
	`is_active` integer DEFAULT true NOT NULL,
	`last_seen_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `push_sub_user_active_idx` ON `push_subscription` (`user_id`,`is_active`);--> statement-breakpoint
CREATE UNIQUE INDEX `push_sub_user_device_uq` ON `push_subscription` (`user_id`,`device_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `push_sub_endpoint_uq` ON `push_subscription` (`endpoint`);--> statement-breakpoint
CREATE UNIQUE INDEX `push_sub_token_uq` ON `push_subscription` (`push_token`);--> statement-breakpoint
CREATE TABLE `job_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`queue` text DEFAULT 'notification' NOT NULL,
	`job_type` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`backoff_delay_ms` integer DEFAULT 5000 NOT NULL,
	`last_error` text,
	`scheduled_for` integer,
	`locked_at` integer,
	`locked_by` text,
	`completed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `job_queue_status_sched_prio_idx` ON `job_queue` (`status`,`scheduled_for`,`priority`);--> statement-breakpoint
CREATE INDEX `job_queue_queue_status_idx` ON `job_queue` (`queue`,`status`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_notification_preference` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category` text DEFAULT 'statement' NOT NULL,
	`channel` text NOT NULL,
	`frequency` text DEFAULT 'immediate' NOT NULL,
	`custom_schedule` text,
	`metadata` text,
	`is_enabled` integer DEFAULT true NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_notification_preference`("id", "user_id", "category", "channel", "frequency", "custom_schedule", "metadata", "is_enabled", "updated_at") SELECT "id", "user_id", "category", "channel", "frequency", "custom_schedule", NULL, "is_enabled", "updated_at" FROM `notification_preference`;--> statement-breakpoint
DROP TABLE `notification_preference`;--> statement-breakpoint
ALTER TABLE `__new_notification_preference` RENAME TO `notification_preference`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `notification_preference_user_category_channel_uq` ON `notification_preference` (`user_id`,`category`,`channel`);