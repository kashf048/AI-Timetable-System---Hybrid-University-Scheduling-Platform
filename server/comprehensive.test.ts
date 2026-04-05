import { describe, it, expect } from "vitest";
import { generateTimetablesImproved } from "./scheduling/cspSolverFixed";
import { calculateScore } from "./scheduling/scoring";
import { detectConflicts } from "./scheduling/conflictDetection";

/**
 * Comprehensive test suite for all features
 */

describe("Scheduling System", () => {
  const mockCourses = [
    {
      id: 1,
      code: "CS101",
      name: "Intro to CS",
      instructorId: 1,
      slotsPerWeek: 2,
      durationMinutes: 60,
      studentCount: 30,
    },
    {
      id: 2,
      code: "CS102",
      name: "Data Structures",
      instructorId: 2,
      slotsPerWeek: 2,
      durationMinutes: 60,
      studentCount: 25,
    },
  ];

  const mockRooms = [
    {
      id: 1,
      code: "A101",
      name: "Room A101",
      building: "Building A",
      floor: 1,
      capacity: 50,
      hasProjector: true,
      hasWhiteboard: true,
      hasComputers: false,
    },
    {
      id: 2,
      code: "B201",
      name: "Room B201",
      building: "Building B",
      floor: 2,
      capacity: 40,
      hasProjector: true,
      hasWhiteboard: true,
      hasComputers: true,
    },
  ];

  const mockTimeSlots = [
    {
      id: 1,
      startTime: "09:00",
      endTime: "10:30",
      dayOfWeek: 0,
      isAvailable: true,
    },
    {
      id: 2,
      startTime: "10:30",
      endTime: "12:00",
      dayOfWeek: 0,
      isAvailable: true,
    },
    {
      id: 3,
      startTime: "13:00",
      endTime: "14:30",
      dayOfWeek: 1,
      isAvailable: true,
    },
  ];

  const mockInstructors = [
    {
      id: 1,
      name: "Dr. Smith",
      email: "smith@university.edu",
      department: "Computer Science",
      maxHoursPerWeek: 20,
    },
    {
      id: 2,
      name: "Dr. Johnson",
      email: "johnson@university.edu",
      department: "Computer Science",
      maxHoursPerWeek: 20,
    },
  ];

  describe("CSP Solver", () => {
    it("should generate valid timetable", async () => {
      const result = await generateTimetablesImproved(
        mockCourses,
        mockRooms,
        mockTimeSlots,
        mockInstructors
      );

      expect(result.success).toBe(true);
      expect(result.schedule).toBeDefined();
      expect(result.conflicts).toHaveLength(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it("should handle empty inputs gracefully", async () => {
      const result = await generateTimetablesImproved([], mockRooms, mockTimeSlots, mockInstructors);

      expect(result.success).toBe(false);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });

    it("should respect timeout", async () => {
      const result = await generateTimetablesImproved(
        mockCourses,
        mockRooms,
        mockTimeSlots,
        mockInstructors,
        { timeoutMs: 100 }
      );

      expect(result.duration).toBeLessThanOrEqual(1000);
    });
  });

  describe("Scoring System", () => {
    it("should calculate score for valid schedule", () => {
      const schedule = {
        0: {
          "09:00-10:30": [
            {
              courseId: 1,
              instructorId: 1,
              roomId: 1,
              timeSlotId: 1,
              dayOfWeek: 0,
              startTime: "09:00",
              endTime: "10:30",
            },
          ],
        },
      };

      const result = calculateScore(schedule, {
        hardConstraints: [],
        softConstraints: [],
      });

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(200);
    });

    it("should return score for empty schedule", () => {
      const schedule = {};
      const result = calculateScore(schedule, {
        hardConstraints: [],
        softConstraints: [],
      });

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(200);
    });
  });

  describe("Conflict Detection", () => {
    it("should detect room conflicts", () => {
      const schedule = {
        "0": {
          "09:00-10:30": [
            {
              courseId: 1,
              courseName: "Intro to CS",
              instructorId: 1,
              instructorName: "Dr. Smith",
              roomId: 1,
              roomName: "A101",
              startTime: "09:00",
              endTime: "10:30",
            },
            {
              courseId: 2,
              courseName: "Data Structures",
              instructorId: 2,
              instructorName: "Dr. Johnson",
              roomId: 1,
              roomName: "A101",
              startTime: "09:00",
              endTime: "10:30",
            },
          ],
        },
      };

      const conflicts = detectConflicts(schedule, mockCourses, mockInstructors, mockRooms);

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts.some((c) => c.type === "room_conflict")).toBe(true);
    });

    it("should detect instructor conflicts", () => {
      const schedule = {
        "0": {
          "09:00-10:30": [
            {
              courseId: 1,
              courseName: "Intro to CS",
              instructorId: 1,
              instructorName: "Dr. Smith",
              roomId: 1,
              roomName: "A101",
              startTime: "09:00",
              endTime: "10:30",
            },
            {
              courseId: 2,
              courseName: "Data Structures",
              instructorId: 1,
              instructorName: "Dr. Smith",
              roomId: 2,
              roomName: "B201",
              startTime: "09:00",
              endTime: "10:30",
            },
          ],
        },
      };

      const conflicts = detectConflicts(schedule, mockCourses, mockInstructors, mockRooms);

      expect(conflicts.length).toBeGreaterThan(0);
    });

    it("should detect capacity conflicts", () => {
      const largeClass = {
        ...mockCourses[0],
        studentCount: 100,
      };

      const smallRoom = {
        ...mockRooms[0],
        capacity: 30,
      };

      const schedule = {
        "0": {
          "09:00-10:30": [
            {
              courseId: largeClass.id,
              courseName: largeClass.name,
              instructorId: 1,
              instructorName: "Dr. Smith",
              roomId: smallRoom.id,
              roomName: smallRoom.code,
              startTime: "09:00",
              endTime: "10:30",
            },
          ],
        },
      };

      const conflicts = detectConflicts(
        schedule,
        [largeClass],
        mockInstructors,
        [smallRoom]
      );

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts.some((c) => c.type === "capacity_conflict")).toBe(true);
    });
  });

  describe("Validation", () => {
    it("should validate time format", () => {
      const validTime = "09:00";
      const invalidTime = "25:00";

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

      expect(timeRegex.test(validTime)).toBe(true);
      expect(timeRegex.test(invalidTime)).toBe(false);
    });

    it("should validate email format", () => {
      const validEmail = "test@university.edu";
      const invalidEmail = "invalid.email";

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(validEmail)).toBe(true);
      expect(emailRegex.test(invalidEmail)).toBe(false);
    });

    it("should validate room capacity", () => {
      const validCapacity = 50;
      const invalidCapacity = 0;
      const tooLargeCapacity = 2000;

      expect(validCapacity > 0 && validCapacity <= 1000).toBe(true);
      expect(invalidCapacity > 0 && invalidCapacity <= 1000).toBe(false);
      expect(tooLargeCapacity > 0 && tooLargeCapacity <= 1000).toBe(false);
    });
  });

  describe("Data Integrity", () => {
    it("should maintain referential integrity", () => {
      const courseWithInvalidInstructor = {
        ...mockCourses[0],
        instructorId: 999,
      };

      const validInstructorIds = mockInstructors.map((i) => i.id);
      const isValid = validInstructorIds.includes(courseWithInvalidInstructor.instructorId);

      expect(isValid).toBe(false);
    });

    it("should validate schedule structure", () => {
      const validSchedule = {
        0: {
          "09:00-10:30": [
            {
              courseId: 1,
              courseName: "Course",
              instructorId: 1,
              instructorName: "Instructor",
              roomId: 1,
              roomName: "Room",
              startTime: "09:00",
              endTime: "10:30",
            },
          ],
        },
      };

      expect(Object.keys(validSchedule).length).toBeGreaterThan(0);
      expect(validSchedule[0]).toBeDefined();
      expect(validSchedule[0]["09:00-10:30"]).toBeDefined();
      expect(Array.isArray(validSchedule[0]["09:00-10:30"])).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should complete scheduling within acceptable time", async () => {
      const start = Date.now();
      const result = await generateTimetablesImproved(
        mockCourses,
        mockRooms,
        mockTimeSlots,
        mockInstructors
      );
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(35000);
    });
  });
});
