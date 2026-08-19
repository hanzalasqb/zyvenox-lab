CREATE TABLE `project_brief_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brief_id` int NOT NULL,
	`kind` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_brief_activity_id` PRIMARY KEY(`id`)
);
