/**
 * Conflict Detection System
 */

export interface Conflict {
  id: string;
  type: "room_conflict" | "instructor_conflict" | "capacity_conflict" | "availability_conflict";
  severity: "low" | "medium" | "high";
  description: string;
  affectedEntities: {
    courseIds?: number[];
    instructorIds?: number[];
    roomIds?: number[];
  };
  suggestedResolution: string;
}

/**
 * Detect all conflicts in a schedule
 */
export function detectConflicts(
  schedule: Record<string, Record<string, any[]>>,
  courses?: any[],
  instructors?: any[],
  rooms?: any[]
): Conflict[] {
  const conflicts: Conflict[] = [];
  courses = courses || [];
  instructors = instructors || [];
  rooms = rooms || [];
  let conflictId = 0;

  // Check room conflicts
  for (const [dayKey, daySchedule] of Object.entries(schedule)) {
    for (const [timeKey, entries] of Object.entries(daySchedule)) {
      const entries_list = entries as any[];

      // Check for multiple courses in same room at same time
      const roomMap = new Map<number, any[]>();
      for (const entry of entries_list) {
        if (!roomMap.has(entry.roomId)) {
          roomMap.set(entry.roomId, []);
        }
        roomMap.get(entry.roomId)!.push(entry);
      }

      const roomEntries_list = Array.from(roomMap.entries());
      for (const [roomId, roomEntries] of roomEntries_list) {
        if (roomEntries.length > 1) {
          conflicts.push({
            id: `conflict_${conflictId++}`,
            type: "room_conflict",
            severity: "high",
            description: `Room ${roomEntries[0].roomName} is double-booked on day ${dayKey} at ${timeKey}`,
            affectedEntities: {
              courseIds: roomEntries.map((e) => e.courseId),
              roomIds: [roomId],
            },
            suggestedResolution: `Move one of the courses to a different room or time slot`,
          });
        }
      }

      // Check for instructor overload
      const instructorMap = new Map<number, any[]>();
      for (const entry of entries_list) {
        if (!instructorMap.has(entry.instructorId)) {
          instructorMap.set(entry.instructorId, []);
        }
        instructorMap.get(entry.instructorId)!.push(entry);
      }

      const instructorEntries_list = Array.from(instructorMap.entries());
      for (const [instructorId, instructorEntries] of instructorEntries_list) {
        if (instructorEntries.length > 1) {
          conflicts.push({
            id: `conflict_${conflictId++}`,
            type: "instructor_conflict",
            severity: "high",
            description: `Instructor ${instructorEntries[0].instructorName} is assigned to multiple courses on day ${dayKey} at ${timeKey}`,
            affectedEntities: {
              courseIds: instructorEntries.map((e) => e.courseId),
              instructorIds: [instructorId],
            },
            suggestedResolution: `Reassign one of the courses to a different instructor or time slot`,
          });
        }
      }

      // Check for room capacity violations
      for (const entry of entries_list) {
        const course = (courses || []).find((c) => c.id === entry.courseId);
        const room = (rooms || []).find((r) => r.id === entry.roomId);

        if (course && room && course.studentCount > room.capacity) {
          conflicts.push({
            id: `conflict_${conflictId++}`,
            type: "capacity_conflict",
            severity: "high",
            description: `${course.name} has ${course.studentCount} students but room ${room.code} only has capacity ${room.capacity}`,
            affectedEntities: {
              courseIds: [course.id],
              roomIds: [room.id],
            },
            suggestedResolution: `Assign the course to a larger room or split into multiple sections`,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Get conflict summary statistics
 */
export function getConflictSummary(conflicts: Conflict[]) {
  return {
    total: conflicts.length,
    byType: {
      room_conflict: conflicts.filter((c) => c.type === "room_conflict").length,
      instructor_conflict: conflicts.filter((c) => c.type === "instructor_conflict").length,
      capacity_conflict: conflicts.filter((c) => c.type === "capacity_conflict").length,
      availability_conflict: conflicts.filter((c) => c.type === "availability_conflict").length,
    },
    bySeverity: {
      high: conflicts.filter((c) => c.severity === "high").length,
      medium: conflicts.filter((c) => c.severity === "medium").length,
      low: conflicts.filter((c) => c.severity === "low").length,
    },
  };
}

/**
 * Suggest resolution for a conflict
 */
export function suggestResolution(conflict: Conflict): string {
  const resolutions: Record<string, string> = {
    room_conflict: "Try scheduling one of the conflicting courses at a different time or in a different room.",
    instructor_conflict: "Assign one of the courses to a different instructor or reschedule to avoid overlap.",
    capacity_conflict: "Move the course to a larger room or split it into multiple sections.",
    availability_conflict: "Check instructor and room availability and adjust the schedule accordingly.",
  };

  return resolutions[conflict.type] || conflict.suggestedResolution;
}
