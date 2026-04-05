import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role").default("user").notNull(), // SQLite doesn't have Enums, using text
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Instructors/Teachers
 */
export const instructors = sqliteTable(
  "instructors",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    department: text("department"),
    maxHoursPerWeek: integer("maxHoursPerWeek").default(20),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
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
export const courses = sqliteTable(
  "courses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    instructorId: integer("instructorId").notNull(),
    slotsPerWeek: integer("slotsPerWeek").notNull(), // Number of sessions per week
    durationMinutes: integer("durationMinutes").default(60), // Duration of each session
    studentCount: integer("studentCount").default(30),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
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
export const rooms = sqliteTable(
  "rooms",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    building: text("building"),
    floor: integer("floor"),
    capacity: integer("capacity").notNull(),
    hasProjector: integer("hasProjector", { mode: "boolean" }).default(0), // SQLite uses integer for boolean
    hasWhiteboard: integer("hasWhiteboard", { mode: "boolean" }).default(0),
    hasComputers: integer("hasComputers", { mode: "boolean" }).default(0),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
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
export const timeSlots = sqliteTable(
  "timeSlots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    dayOfWeek: integer("dayOfWeek").notNull(), // 0-6 (Monday-Sunday)
    startTime: text("startTime").notNull(), // HH:MM format
    endTime: text("endTime").notNull(), // HH:MM format
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
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
export const hardConstraints = sqliteTable(
  "hardConstraints",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    type: text("type").notNull(), // "room_capacity", "instructor_availability", etc.
    courseId: integer("courseId"),
    instructorId: integer("instructorId"),
    roomId: integer("roomId"),
    timeSlotId: integer("timeSlotId"),
    metadata: text("metadata", { mode: "json" }), // Additional constraint data
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
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
export const softConstraints = sqliteTable(
  "softConstraints",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    type: text("type").notNull(),
    courseId: integer("courseId"),
    instructorId: integer("instructorId"),
    roomId: integer("roomId"),
    timeSlotId: integer("timeSlotId"),
    weight: text("weight").default("1.00"), // Store as text or real for SQLite
    metadata: text("metadata", { mode: "json" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
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
export const timetables = sqliteTable(
  "timetables",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    type: text("type").default("generated"), // "generated", "optimized", "manual"
    status: text("status").default("draft"), // "draft", "active", "archived", "deprecated"
    schedule: text("schedule", { mode: "json" }).notNull(), // Nested structure
    score: text("score").default("0.00"),
    conflictCount: integer("conflictCount").default(0),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
    createdBy: integer("createdBy"),
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
export const timetableVersions = sqliteTable(
  "timetableVersions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    timetableId: integer("timetableId").notNull(),
    versionNumber: integer("versionNumber").notNull(),
    schedule: text("schedule", { mode: "json" }).notNull(),
    score: text("score"),
    changeDescription: text("changeDescription"),
    changedBy: integer("changedBy"),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
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
export const conflicts = sqliteTable(
  "conflicts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    timetableId: integer("timetableId").notNull(),
    type: text("type").notNull(),
    courseId: integer("courseId"),
    instructorId: integer("instructorId"),
    roomId: integer("roomId"),
    timeSlotId: integer("timeSlotId"),
    description: text("description"),
    severity: text("severity").default("medium"),
    resolved: integer("resolved", { mode: "boolean" }).default(0),
    resolution: text("resolution"),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
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
export const emailNotifications = sqliteTable(
  "emailNotifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    recipientEmail: text("recipientEmail").notNull(),
    recipientType: text("recipientType").default("instructor"),
    subject: text("subject").notNull(),
    body: text("body"),
    type: text("type").notNull(),
    timetableId: integer("timetableId"),
    status: text("status").default("pending"),
    sentAt: integer("sentAt", { mode: "timestamp" }),
    failureReason: text("failureReason"),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
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
export const auditTrail = sqliteTable(
  "auditTrail",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    action: text("action").notNull(),
    entityType: text("entityType").notNull(),
    entityId: integer("entityId"),
    userId: integer("userId"),
    changes: text("changes", { mode: "json" }), // Before/after values
    ipAddress: text("ipAddress"),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
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
export const instructorAvailability = sqliteTable(
  "instructorAvailability",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    instructorId: integer("instructorId").notNull(),
    timeSlotId: integer("timeSlotId").notNull(),
    available: integer("available", { mode: "boolean" }).default(1),
    reason: text("reason"),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
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
export const roomAvailability = sqliteTable(
  "roomAvailability",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roomId: integer("roomId").notNull(),
    timeSlotId: integer("timeSlotId").notNull(),
    available: integer("available", { mode: "boolean" }).default(1),
    reason: text("reason"),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
  },
  (table) => ({
    roomIdIdx: index("roomAvailability_roomId_idx").on(table.roomId),
    timeSlotIdIdx: index("roomAvailability_timeSlotId_idx").on(table.timeSlotId),
  })
);

export type RoomAvailability = typeof roomAvailability.$inferSelect;
export type InsertRoomAvailability = typeof roomAvailability.$inferInsert;
