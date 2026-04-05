import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import {
  instructors,
  courses,
  rooms,
  timeSlots,
  hardConstraints,
  softConstraints,
} from "../drizzle/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run seeding");
}

const client = createClient({
  url: process.env.DATABASE_URL.startsWith("file:")
    ? process.env.DATABASE_URL
    : `file:${process.env.DATABASE_URL}`,
});
const db = drizzle(client);

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await db.delete(softConstraints);
    await db.delete(hardConstraints);
    await db.delete(courses);
    await db.delete(timeSlots);
    await db.delete(rooms);
    await db.delete(instructors);

    // Seed instructors
    console.log("Seeding instructors...");
    const instructorIds = [];
    const instructorData = [
      { name: "Dr. Alice Johnson", email: "alice@university.edu", department: "Computer Science", maxHoursPerWeek: 20 },
      { name: "Prof. Bob Smith", email: "bob@university.edu", department: "Mathematics", maxHoursPerWeek: 18 },
      { name: "Dr. Carol Williams", email: "carol@university.edu", department: "Physics", maxHoursPerWeek: 22 },
      { name: "Prof. David Brown", email: "david@university.edu", department: "Chemistry", maxHoursPerWeek: 20 },
      { name: "Dr. Emma Davis", email: "emma@university.edu", department: "Biology", maxHoursPerWeek: 19 },
    ];

    for (const inst of instructorData) {
      const result = await db.insert(instructors).values(inst);
      instructorIds.push(result[0]?.insertId || 1);
    }

    // Seed rooms
    console.log("Seeding rooms...");
    const roomIds = [];
    const roomData = [
      { code: "A101", name: "Lecture Hall A", building: "Building A", floor: 1, capacity: 100, hasProjector: true, hasWhiteboard: true, hasComputers: false },
      { code: "A102", name: "Classroom A102", building: "Building A", floor: 1, capacity: 40, hasProjector: true, hasWhiteboard: true, hasComputers: false },
      { code: "B201", name: "Lab B201", building: "Building B", floor: 2, capacity: 30, hasProjector: false, hasWhiteboard: true, hasComputers: true },
      { code: "B202", name: "Classroom B202", building: "Building B", floor: 2, capacity: 50, hasProjector: true, hasWhiteboard: true, hasComputers: false },
      { code: "C301", name: "Seminar Room C", building: "Building C", floor: 3, capacity: 25, hasProjector: true, hasWhiteboard: true, hasComputers: false },
    ];

    for (const room of roomData) {
      const result = await db.insert(rooms).values(room);
      roomIds.push(result[0]?.insertId || 1);
    }

    // Seed time slots
    console.log("Seeding time slots...");
    const timeSlotIds = [];
    const timeSlotData = [
      { dayOfWeek: 0, startTime: "09:00", endTime: "10:30" }, // Monday 9-10:30
      { dayOfWeek: 0, startTime: "11:00", endTime: "12:30" }, // Monday 11-12:30
      { dayOfWeek: 0, startTime: "14:00", endTime: "15:30" }, // Monday 2-3:30 PM
      { dayOfWeek: 1, startTime: "09:00", endTime: "10:30" }, // Tuesday 9-10:30
      { dayOfWeek: 1, startTime: "11:00", endTime: "12:30" }, // Tuesday 11-12:30
      { dayOfWeek: 1, startTime: "14:00", endTime: "15:30" }, // Tuesday 2-3:30 PM
      { dayOfWeek: 2, startTime: "09:00", endTime: "10:30" }, // Wednesday 9-10:30
      { dayOfWeek: 2, startTime: "11:00", endTime: "12:30" }, // Wednesday 11-12:30
      { dayOfWeek: 2, startTime: "14:00", endTime: "15:30" }, // Wednesday 2-3:30 PM
      { dayOfWeek: 3, startTime: "09:00", endTime: "10:30" }, // Thursday 9-10:30
      { dayOfWeek: 3, startTime: "11:00", endTime: "12:30" }, // Thursday 11-12:30
      { dayOfWeek: 3, startTime: "14:00", endTime: "15:30" }, // Thursday 2-3:30 PM
      { dayOfWeek: 4, startTime: "09:00", endTime: "10:30" }, // Friday 9-10:30
      { dayOfWeek: 4, startTime: "11:00", endTime: "12:30" }, // Friday 11-12:30
      { dayOfWeek: 4, startTime: "14:00", endTime: "15:30" }, // Friday 2-3:30 PM
    ];

    for (const slot of timeSlotData) {
      const result = await db.insert(timeSlots).values(slot);
      timeSlotIds.push(result[0]?.insertId || 1);
    }

    // Seed courses
    console.log("Seeding courses...");
    const courseData = [
      { code: "CS101", name: "Introduction to Computer Science", instructorId: instructorIds[0], slotsPerWeek: 3, durationMinutes: 90, studentCount: 80 },
      { code: "CS201", name: "Data Structures", instructorId: instructorIds[0], slotsPerWeek: 3, durationMinutes: 90, studentCount: 60 },
      { code: "MATH101", name: "Calculus I", instructorId: instructorIds[1], slotsPerWeek: 4, durationMinutes: 90, studentCount: 100 },
      { code: "MATH201", name: "Linear Algebra", instructorId: instructorIds[1], slotsPerWeek: 3, durationMinutes: 90, studentCount: 50 },
      { code: "PHYS101", name: "Physics I", instructorId: instructorIds[2], slotsPerWeek: 3, durationMinutes: 90, studentCount: 70 },
      { code: "CHEM101", name: "Chemistry I", instructorId: instructorIds[3], slotsPerWeek: 2, durationMinutes: 120, studentCount: 60 },
      { code: "BIO101", name: "Biology I", instructorId: instructorIds[4], slotsPerWeek: 2, durationMinutes: 120, studentCount: 55 },
    ];

    for (const course of courseData) {
      await db.insert(courses).values(course);
    }

    // Seed hard constraints
    console.log("Seeding hard constraints...");
    const hardConstraintData = [
      { type: "room_capacity", metadata: JSON.stringify({ description: "Room must have sufficient capacity for course" }) },
      { type: "instructor_availability", metadata: JSON.stringify({ description: "Instructor must be available at scheduled time" }) },
      { type: "no_instructor_overlap", metadata: JSON.stringify({ description: "Instructor cannot teach two courses at same time" }) },
      { type: "no_room_overlap", metadata: JSON.stringify({ description: "Room cannot be used for two courses at same time" }) },
    ];

    for (const constraint of hardConstraintData) {
      await db.insert(hardConstraints).values(constraint);
    }

    // Seed soft constraints
    console.log("Seeding soft constraints...");
    const softConstraintData = [
      { type: "instructor_preference", weight: "0.80", metadata: JSON.stringify({ description: "Prefer morning classes" }) },
      { type: "room_preference", weight: "0.70", metadata: JSON.stringify({ description: "Prefer rooms with projector" }) },
      { type: "time_distribution", weight: "0.75", metadata: JSON.stringify({ description: "Distribute classes evenly across week" }) },
      { type: "balanced_schedule", weight: "0.80", metadata: JSON.stringify({ description: "Balance instructor workload" }) },
      { type: "no_gaps", weight: "0.60", metadata: JSON.stringify({ description: "Minimize gaps between classes" }) },
    ];

    for (const constraint of softConstraintData) {
      await db.insert(softConstraints).values(constraint);
    }

    console.log("✅ Database seeding completed successfully!");
    console.log(`  - ${instructorData.length} instructors created`);
    console.log(`  - ${roomData.length} rooms created`);
    console.log(`  - ${timeSlotData.length} time slots created`);
    console.log(`  - ${courseData.length} courses created`);
    console.log(`  - ${hardConstraintData.length} hard constraints created`);
    console.log(`  - ${softConstraintData.length} soft constraints created`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
