CREATE TABLE `auditTrail` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action` text NOT NULL,
	`entityType` text NOT NULL,
	`entityId` integer,
	`userId` integer,
	`changes` text,
	`ipAddress` text,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `auditTrail_entityType_idx` ON `auditTrail` (`entityType`);--> statement-breakpoint
CREATE INDEX `auditTrail_userId_idx` ON `auditTrail` (`userId`);--> statement-breakpoint
CREATE TABLE `conflicts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timetableId` integer NOT NULL,
	`type` text NOT NULL,
	`courseId` integer,
	`instructorId` integer,
	`roomId` integer,
	`timeSlotId` integer,
	`description` text,
	`severity` text DEFAULT 'medium',
	`resolved` integer DEFAULT 0,
	`resolution` text,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `conflicts_timetableId_idx` ON `conflicts` (`timetableId`);--> statement-breakpoint
CREATE INDEX `conflicts_resolved_idx` ON `conflicts` (`resolved`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`instructorId` integer NOT NULL,
	`slotsPerWeek` integer NOT NULL,
	`durationMinutes` integer DEFAULT 60,
	`studentCount` integer DEFAULT 30,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_code_unique` ON `courses` (`code`);--> statement-breakpoint
CREATE INDEX `courses_instructorId_idx` ON `courses` (`instructorId`);--> statement-breakpoint
CREATE INDEX `courses_code_idx` ON `courses` (`code`);--> statement-breakpoint
CREATE TABLE `emailNotifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`recipientEmail` text NOT NULL,
	`recipientType` text DEFAULT 'instructor',
	`subject` text NOT NULL,
	`body` text,
	`type` text NOT NULL,
	`timetableId` integer,
	`status` text DEFAULT 'pending',
	`sentAt` integer,
	`failureReason` text,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `emailNotifications_status_idx` ON `emailNotifications` (`status`);--> statement-breakpoint
CREATE INDEX `emailNotifications_timetableId_idx` ON `emailNotifications` (`timetableId`);--> statement-breakpoint
CREATE TABLE `hardConstraints` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`courseId` integer,
	`instructorId` integer,
	`roomId` integer,
	`timeSlotId` integer,
	`metadata` text,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `hardConstraints_courseId_idx` ON `hardConstraints` (`courseId`);--> statement-breakpoint
CREATE INDEX `hardConstraints_instructorId_idx` ON `hardConstraints` (`instructorId`);--> statement-breakpoint
CREATE TABLE `instructorAvailability` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`instructorId` integer NOT NULL,
	`timeSlotId` integer NOT NULL,
	`available` integer DEFAULT 1,
	`reason` text,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `instructorAvailability_instructorId_idx` ON `instructorAvailability` (`instructorId`);--> statement-breakpoint
CREATE INDEX `instructorAvailability_timeSlotId_idx` ON `instructorAvailability` (`timeSlotId`);--> statement-breakpoint
CREATE TABLE `instructors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`department` text,
	`maxHoursPerWeek` integer DEFAULT 20,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `instructors_email_idx` ON `instructors` (`email`);--> statement-breakpoint
CREATE TABLE `roomAvailability` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`roomId` integer NOT NULL,
	`timeSlotId` integer NOT NULL,
	`available` integer DEFAULT 1,
	`reason` text,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `roomAvailability_roomId_idx` ON `roomAvailability` (`roomId`);--> statement-breakpoint
CREATE INDEX `roomAvailability_timeSlotId_idx` ON `roomAvailability` (`timeSlotId`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`building` text,
	`floor` integer,
	`capacity` integer NOT NULL,
	`hasProjector` integer DEFAULT 0,
	`hasWhiteboard` integer DEFAULT 0,
	`hasComputers` integer DEFAULT 0,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_code_unique` ON `rooms` (`code`);--> statement-breakpoint
CREATE INDEX `rooms_code_idx` ON `rooms` (`code`);--> statement-breakpoint
CREATE TABLE `softConstraints` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`courseId` integer,
	`instructorId` integer,
	`roomId` integer,
	`timeSlotId` integer,
	`weight` text DEFAULT '1.00',
	`metadata` text,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `softConstraints_courseId_idx` ON `softConstraints` (`courseId`);--> statement-breakpoint
CREATE INDEX `softConstraints_instructorId_idx` ON `softConstraints` (`instructorId`);--> statement-breakpoint
CREATE TABLE `timeSlots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dayOfWeek` integer NOT NULL,
	`startTime` text NOT NULL,
	`endTime` text NOT NULL,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `timeSlots_day_time_idx` ON `timeSlots` (`dayOfWeek`,`startTime`);--> statement-breakpoint
CREATE TABLE `timetableVersions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timetableId` integer NOT NULL,
	`versionNumber` integer NOT NULL,
	`schedule` text NOT NULL,
	`score` text,
	`changeDescription` text,
	`changedBy` integer,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `timetableVersions_timetableId_idx` ON `timetableVersions` (`timetableId`);--> statement-breakpoint
CREATE TABLE `timetables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'generated',
	`status` text DEFAULT 'draft',
	`schedule` text NOT NULL,
	`score` text DEFAULT '0.00',
	`conflictCount` integer DEFAULT 0,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`createdBy` integer
);
--> statement-breakpoint
CREATE INDEX `timetables_status_idx` ON `timetables` (`status`);--> statement-breakpoint
CREATE INDEX `timetables_createdBy_idx` ON `timetables` (`createdBy`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`lastSignedIn` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);