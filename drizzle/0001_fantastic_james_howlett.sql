CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('stripe','paypal') NOT NULL,
	`plan` enum('monthly','annual') NOT NULL,
	`status` enum('active','cancelled','expired') NOT NULL,
	`subscriptionId` varchar(255) NOT NULL,
	`customerId` varchar(255),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`nextBillingDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_subscriptionId_unique` UNIQUE(`subscriptionId`)
);
