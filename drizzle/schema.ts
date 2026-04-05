import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  decimal,
  boolean,
  datetime,
  uniqueIndex,
  index,
  foreignKey,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Instructors/Teachers
 */
export const instructors = mysqlTable(
  "instructors",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    department: varchar("department", { length: 255 }),
    maxHoursPerWeek: int("maxHoursPerWeek").default(20),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: index("instructors_email_idx").on(table.email),
  })
);

export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = typeof instructors.$inferInsert;

/**
 * Courses
 */
export const courses = mysqlTable(
  "courses",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    instructorId: int("instructorId").notNull(),
    slotsPerWeek: int("slotsPerWeek").notNull(), // Number of sessions per week
    durationMinutes: int("durationMinutes").default(60), // Duration of each session
    studentCount: int("studentCount").default(30),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    instructorIdIdx: index("courses_instructorId_idx").on(table.instructorId),
    codeIdx: index("courses_code_idx").on(table.code),
  })
);

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Rooms/Classrooms
 */
export const rooms = mysqlTable(
  "rooms",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    building: varchar("building", { length: 255 }),
    floor: int("floor"),
    capacity: int("capacity").notNull(),
    hasProjector: boolean("hasProjector").default(false),
    hasWhiteboard: boolean("hasWhiteboard").default(false),
    hasComputers: boolean("hasComputers").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIdx: index("rooms_code_idx").on(table.code),
  })
);

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;

/**
 * Time Slots (days and times available for scheduling)
 */
export const timeSlots = mysqlTable(
  "timeSlots",
  {
    id: int("id").autoincrement().primaryKey(),
    dayOfWeek: int("dayOfWeek").notNull(), // 0-6 (Monday-Sunday)
    startTime: varchar("startTime", { length: 5 }).notNull(), // HH:MM format
    endTime: varchar("endTime", { length: 5 }).notNull(), // HH:MM format
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    dayTimeIdx: uniqueIndex("timeSlots_day_time_idx").on(
      table.dayOfWeek,
      table.startTime
    ),
  })
);

export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = typeof timeSlots.$inferInsert;

/**
 * Hard Constraints (must be satisfied)
 */
export const hardConstraints = mysqlTable(
  "hardConstraints",
  {
    id: int("id").autoincrement().primaryKey(),
    type: mysqlEnum("type", [
      "room_capacity",
      "instructor_availability",
      "no_instructor_overlap",
      "no_room_overlap",
      "course_slots",
    ]).notNull(),
    courseId: int("courseId"),
    instructorId: int("instructorId"),
    roomId: int("roomId"),
    timeSlotId: int("timeSlotId"),
    metadata: json("metadata"), // Additional constraint data
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    courseIdIdx: index("hardConstraints_courseId_idx").on(table.courseId),
    instructorIdIdx: index("hardConstraints_instructorId_idx").on(
      table.instructorId
    ),
  })
);

export type HardConstraint = typeof hardConstraints.$inferSelect;
export type InsertHardConstraint = typeof hardConstraints.$inferInsert;

/**
 * Soft Constraints (preferences, should be satisfied if possible)
 */
export const softConstraints = mysqlTable(
  "softConstraints",
  {
    id: int("id").autoincrement().primaryKey(),
    type: mysqlEnum("type", [
      "instructor_preference",
      "room_preference",
      "time_preference",
      "balanced_schedule",
      "no_gaps",
    ]).notNull(),
    courseId: int("courseId"),
    instructorId: int("instructorId"),
    roomId: int("roomId"),
    timeSlotId: int("timeSlotId"),
    weight: decimal("weight", { precision: 3, scale: 2 }).default("1.00"), // Importance weight
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    courseIdIdx: index("softConstraints_courseId_idx").on(table.courseId),
    instructorIdIdx: index("softConstraints_instructorId_idx").on(
      table.instructorId
    ),
  })
);

export type SoftConstraint = typeof softConstraints.$inferSelect;
export type InsertSoftConstraint = typeof softConstraints.$inferInsert;

/**
 * Timetables (generated schedules)
 */
export const timetables = mysqlTable(
  "timetables",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    type: mysqlEnum("type", ["generated", "optimized", "manual"]).default(
      "generated"
    ),
    status: mysqlEnum("status", [
      "draft",
      "active",
      "archived",
      "deprecated",
    ]).default("draft"),
    schedule: json("schedule").notNull(), // Nested structure: day → time → [course, instructor, room]
    score: decimal("score", { precision: 5, scale: 2 }).default("0.00"),
    conflictCount: int("conflictCount").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    createdBy: int("createdBy"),
  },
  (table) => ({
    statusIdx: index("timetables_status_idx").on(table.status),
    createdByIdx: index("timetables_createdBy_idx").on(table.createdBy),
  })
);

export type Timetable = typeof timetables.$inferSelect;
export type InsertTimetable = typeof timetables.$inferInsert;

/**
 * Timetable Versions (history tracking)
 */
