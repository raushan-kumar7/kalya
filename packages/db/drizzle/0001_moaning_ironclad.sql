CREATE TABLE `split_invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_user_id` text NOT NULL,
	`receiver_user_id` text,
	`invitee_email` text,
	`invitee_phone` text,
	`expense_id` text NOT NULL,
	`split_expense_id` text NOT NULL,
	`share_amount` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`response_note` text,
	`responded_at` text,
	`expires_at` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`sender_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`receiver_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`expense_id`) REFERENCES `expense`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`split_expense_id`) REFERENCES `split_expense`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `split_invitation_sender_idx` ON `split_invitation` (`sender_user_id`);--> statement-breakpoint
CREATE INDEX `split_invitation_receiver_status_idx` ON `split_invitation` (`receiver_user_id`,`status`);--> statement-breakpoint
CREATE INDEX `split_invitation_expense_idx` ON `split_invitation` (`expense_id`);--> statement-breakpoint
CREATE INDEX `split_invitation_email_idx` ON `split_invitation` (`invitee_email`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_split_expense` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expense_id` text NOT NULL,
	`split_member_id` text NOT NULL,
	`amount` integer,
	`settled_amount` integer DEFAULT 0,
	`settled` integer DEFAULT false NOT NULL,
	`settled_via` text,
	`settled_at` text,
	`peer_split_expense_id` text,
	`sync_status` text DEFAULT 'unlinked' NOT NULL,
	`invitation_id` text,
	`creator_user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`expense_id`) REFERENCES `expense`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`split_member_id`) REFERENCES `split_contact_member`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`creator_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_split_expense`("id", "user_id", "expense_id", "split_member_id", "amount", "settled_amount", "settled", "settled_via", "settled_at") SELECT "id", "user_id", "expense_id", "split_member_id", "amount", "settled_amount", "settled", "settled_via", "settled_at" FROM `split_expense`;--> statement-breakpoint
DROP TABLE `split_expense`;--> statement-breakpoint
ALTER TABLE `__new_split_expense` RENAME TO `split_expense`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `split_expense_expense_member_idx` ON `split_expense` (`expense_id`,`split_member_id`);--> statement-breakpoint
CREATE INDEX `split_expense_member_idx` ON `split_expense` (`split_member_id`);--> statement-breakpoint
CREATE INDEX `split_expense_peer_idx` ON `split_expense` (`peer_split_expense_id`);--> statement-breakpoint
CREATE INDEX `split_expense_sync_status_idx` ON `split_expense` (`user_id`,`sync_status`);--> statement-breakpoint
CREATE TABLE `__new_alert` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`reference_type` text,
	`reference_id` text,
	`metadata` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`read_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_alert`("id", "user_id", "type", "title", "message", "is_read", "reference_type", "reference_id", "metadata", "created_at", "read_at") SELECT "id", "user_id", "type", "title", "message", "is_read", "reference_type", "reference_id", "metadata", "created_at", "read_at" FROM `alert`;--> statement-breakpoint
DROP TABLE `alert`;--> statement-breakpoint
ALTER TABLE `__new_alert` RENAME TO `alert`;--> statement-breakpoint
CREATE INDEX `alert_user_read_created_idx` ON `alert` (`user_id`,`is_read`,`created_at`);--> statement-breakpoint
ALTER TABLE `split_contact_member` ADD `linked_user_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `split_contact_member` ADD `auto_sync_profile` integer DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX `split_contact_member_linked_user_idx` ON `split_contact_member` (`linked_user_id`);