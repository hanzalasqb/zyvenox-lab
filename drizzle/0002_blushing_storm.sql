CREATE TABLE `contact_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(64) NOT NULL,
	`label` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `contact_entries_id` PRIMARY KEY(`id`)
);
