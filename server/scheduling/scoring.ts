/**
 * Scoring Engine - Evaluates timetable quality based on constraints and preferences
 */

export interface ScheduleEntry {
  courseId: number;
  instructorId: number;
  roomId: number;
  timeSlotId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface TimetableSchedule {
  [day: number]: {
    [timeSlot: string]: ScheduleEntry[];
  };
}

export interface ScoringResult {
  score: number;
  hardConstraintViolations: number;
  softConstraintViolations: number;
  details: {
    instructorOverlaps: number;
    roomOverlaps: number;
    capacityViolations: number;
    unavailableSlots: number;
    gapPenalties: number;
    preferenceMatches: number;
    balancedSchedule: number;
  };
}

/**
 * Scoring weights for different constraint types
 */
const SCORING_WEIGHTS = {
  HARD_CONSTRAINT_VIOLATION: -100,
  INSTRUCTOR_OVERLAP: -50,
  ROOM_OVERLAP: -50,
  CAPACITY_EXCEEDED: -40,
  UNAVAILABLE_SLOT: -30,
  GAP_PENALTY: -2,
  PREFERENCE_MATCH: 3,
  BALANCED_SCHEDULE: 5,
  NO_GAPS: 2,
};

/**
 * Calculate overall score for a timetable
 */
export function calculateScore(
  schedule: TimetableSchedule,
  constraints: {
    hardConstraints: any[];
    softConstraints: any[];
  }
): ScoringResult {
  const details = {
    instructorOverlaps: 0,
    roomOverlaps: 0,
    capacityViolations: 0,
    unavailableSlots: 0,
    gapPenalties: 0,
    preferenceMatches: 0,
    balancedSchedule: 0,
  };

  let score = 100;
  let hardConstraintViolations = 0;
  let softConstraintViolations = 0;

  const instructorSchedule = buildInstructorSchedule(schedule);
  const instructorOverlaps = detectInstructorOverlaps(instructorSchedule);
  details.instructorOverlaps = instructorOverlaps;
  score += instructorOverlaps * SCORING_WEIGHTS.INSTRUCTOR_OVERLAP;
  hardConstraintViolations += instructorOverlaps;

  const roomSchedule = buildRoomSchedule(schedule);
  const roomOverlaps = detectRoomOverlaps(roomSchedule);
  details.roomOverlaps = roomOverlaps;
  score += roomOverlaps * SCORING_WEIGHTS.ROOM_OVERLAP;
  hardConstraintViolations += roomOverlaps;

  const gaps = detectScheduleGaps(instructorSchedule);
  details.gapPenalties = gaps;
  score += gaps * SCORING_WEIGHTS.GAP_PENALTY;
  softConstraintViolations += gaps;

  const balanceScore = calculateBalanceScore(instructorSchedule);
  details.balancedSchedule = balanceScore;
  score += balanceScore * SCORING_WEIGHTS.BALANCED_SCHEDULE;

  score = Math.max(0, score);

  return {
    score: Math.round(score * 100) / 100,
    hardConstraintViolations,
    softConstraintViolations,
    details,
  };
}

/**
 * Build a schedule indexed by instructor
 */
function buildInstructorSchedule(
  schedule: TimetableSchedule
): Map<number, ScheduleEntry[]> {
  const instructorSchedule = new Map<number, ScheduleEntry[]>();

  for (const dayEntries of Object.values(schedule)) {
    for (const entries of Object.values(dayEntries)) {
      for (const entry of entries as ScheduleEntry[]) {
        if (!instructorSchedule.has(entry.instructorId)) {
          instructorSchedule.set(entry.instructorId, []);
        }
        instructorSchedule.get(entry.instructorId)!.push(entry);
      }
    }
  }

  return instructorSchedule;
}

/**
 * Build a schedule indexed by room
 */
function buildRoomSchedule(schedule: TimetableSchedule): Map<number, ScheduleEntry[]> {
  const roomSchedule = new Map<number, ScheduleEntry[]>();

  for (const dayEntries of Object.values(schedule)) {
    for (const entries of Object.values(dayEntries)) {
      for (const entry of entries as ScheduleEntry[]) {
        if (!roomSchedule.has(entry.roomId)) {
          roomSchedule.set(entry.roomId, []);
        }
        roomSchedule.get(entry.roomId)!.push(entry);
      }
    }
  }

  return roomSchedule;
}

/**
 * Detect instructor overlaps
 */
function detectInstructorOverlaps(
  instructorSchedule: Map<number, ScheduleEntry[]>
): number {
  let overlaps = 0;

  for (const entries of Array.from(instructorSchedule.values())) {
    const sorted = entries.sort((a: ScheduleEntry, b: ScheduleEntry) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.startTime.localeCompare(b.startTime);
    });

    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (
          sorted[i].dayOfWeek === sorted[j].dayOfWeek &&
          timesOverlap(sorted[i], sorted[j])
        ) {
          overlaps++;
        }
      }
    }
  }

  return overlaps;
}

