CREATE TABLE `client_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`company` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `project_briefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_email` varchar(320) NOT NULL,
	`client_name` varchar(255) NOT NULL,
	`project_title` varchar(255) NOT NULL,
	`service_category` varchar(128) NOT NULL,
	`estimated_budget` varchar(64) NOT NULL,
	`estimated_timeline` varchar(64) NOT NULL,
	`brief_description` text NOT NULL,
	`status` varchar(64) NOT NULL DEFAULT 'Under Review',
	`admin_notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_briefs_id` PRIMARY KEY(`id`)
);