export const timetableVersions = mysqlTable(
  "timetableVersions",
  {
    id: int("id").autoincrement().primaryKey(),
    timetableId: int("timetableId").notNull(),
    versionNumber: int("versionNumber").notNull(),
    schedule: json("schedule").notNull(),
    score: decimal("score", { precision: 5, scale: 2 }),
    changeDescription: text("changeDescription"),
    changedBy: int("changedBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    timetableIdIdx: index("timetableVersions_timetableId_idx").on(
      table.timetableId
    ),
  })
);

export type TimetableVersion = typeof timetableVersions.$inferSelect;
export type InsertTimetableVersion = typeof timetableVersions.$inferInsert;

/**
 * Conflicts (detected scheduling conflicts)
 */
export const conflicts = mysqlTable(
  "conflicts",
  {
    id: int("id").autoincrement().primaryKey(),
    timetableId: int("timetableId").notNull(),
    type: mysqlEnum("type", [
      "instructor_overlap",
      "room_overlap",
      "capacity_exceeded",
      "constraint_violation",
      "time_unavailable",
    ]).notNull(),
    courseId: int("courseId"),
    instructorId: int("instructorId"),
    roomId: int("roomId"),
    timeSlotId: int("timeSlotId"),
    description: text("description"),
    severity: mysqlEnum("severity", ["low", "medium", "high"]).default("medium"),
    resolved: boolean("resolved").default(false),
    resolution: text("resolution"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    timetableIdIdx: index("conflicts_timetableId_idx").on(table.timetableId),
    resolvedIdx: index("conflicts_resolved_idx").on(table.resolved),
  })
);

export type Conflict = typeof conflicts.$inferSelect;
export type InsertConflict = typeof conflicts.$inferInsert;

/**
 * Email Notifications (audit trail for sent emails)
 */
export const emailNotifications = mysqlTable(
  "emailNotifications",
  {
    id: int("id").autoincrement().primaryKey(),
    recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
    recipientType: mysqlEnum("recipientType", [
      "instructor",
      "admin",
      "student",
    ]).default("instructor"),
    subject: varchar("subject", { length: 255 }).notNull(),
    body: text("body"),
    type: mysqlEnum("type", [
      "schedule_generated",
      "conflict_detected",
      "schedule_changed",
      "optimization_complete",
    ]).notNull(),
    timetableId: int("timetableId"),
    status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending"),
    sentAt: timestamp("sentAt"),
    failureReason: text("failureReason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("emailNotifications_status_idx").on(table.status),
    timetableIdIdx: index("emailNotifications_timetableId_idx").on(
      table.timetableId
    ),
  })
);

export type EmailNotification = typeof emailNotifications.$inferSelect;
export type InsertEmailNotification = typeof emailNotifications.$inferInsert;

/**
 * Audit Trail (comprehensive logging)
 */
export const auditTrail = mysqlTable(
  "auditTrail",
  {
    id: int("id").autoincrement().primaryKey(),
    action: varchar("action", { length: 255 }).notNull(),
    entityType: varchar("entityType", { length: 100 }).notNull(),
    entityId: int("entityId"),
    userId: int("userId"),
    changes: json("changes"), // Before/after values
    ipAddress: varchar("ipAddress", { length: 45 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    entityTypeIdx: index("auditTrail_entityType_idx").on(table.entityType),
    userIdIdx: index("auditTrail_userId_idx").on(table.userId),
  })
);

export type AuditTrail = typeof auditTrail.$inferSelect;
export type InsertAuditTrail = typeof auditTrail.$inferInsert;

/**
 * Instructor Availability (when instructors are available/unavailable)
 */
export const instructorAvailability = mysqlTable(
  "instructorAvailability",
  {
    id: int("id").autoincrement().primaryKey(),
    instructorId: int("instructorId").notNull(),
    timeSlotId: int("timeSlotId").notNull(),
    available: boolean("available").default(true),
    reason: varchar("reason", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    instructorIdIdx: index("instructorAvailability_instructorId_idx").on(
      table.instructorId
    ),
    timeSlotIdIdx: index("instructorAvailability_timeSlotId_idx").on(
      table.timeSlotId
    ),
  })
);

export type InstructorAvailability = typeof instructorAvailability.$inferSelect;
export type InsertInstructorAvailability =
  typeof instructorAvailability.$inferInsert;

/**
 * Room Availability (when rooms are available/unavailable)
 */
export const roomAvailability = mysqlTable(
  "roomAvailability",
  {
    id: int("id").autoincrement().primaryKey(),
    roomId: int("roomId").notNull(),
    timeSlotId: int("timeSlotId").notNull(),
    available: boolean("available").default(true),
    reason: varchar("reason", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    roomIdIdx: index("roomAvailability_roomId_idx").on(table.roomId),
    timeSlotIdIdx: index("roomAvailability_timeSlotId_idx").on(table.timeSlotId),
  })
);

export type RoomAvailability = typeof roomAvailability.$inferSelect;
export type InsertRoomAvailability = typeof roomAvailability.$inferInsert;