/**
 * Detect room overlaps
 */
function detectRoomOverlaps(roomSchedule: Map<number, ScheduleEntry[]>): number {
  let overlaps = 0;

  for (const entries of Array.from(roomSchedule.values())) {
    const sorted = entries.sort((a: ScheduleEntry, b: ScheduleEntry) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.startTime.localeCompare(b.startTime);
    });

    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (
          sorted[i].dayOfWeek === sorted[j].dayOfWeek &&
          timesOverlap(sorted[i], sorted[j])
        ) {
          overlaps++;
        }
      }
    }
  }

  return overlaps;
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
 * Detect gaps in instructor schedules
 */
function detectScheduleGaps(
  instructorSchedule: Map<number, ScheduleEntry[]>
): number {
  let gapCount = 0;

  for (const entries of Array.from(instructorSchedule.values())) {
    const byDay = new Map<number, ScheduleEntry[]>();
    for (const entry of entries) {
      if (!byDay.has(entry.dayOfWeek)) {
        byDay.set(entry.dayOfWeek, []);
      }
      byDay.get(entry.dayOfWeek)!.push(entry);
    }

    for (const dayEntries of Array.from(byDay.values())) {
      const sorted = dayEntries.sort((a: ScheduleEntry, b: ScheduleEntry) =>
        a.startTime.localeCompare(b.startTime)
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        const gap =
          timeToMinutes(sorted[i + 1].startTime) - timeToMinutes(sorted[i].endTime);
        if (gap > 30 && gap < 120) {
          gapCount++;
        }
      }
    }
  }

  return gapCount;
}

/**
 * Calculate balance score
 */
function calculateBalanceScore(
  instructorSchedule: Map<number, ScheduleEntry[]>
): number {
  let balanceScore = 0;

  for (const entries of Array.from(instructorSchedule.values())) {
    const byDay = new Map<number, number>();
    for (const entry of entries) {
      byDay.set(entry.dayOfWeek, (byDay.get(entry.dayOfWeek) || 0) + 1);
    }

    const counts = Array.from(byDay.values());
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance =
      counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) /
      counts.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 1) {
      balanceScore++;
    }
  }

  return balanceScore;
}

/**
 * Detect conflicts in a timetable
 */
export function detectConflicts(
  schedule: TimetableSchedule,
  constraints: {
    hardConstraints: any[];
    softConstraints: any[];
  }
): Array<{
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
  courseId?: number;
  instructorId?: number;
  roomId?: number;
}> {
  const conflicts: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    description: string;
    courseId?: number;
    instructorId?: number;
    roomId?: number;
  }> = [];

  const instructorSchedule = buildInstructorSchedule(schedule);
  for (const [instructorId, entries] of Array.from(instructorSchedule.entries())) {
    const sorted = entries.sort((a: ScheduleEntry, b: ScheduleEntry) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.startTime.localeCompare(b.startTime);
    });

    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (
          sorted[i].dayOfWeek === sorted[j].dayOfWeek &&
          timesOverlap(sorted[i], sorted[j])
        ) {
          conflicts.push({
            type: "instructor_overlap",
            severity: "high",
            description: `Instructor ${instructorId} has overlapping classes on day ${sorted[i].dayOfWeek}`,
            instructorId,
            courseId: sorted[i].courseId,
          });
        }
      }
    }
  }

  const roomSchedule = buildRoomSchedule(schedule);
  for (const [roomId, entries] of Array.from(roomSchedule.entries())) {
    const sorted = entries.sort((a: ScheduleEntry, b: ScheduleEntry) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.startTime.localeCompare(b.startTime);
    });

    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (
          sorted[i].dayOfWeek === sorted[j].dayOfWeek &&
          timesOverlap(sorted[i], sorted[j])
        ) {
          conflicts.push({
            type: "room_overlap",
            severity: "high",
            description: `Room ${roomId} is double-booked on day ${sorted[i].dayOfWeek}`,
            roomId,
            courseId: sorted[i].courseId,
          });
        }
      }
    }
  }

  return conflicts;
}
