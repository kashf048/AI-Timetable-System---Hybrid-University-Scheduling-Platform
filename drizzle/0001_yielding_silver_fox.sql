CREATE TABLE `auditTrail` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(255) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`userId` int,
	`changes` json,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditTrail_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conflicts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timetableId` int NOT NULL,
	`type` enum('instructor_overlap','room_overlap','capacity_exceeded','constraint_violation','time_unavailable') NOT NULL,
	`courseId` int,
	`instructorId` int,
	`roomId` int,
	`timeSlotId` int,
	`description` text,
	`severity` enum('low','medium','high') DEFAULT 'medium',
	`resolved` boolean DEFAULT false,
	`resolution` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conflicts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`instructorId` int NOT NULL,
	`slotsPerWeek` int NOT NULL,
	`durationMinutes` int DEFAULT 60,
	`studentCount` int DEFAULT 30,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `emailNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`recipientType` enum('instructor','admin','student') DEFAULT 'instructor',
	`subject` varchar(255) NOT NULL,
	`body` text,
	`type` enum('schedule_generated','conflict_detected','schedule_changed','optimization_complete') NOT NULL,
	`timetableId` int,
	`status` enum('pending','sent','failed') DEFAULT 'pending',
	`sentAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hardConstraints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('room_capacity','instructor_availability','no_instructor_overlap','no_room_overlap','course_slots') NOT NULL,
	`courseId` int,
	`instructorId` int,
	`roomId` int,
	`timeSlotId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hardConstraints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `instructorAvailability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instructorId` int NOT NULL,
	`timeSlotId` int NOT NULL,
	`available` boolean DEFAULT true,
	`reason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instructorAvailability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `instructors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`department` varchar(255),
	`maxHoursPerWeek` int DEFAULT 20,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instructors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roomAvailability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`timeSlotId` int NOT NULL,
	`available` boolean DEFAULT true,
	`reason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roomAvailability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`building` varchar(255),
	`floor` int,
	`capacity` int NOT NULL,
	`hasProjector` boolean DEFAULT false,
	`hasWhiteboard` boolean DEFAULT false,
	`hasComputers` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `rooms_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `softConstraints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('instructor_preference','room_preference','time_preference','balanced_schedule','no_gaps') NOT NULL,
	`courseId` int,
	`instructorId` int,
	`roomId` int,
	`timeSlotId` int,
	`weight` decimal(3,2) DEFAULT '1.00',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `softConstraints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeSlots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeSlots_id` PRIMARY KEY(`id`),
	CONSTRAINT `timeSlots_day_time_idx` UNIQUE(`dayOfWeek`,`startTime`)
);
--> statement-breakpoint
CREATE TABLE `timetableVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timetableId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`schedule` json NOT NULL,
	`score` decimal(5,2),
	`changeDescription` text,
	`changedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timetableVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timetables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('generated','optimized','manual') DEFAULT 'generated',
	`status` enum('draft','active','archived','deprecated') DEFAULT 'draft',
	`schedule` json NOT NULL,
	`score` decimal(5,2) DEFAULT '0.00',
	`conflictCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `timetables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `auditTrail_entityType_idx` ON `auditTrail` (`entityType`);--> statement-breakpoint
CREATE INDEX `auditTrail_userId_idx` ON `auditTrail` (`userId`);--> statement-breakpoint
CREATE INDEX `conflicts_timetableId_idx` ON `conflicts` (`timetableId`);--> statement-breakpoint
CREATE INDEX `conflicts_resolved_idx` ON `conflicts` (`resolved`);--> statement-breakpoint
CREATE INDEX `courses_instructorId_idx` ON `courses` (`instructorId`);--> statement-breakpoint
CREATE INDEX `courses_code_idx` ON `courses` (`code`);--> statement-breakpoint
CREATE INDEX `emailNotifications_status_idx` ON `emailNotifications` (`status`);--> statement-breakpoint
CREATE INDEX `emailNotifications_timetableId_idx` ON `emailNotifications` (`timetableId`);--> statement-breakpoint
CREATE INDEX `hardConstraints_courseId_idx` ON `hardConstraints` (`courseId`);--> statement-breakpoint
CREATE INDEX `hardConstraints_instructorId_idx` ON `hardConstraints` (`instructorId`);--> statement-breakpoint
CREATE INDEX `instructorAvailability_instructorId_idx` ON `instructorAvailability` (`instructorId`);--> statement-breakpoint
CREATE INDEX `instructorAvailability_timeSlotId_idx` ON `instructorAvailability` (`timeSlotId`);--> statement-breakpoint
CREATE INDEX `instructors_email_idx` ON `instructors` (`email`);--> statement-breakpoint
CREATE INDEX `roomAvailability_roomId_idx` ON `roomAvailability` (`roomId`);--> statement-breakpoint
CREATE INDEX `roomAvailability_timeSlotId_idx` ON `roomAvailability` (`timeSlotId`);--> statement-breakpoint
CREATE INDEX `rooms_code_idx` ON `rooms` (`code`);--> statement-breakpoint
CREATE INDEX `softConstraints_courseId_idx` ON `softConstraints` (`courseId`);--> statement-breakpoint
CREATE INDEX `softConstraints_instructorId_idx` ON `softConstraints` (`instructorId`);--> statement-breakpoint
CREATE INDEX `timetableVersions_timetableId_idx` ON `timetableVersions` (`timetableId`);--> statement-breakpoint
CREATE INDEX `timetables_status_idx` ON `timetables` (`status`);--> statement-breakpoint
CREATE INDEX `timetables_createdBy_idx` ON `timetables` (`createdBy`);