CREATE TABLE `contact_inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`topic` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'NEW' NOT NULL,
	`priority` text DEFAULT 'NORMAL' NOT NULL,
	`user_id` text,
	`assigned_to_id` text,
	`ip_address` text,
	`user_agent` text,
	`sla_due_date` text NOT NULL,
	`resolved_at` text,
	`resolved_by_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`assigned_to_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`resolved_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `contact_inquiry_status_idx` ON `contact_inquiries` (`status`);--> statement-breakpoint
CREATE INDEX `contact_inquiry_topic_idx` ON `contact_inquiries` (`topic`);--> statement-breakpoint
CREATE INDEX `contact_inquiry_email_idx` ON `contact_inquiries` (`email`);--> statement-breakpoint
CREATE INDEX `contact_inquiry_created_at_idx` ON `contact_inquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `contact_inquiry_sla_due_idx` ON `contact_inquiries` (`sla_due_date`);--> statement-breakpoint
CREATE TABLE `contact_inquiry_replies` (
	`id` text PRIMARY KEY NOT NULL,
	`inquiry_id` text NOT NULL,
	`sender_id` text,
	`sender_email` text NOT NULL,
	`sender_name` text NOT NULL,
	`type` text DEFAULT 'PUBLIC_REPLY' NOT NULL,
	`message` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`inquiry_id`) REFERENCES `contact_inquiries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `contact_reply_inquiry_idx` ON `contact_inquiry_replies` (`inquiry_id`);--> statement-breakpoint
CREATE INDEX `contact_reply_created_at_idx` ON `contact_inquiry_replies` (`created_at`);