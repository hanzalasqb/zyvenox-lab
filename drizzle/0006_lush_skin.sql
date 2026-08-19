CREATE TABLE `client_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_user_id` int NOT NULL,
	`brief_id` int,
	`file_name` varchar(255) NOT NULL,
	`file_url` text NOT NULL,
	`file_size` int NOT NULL,
	`mime_type` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agency_settings` ADD `chatbot_greeting` text DEFAULT ('I’m the Zyvenox Lab navigator. Ask me which capability fits your brief, what a delivery phase looks like, or where to start.') NOT NULL;--> statement-breakpoint
ALTER TABLE `agency_settings` ADD `chatbot_quick_replies` text DEFAULT ('Which service fits a legacy platform rebuild?,How can Zyvenox Lab help with cybersecurity?,What does an AI delivery engagement include?') NOT NULL;