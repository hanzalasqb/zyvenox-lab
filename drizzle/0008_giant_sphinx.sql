CREATE TABLE `password_resets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_resets_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_resets_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `project_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brief_id` int NOT NULL,
	`client_user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'pending',
	`stripe_checkout_session_id` varchar(255),
	`stripe_payment_intent_id` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_milestones_id` PRIMARY KEY(`id`)
);
