/**
 * CSP Solver - Constraint Satisfaction Problem solver using backtracking
 * Generates valid timetables from scratch with zero hard constraint violations
 */

import type { ScheduleEntry, TimetableSchedule } from "./scoring";

export interface CSPInput {
  courses: Array<{
    id: number;
    instructorId: number;
    slotsPerWeek: number;
    durationMinutes: number;
    studentCount: number;
  }>;
  instructors: Array<{
    id: number;
    maxHoursPerWeek: number;
  }>;
  rooms: Array<{
    id: number;
    capacity: number;
  }>;
  timeSlots: Array<{
    id: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  instructorAvailability: Array<{
    instructorId: number;
    timeSlotId: number;
    available: boolean;
  }>;
  roomAvailability: Array<{
    roomId: number;
    timeSlotId: number;
    available: boolean;
  }>;
}

interface Variable {
  courseId: number;
  slotIndex: number; // Which slot of the course (0 to slotsPerWeek-1)
}

interface Domain {
  timeSlotId: number;
  roomId: number;
}

/**
 * Generate multiple valid timetables using CSP with backtracking
 */
export function generateTimetables(
  input: CSPInput,
  count: number = 3
): TimetableSchedule[] {
  const solutions: TimetableSchedule[] = [];

  for (let i = 0; i < count; i++) {
    const solution = solveCsp(input);
    if (solution) {
      solutions.push(solution);
    }
  }

  return solutions;
}

/**
 * Solve CSP using backtracking algorithm
 */
function solveCsp(input: CSPInput): TimetableSchedule | null {
  // Initialize empty schedule
  const schedule: TimetableSchedule = {};
  for (let day = 0; day < 7; day++) {
    schedule[day] = {};
  }

  // Create variables (course slots to assign)
  const variables: Variable[] = [];
  for (const course of input.courses) {
    for (let slot = 0; slot < course.slotsPerWeek; slot++) {
      variables.push({
        courseId: course.id,
        slotIndex: slot,
      });
    }
  }

  // Shuffle variables for randomization (generates different solutions)
  shuffleArray(variables);

  // Build availability maps for quick lookup
  const instructorAvailMap = new Map<string, boolean>();
  for (const avail of input.instructorAvailability) {
    instructorAvailMap.set(
      `${avail.instructorId}-${avail.timeSlotId}`,
      avail.available
    );
  }

  const roomAvailMap = new Map<string, boolean>();
  for (const avail of input.roomAvailability) {
    roomAvailMap.set(`${avail.roomId}-${avail.timeSlotId}`, avail.available);
  }

  // Attempt backtracking
  if (
    backtrack(
      input,
      schedule,
      variables,
      0,
      instructorAvailMap,
      roomAvailMap
    )
  ) {
    return schedule;
  }

  return null;
}

/**
 * Backtracking algorithm
 */
function backtrack(
  input: CSPInput,
  schedule: TimetableSchedule,
  variables: Variable[],
  varIndex: number,
  instructorAvailMap: Map<string, boolean>,
  roomAvailMap: Map<string, boolean>
): boolean {
  // Base case: all variables assigned
  if (varIndex === variables.length) {
    return true;
  }

  const variable = variables[varIndex];
  const course = input.courses.find((c) => c.id === variable.courseId);
  if (!course) return false;

  // Get possible domains for this variable
  const domains = getPossibleDomains(
    input,
    course,
    schedule,
    instructorAvailMap,
    roomAvailMap
  );

  // Shuffle domains for randomization
  shuffleArray(domains);

  for (const domain of domains) {
    // Try assigning this domain
    const timeSlot = input.timeSlots.find((t) => t.id === domain.timeSlotId);
    if (!timeSlot) continue;

    const entry: ScheduleEntry = {
      courseId: course.id,
      instructorId: course.instructorId,
      roomId: domain.roomId,
      timeSlotId: domain.timeSlotId,
      dayOfWeek: timeSlot.dayOfWeek,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    };

    // Check if this assignment is valid
    if (isValidAssignment(schedule, entry, input)) {
      // Add to schedule
      if (!schedule[timeSlot.dayOfWeek][domain.timeSlotId]) {
        schedule[timeSlot.dayOfWeek][domain.timeSlotId] = [];
      }
      schedule[timeSlot.dayOfWeek][domain.timeSlotId].push(entry);

      // Recurse
      if (backtrack(input, schedule, variables, varIndex + 1, instructorAvailMap, roomAvailMap)) {
        return true;
      }

      // Backtrack: remove assignment
      const entries = schedule[timeSlot.dayOfWeek][domain.timeSlotId];
      const idx = entries.indexOf(entry);
      if (idx > -1) {
        entries.splice(idx, 1);
      }
    }
  }

  return false;
}

/**
 * Get possible domains (time slot + room combinations) for a course
 */
function getPossibleDomains(
  input: CSPInput,
  course: {
    id: number;
    instructorId: number;
    slotsPerWeek: number;
    durationMinutes: number;
    studentCount: number;
  },
  schedule: TimetableSchedule,
  instructorAvailMap: Map<string, boolean>,
  roomAvailMap: Map<string, boolean>
): Domain[] {
  const domains: Domain[] = [];

  for (const timeSlot of input.timeSlots) {
    // Check instructor availability
    const instructorAvail = instructorAvailMap.get(
      `${course.instructorId}-${timeSlot.id}`
    );
    if (instructorAvail === false) continue; // Explicitly unavailable

    for (const room of input.rooms) {
      // Check room capacity
      if (room.capacity < course.studentCount) continue;

      // Check room availability
      const roomAvail = roomAvailMap.get(`${room.id}-${timeSlot.id}`);
      if (roomAvail === false) continue; // Explicitly unavailable

      domains.push({
        timeSlotId: timeSlot.id,
        roomId: room.id,
      });
    }
  }

  return domains;
}

/**
 * Check if an assignment is valid (no conflicts)
 */
function isValidAssignment(
  schedule: TimetableSchedule,
  entry: ScheduleEntry,
  input: CSPInput
): boolean {
  // Check instructor overlap
  for (const dayEntries of Object.values(schedule)) {
    for (const entries of Object.values(dayEntries)) {
      for (const existing of entries as ScheduleEntry[]) {
        if (existing.instructorId === entry.instructorId) {
          if (existing.dayOfWeek === entry.dayOfWeek && timesOverlap(existing, entry)) {
            return false;
          }
        }
      }
    }
  }

  // Check room overlap
  const daySchedule = schedule[entry.dayOfWeek];
  if (daySchedule && daySchedule[entry.timeSlotId]) {
    for (const existing of daySchedule[entry.timeSlotId]) {
      if (existing.roomId === entry.roomId) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check if two time slots overlap
 */
function timesOverlap(entry1: ScheduleEntry, entry2: ScheduleEntry): boolean {
  const start1 = timeToMinutes(entry1.startTime);
  const end1 = timeToMinutes(entry1.endTime);
  const start2 = timeToMinutes(entry2.startTime);
  const end2 = timeToMinutes(entry2.endTime);

  return start1 < end2 && start2 < end1;
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Shuffle array in place (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
