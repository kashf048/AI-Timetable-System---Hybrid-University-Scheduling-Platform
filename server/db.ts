import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import {
  InsertUser,
  users,
  instructors,
  courses,
  rooms,
  timeSlots,
  hardConstraints,
  softConstraints,
  timetables,
  timetableVersions,
  conflicts,
  emailNotifications,
  auditTrail,
  instructorAvailability,
  roomAvailability,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = createClient({
        url: process.env.DATABASE_URL.startsWith("file:")
          ? process.env.DATABASE_URL
          : `file:${process.env.DATABASE_URL}`,
      });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, any> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values as any)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Instructor queries
export async function createInstructor(data: {
  name: string;
  email: string;
  department?: string;
  maxHoursPerWeek?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(instructors).values(data);
  return result;
}

export async function getInstructors() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(instructors);
}

export async function getInstructor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(instructors).where(eq(instructors.id, id));
  return result[0];
}

export async function updateInstructor(
  id: number,
  data: Partial<{
    name: string;
    email: string;
    department: string;
    maxHoursPerWeek: number;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(instructors).set(data).where(eq(instructors.id, id));
}

export async function deleteInstructor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(instructors).where(eq(instructors.id, id));
}

// Course queries
export async function createCourse(data: {
  code: string;
  name: string;
  description?: string;
  instructorId: number;
  slotsPerWeek: number;
  durationMinutes?: number;
  studentCount?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(courses).values(data);
}

export async function getCourses() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(courses);
}

export async function getCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(courses).where(eq(courses.id, id));
  return result[0];
}

export async function updateCourse(
  id: number,
  data: Partial<{
    code: string;
    name: string;
    description: string;
    instructorId: number;
    slotsPerWeek: number;
    durationMinutes: number;
    studentCount: number;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(courses).set(data).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(courses).where(eq(courses.id, id));
}

// Room queries
export async function createRoom(data: {
  code: string;
  name: string;
  building?: string;
  floor?: number;
  capacity: number;
  hasProjector?: boolean;
  hasWhiteboard?: boolean;
  hasComputers?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(rooms).values(data);
}

export async function getRooms() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(rooms);
}

export async function getRoom(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(rooms).where(eq(rooms.id, id));
  return result[0];
}

export async function updateRoom(
  id: number,
  data: Partial<{
    code: string;
    name: string;
    building: string;
    floor: number;
    capacity: number;
    hasProjector: boolean;
    hasWhiteboard: boolean;
    hasComputers: boolean;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(rooms).set(data).where(eq(rooms.id, id));
}

export async function deleteRoom(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(rooms).where(eq(rooms.id, id));
}

// TimeSlot queries
export async function createTimeSlot(data: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(timeSlots).values(data);
}

export async function getTimeSlots() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(timeSlots);
}

export async function getTimeSlot(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(timeSlots).where(eq(timeSlots.id, id));
  return result[0];
}

export async function deleteTimeSlot(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(timeSlots).where(eq(timeSlots.id, id));
}

// Timetable queries
export async function createTimetable(data: {
  name: string;
  type: "generated" | "optimized" | "manual";
  status?: "draft" | "active" | "archived" | "deprecated";
  schedule: any;
  score?: number;
  conflictCount?: number;
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(timetables).values(data as any);
}

export async function getTimetables() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(timetables);
}

export async function getTimetable(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(timetables).where(eq(timetables.id, id));
  return result[0];
}

export async function updateTimetable(
  id: number,
  data: Partial<{
    name: string;
    type: "generated" | "optimized" | "manual";
    status: "draft" | "active" | "archived" | "deprecated";
    schedule: any;
    score: number;
    conflictCount: number;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(timetables).set(data as any).where(eq(timetables.id, id));
}

export async function deleteTimetable(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(timetables).where(eq(timetables.id, id));
}

// Conflict queries
export async function createConflict(data: {
  timetableId: number;
  type: "instructor_overlap" | "room_overlap" | "capacity_exceeded" | "constraint_violation" | "time_unavailable";
  courseId?: number;
  instructorId?: number;
  roomId?: number;
  timeSlotId?: number;
  description?: string;
  severity?: "low" | "medium" | "high";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(conflicts).values(data as any);
}

export async function getConflictsByTimetable(timetableId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(conflicts)
    .where(eq(conflicts.timetableId, timetableId));
}

export async function deleteConflictsByTimetable(timetableId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(conflicts).where(eq(conflicts.timetableId, timetableId));
}

// Email notification queries
export async function createEmailNotification(data: {
  recipientEmail: string;
  recipientType?: "instructor" | "admin" | "student";
  subject: string;
  body?: string;
  type: "schedule_generated" | "conflict_detected" | "schedule_changed" | "optimization_complete";
  timetableId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(emailNotifications).values(data);
}

export async function getPendingEmailNotifications() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(emailNotifications)
    .where(eq(emailNotifications.status, "pending"));
}

export async function updateEmailNotificationStatus(
  id: number,
  status: "sent" | "failed",
  failureReason?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {
    status,
    sentAt: new Date(),
  };
  if (failureReason) {
    updateData.failureReason = failureReason;
  }

  return await db
    .update(emailNotifications)
    .set(updateData)
    .where(eq(emailNotifications.id, id));
}

// Instructor availability queries
export async function setInstructorAvailability(data: {
  instructorId: number;
  timeSlotId: number;
  available: boolean;
  reason?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(instructorAvailability).values(data);
}

export async function getInstructorAvailability(instructorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(instructorAvailability)
    .where(eq(instructorAvailability.instructorId, instructorId));
}

// Room availability queries
export async function setRoomAvailability(data: {
  roomId: number;
  timeSlotId: number;
  available: boolean;
  reason?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(roomAvailability).values(data);
}

export async function getRoomAvailability(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(roomAvailability)
    .where(eq(roomAvailability.roomId, roomId));
}

// Timetable version queries
export async function createTimetableVersion(data: {
  timetableId: number;
  versionNumber: number;
  schedule: any;
  score?: string;
  changeDescription?: string;
  changedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(timetableVersions).values(data as any);
}

export async function getTimetableVersions(timetableId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(timetableVersions)
    .where(eq(timetableVersions.timetableId, timetableId));
}

// Audit trail queries
export async function createAuditLog(data: {
  action: string;
  entityType: string;
  entityId?: number;
  userId?: number;
  changes?: any;
  ipAddress?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(auditTrail).values(data);
}
