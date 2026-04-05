/**
 * Improved CSP Solver with timeout and constraint propagation
 */

interface ScheduleEntry {
  courseId: number;
  courseName: string;
  instructorId: number;
  instructorName: string;
  roomId: number;
  roomName: string;
  startTime: string;
  endTime: string;
}

interface CSPConfig {
  timeoutMs?: number;
  maxBacktrackingDepth?: number;
  enableConstraintPropagation?: boolean;
}

const DEFAULT_CONFIG: CSPConfig = {
  timeoutMs: 30000,
  maxBacktrackingDepth: 1000,
  enableConstraintPropagation: true,
};

/**
 * Generate timetables using improved CSP solver
 */
export async function generateTimetablesImproved(
  courses: any[],
  rooms: any[],
  timeSlots: any[],
  instructors: any[],
  config: CSPConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();

  try {
    if (courses.length === 0 || rooms.length === 0 || timeSlots.length === 0) {
      throw new Error("Insufficient data for scheduling");
    }

    const domains = initializeDomains(courses, rooms, timeSlots);

    if (finalConfig.enableConstraintPropagation) {
      applyConstraintPropagation(domains, courses, rooms, instructors);
    }

    const schedule = backtrackWithTimeout(
      domains,
      courses,
      rooms,
      timeSlots,
      instructors,
      finalConfig
    );

    if (!schedule) {
      return {
        success: false,
        schedule: {},
        conflicts: ["Unable to generate complete schedule within timeout"],
        duration: Date.now() - startTime,
      };
    }

    return {
      success: true,
      schedule,
      conflicts: [],
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error("[CSP Solver] Error:", error);
    return {
      success: false,
      schedule: {},
      conflicts: [error instanceof Error ? error.message : "Unknown error"],
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Initialize domains for each course
 */
function initializeDomains(
  courses: any[],
  rooms: any[],
  timeSlots: any[]
): Map<number, Array<{ room: any; timeSlot: any }>> {
  const domains = new Map<number, Array<{ room: any; timeSlot: any }>>();

  for (const course of courses) {
    const possibleAssignments: Array<{ room: any; timeSlot: any }> = [];

    for (const room of rooms) {
      if (room.capacity >= course.studentCount) {
        for (const timeSlot of timeSlots) {
          possibleAssignments.push({ room, timeSlot });
        }
      }
    }

    domains.set(course.id, possibleAssignments);
  }

  return domains;
}

/**
 * Apply constraint propagation
 */
function applyConstraintPropagation(
  domains: Map<number, Array<{ room: any; timeSlot: any }>>,
  courses: any[],
  rooms: any[],
  instructors: any[]
) {
  let changed = true;

  while (changed) {
    changed = false;

    const entries = Array.from(domains.entries());
    for (const [courseId, possibleAssignments] of entries) {
      const course = courses.find((c) => c.id === courseId);
      if (!course) continue;

      const instructor = instructors.find((i) => i.id === course.instructorId);
      if (!instructor) continue;

      const filtered = possibleAssignments.filter((assignment) => {
        const durationHours = (course.durationMinutes || 60) / 60;
        return durationHours <= (instructor.maxHoursPerWeek || 20);
      });

      if (filtered.length < possibleAssignments.length) {
        domains.set(courseId, filtered);
        changed = true;
      }
    }
  }
}

/**
 * Backtracking with timeout
 */
function backtrackWithTimeout(
  domains: Map<number, Array<{ room: any; timeSlot: any }>>,
  courses: any[],
  rooms: any[],
  timeSlots: any[],
  instructors: any[],
  config: CSPConfig
): Record<string, Record<string, ScheduleEntry[]>> | null {
  const startTime = Date.now();
  let backtrackingDepth = 0;

  function isTimeout(): boolean {
    return Date.now() - startTime > (config.timeoutMs || 30000);
  }

  function backtrack(
    assignment: Map<number, { room: any; timeSlot: any }>,
    unassignedCourses: any[]
  ): Record<string, Record<string, ScheduleEntry[]>> | null {
    if (isTimeout()) {
      console.warn("[CSP Solver] Timeout reached");
      return null;
    }

    if (backtrackingDepth > (config.maxBacktrackingDepth || 1000)) {
      console.warn("[CSP Solver] Max depth reached");
      return null;
    }

    backtrackingDepth++;

    if (unassignedCourses.length === 0) {
      return convertAssignmentToSchedule(assignment, courses, instructors);
    }

    const course = unassignedCourses[0];
    const possibleAssignments = domains.get(course.id) || [];

    for (const possibleAssignment of possibleAssignments) {
      if (isConsistent(assignment, course, possibleAssignment, courses, instructors)) {
        assignment.set(course.id, possibleAssignment);
        const remaining = unassignedCourses.slice(1);

        const result = backtrack(assignment, remaining);
        if (result !== null) {
          return result;
        }

        assignment.delete(course.id);
      }
    }

    backtrackingDepth--;
    return null;
  }

  const unassignedCourses = courses.slice();
  const assignment = new Map<number, { room: any; timeSlot: any }>();

  return backtrack(assignment, unassignedCourses);
}

/**
 * Check consistency
 */
function isConsistent(
  assignment: Map<number, { room: any; timeSlot: any }>,
  course: any,
  possibleAssignment: { room: any; timeSlot: any },
  courses: any[],
  instructors: any[]
): boolean {
  const instructor = instructors.find((i) => i.id === course.instructorId);
  if (!instructor) return false;

  const assignmentEntries = Array.from(assignment.entries());
  for (const [assignedCourseId, assignedAssignment] of assignmentEntries) {
    if (
      assignedAssignment.room.id === possibleAssignment.room.id &&
      assignedAssignment.timeSlot.id === possibleAssignment.timeSlot.id
    ) {
      return false;
    }
  }

  for (const [assignedCourseId, assignedAssignment] of assignmentEntries) {
    const assignedCourse = courses.find((c) => c.id === assignedCourseId);
    if (
      assignedCourse &&
      assignedCourse.instructorId === course.instructorId &&
      assignedAssignment.timeSlot.id === possibleAssignment.timeSlot.id
    ) {
      return false;
    }
  }

  let totalHours = 0;
  for (const [assignedCourseId, assignedAssignment] of assignmentEntries) {
    const assignedCourse = courses.find((c) => c.id === assignedCourseId);
    if (assignedCourse && assignedCourse.instructorId === course.instructorId) {
      totalHours += (assignedCourse.durationMinutes || 60) / 60;
    }
  }
  totalHours += (course.durationMinutes || 60) / 60;

  if (totalHours > (instructor.maxHoursPerWeek || 20)) {
    return false;
  }

  return true;
}

/**
 * Convert assignment to schedule
 */
function convertAssignmentToSchedule(
  assignment: Map<number, { room: any; timeSlot: any }>,
  courses: any[],
  instructors: any[]
): Record<string, Record<string, ScheduleEntry[]>> {
  const schedule: Record<string, Record<string, ScheduleEntry[]>> = {};

  const entries = Array.from(assignment.entries());
  for (const [courseId, { room, timeSlot }] of entries) {
    const course = courses.find((c) => c.id === courseId);
    const instructor = instructors.find((i) => i.id === course?.instructorId);

    if (!course || !instructor) continue;

    const dayKey = String(timeSlot.dayOfWeek);
    const timeKey = `${timeSlot.startTime}-${timeSlot.endTime}`;

    if (!schedule[dayKey]) {
      schedule[dayKey] = {};
    }

    if (!schedule[dayKey][timeKey]) {
      schedule[dayKey][timeKey] = [];
    }

    schedule[dayKey][timeKey].push({
      courseId: course.id,
      courseName: course.name,
      instructorId: instructor.id,
      instructorName: instructor.name,
      roomId: room.id,
      roomName: room.code,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    });
  }

  return schedule;
}
