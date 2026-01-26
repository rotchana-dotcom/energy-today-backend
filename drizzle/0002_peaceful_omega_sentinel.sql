CREATE TABLE `chi_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`deviceId` varchar(255),
	`energyLevel` int NOT NULL,
	`chiFlow` int,
	`physicalFeeling` varchar(50),
	`mentalState` varchar(50),
	`notes` text,
	`measurementTime` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chi_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `food_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`deviceId` varchar(255),
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL,
	`food` text NOT NULL,
	`calories` int,
	`mealTime` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `food_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meditation_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`deviceId` varchar(255),
	`type` varchar(50),
	`duration` int NOT NULL,
	`focusLevel` int,
	`guidedMeditationId` varchar(100),
	`notes` text,
	`sessionTime` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meditation_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`deviceId` varchar(255),
	`sleepTime` timestamp NOT NULL,
	`wakeTime` timestamp NOT NULL,
	`quality` int,
	`notes` text,
	`moonPhase` decimal(3,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sleep_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weight_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`deviceId` varchar(255),
	`weight` decimal(5,2) NOT NULL,
	`height` decimal(5,2),
	`bmi` decimal(4,2),
	`goal` enum('gain','lose','maintain'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weight_entries_id` PRIMARY KEY(`id`)
);
