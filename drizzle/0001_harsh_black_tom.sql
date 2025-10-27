CREATE TABLE `auditReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`auditId` int NOT NULL,
	`totalPages` int DEFAULT 0,
	`errors404` int DEFAULT 0,
	`errors5xx` int DEFAULT 0,
	`missingTitles` int DEFAULT 0,
	`missingDescriptions` int DEFAULT 0,
	`duplicateTitles` int DEFAULT 0,
	`duplicateDescriptions` int DEFAULT 0,
	`missingH1` int DEFAULT 0,
	`missingAltText` int DEFAULT 0,
	`avgLoadTime` int DEFAULT 0,
	`mobileScore` int DEFAULT 0,
	`totalBacklinks` int DEFAULT 0,
	`referringDomains` int DEFAULT 0,
	`dofollowLinks` int DEFAULT 0,
	`nofollowLinks` int DEFAULT 0,
	`toxicLinks` int DEFAULT 0,
	`avgDomainRank` int DEFAULT 0,
	`totalKeywords` int DEFAULT 0,
	`top3Rankings` int DEFAULT 0,
	`top10Rankings` int DEFAULT 0,
	`featuredSnippets` int DEFAULT 0,
	`criticalIssues` text,
	`warnings` text,
	`goodSignals` text,
	`rawData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auditReports_id` PRIMARY KEY(`id`),
	CONSTRAINT `auditReports_auditId_unique` UNIQUE(`auditId`)
);
--> statement-breakpoint
CREATE TABLE `audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`creditsUsed` int NOT NULL DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(64) NOT NULL,
	`apiLogin` text NOT NULL,
	`apiPassword` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
