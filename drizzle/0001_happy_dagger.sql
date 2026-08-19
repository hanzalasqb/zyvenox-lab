CREATE TABLE `agency_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site_title` varchar(255) NOT NULL DEFAULT 'Zyvenox Lab — Digital Systems & Cyber Intelligence',
	`tagline` text NOT NULL,
	`description` text NOT NULL,
	`portfolio_visible` int NOT NULL DEFAULT 1,
	`contact_email` varchar(255) NOT NULL DEFAULT 'contact@zyvenoxlab.com',
	`contact_phone` varchar(64) NOT NULL DEFAULT '+1 (800) 993-8366',
	`address` text NOT NULL,
	`social_links` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agency_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`author_name` varchar(255) NOT NULL,
	`author_role` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`tags` varchar(255) NOT NULL,
	`media_url` text NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `portfolio_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`client` varchar(255) NOT NULL,
	`category` varchar(128) NOT NULL,
	`summary` text NOT NULL,
	`image_url` text NOT NULL,
	`metrics` varchar(128) NOT NULL DEFAULT '99.9% Uptime',
	`featured` int NOT NULL DEFAULT 1,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`short_description` text NOT NULL,
	`full_description` text NOT NULL,
	`icon` varchar(64) NOT NULL DEFAULT 'Code',
	`features` text NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `success_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(128) NOT NULL,
	`value` varchar(64) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(64) NOT NULL DEFAULT 'ShieldCheck',
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `success_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL,
	`bio` text NOT NULL,
	`avatar_url` text NOT NULL,
	`skills` varchar(255) NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
