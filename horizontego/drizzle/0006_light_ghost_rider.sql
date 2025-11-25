ALTER TABLE `jobs` ADD `category` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `education` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `language` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `employmentType` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `remoteWork` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `jobs` ADD `postedAt` timestamp;