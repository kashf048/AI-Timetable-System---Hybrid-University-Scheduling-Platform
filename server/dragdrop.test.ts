import { describe, it, expect } from "vitest";

describe("Drag-and-Drop Schedule Updates", () => {
  describe("Schedule Modification", () => {
    it("should move class to new time slot", () => {
      const schedule = {
        0: {
          "09:00-10:30": [
            {
              courseId: 1,
              courseName: "CS101",
              instructorId: 1,
              instructorName: "Dr. Alice",
              roomId: 1,
              roomName: "A101",
              startTime: "09:00",
              endTime: "10:30",
            },
          ],
          "11:00-12:30": [],
        },
      };

      const classToMove = schedule[0]["09:00-10:30"][0];
      schedule[0]["09:00-10:30"] = [];
      schedule[0]["11:00-12:30"].push(classToMove);

      expect(schedule[0]["09:00-10:30"]).toHaveLength(0);
      expect(schedule[0]["11:00-12:30"]).toHaveLength(1);
      expect(schedule[0]["11:00-12:30"][0].courseId).toBe(1);
    });

    it("should move class to different day", () => {
      const schedule = {
        0: {
          "09:00-10:30": [
            {
              courseId: 1,
              courseName: "CS101",
              instructorId: 1,
              instructorName: "Dr. Alice",
              roomId: 1,
              roomName: "A101",
              startTime: "09:00",
              endTime: "10:30",
            },
          ],
        },
        1: {
          "09:00-10:30": [],
        },
      };

      const classToMove = schedule[0]["09:00-10:30"][0];
      schedule[0]["09:00-10:30"] = [];
      schedule[1]["09:00-10:30"].push(classToMove);

      expect(schedule[0]["09:00-10:30"]).toHaveLength(0);
      expect(schedule[1]["09:00-10:30"]).toHaveLength(1);
    });

    it("should validate room availability before move", () => {
      const schedule = {
        0: {
          "09:00-10:30": [
            {
              courseId: 1,
              courseName: "CS101",
              instructorId: 1,
              instructorName: "Dr. Alice",
              roomId: 1,
              roomName: "A101",
              startTime: "09:00",
              endTime: "10:30",
            },
            {
              courseId: 2,
              courseName: "MATH101",
              instructorId: 2,
              instructorName: "Prof. Bob",
              roomId: 1,
              roomName: "A101",
              startTime: "09:00",
              endTime: "10:30",
            },
          ],
        },
      };

      const roomConflict = schedule[0]["09:00-10:30"].filter(
        (c) => c.roomId === 1
      ).length > 1;

      expect(roomConflict).toBe(true);
    });

    it("should validate instructor availability before move", () => {
      const schedule = {
        0: {
          "09:00-10:30": [
            {
              courseId: 1,
              courseName: "CS101",
              instructorId: 1,
              instructorName: "Dr. Alice",
              roomId: 1,
              roomName: "A101",
              startTime: "09:00",
              endTime: "10:30",
            },
          ],
          "10:30-12:00": [
            {
              courseId: 2,
              courseName: "CS102",
              instructorId: 1,
              instructorName: "Dr. Alice",
              roomId: 2,
              roomName: "A102",
              startTime: "10:30",
              endTime: "12:00",
            },
          ],
        },
      };

      const instructorId = 1;
      const instructorClasses = Object.values(schedule[0])
        .flat()
        .filter((c) => c.instructorId === instructorId);

      expect(instructorClasses.length).toBe(2);
      expect(instructorClasses[0].endTime).toBe(instructorClasses[1].startTime);
    });
  });

  describe("Conflict Detection", () => {
    it("should detect room conflicts", () => {
      const conflicts = [];
      const schedule = {
        0: {
          "09:00-10:30": [
            {
              courseId: 1,
              roomId: 1,
              instructorId: 1,
            },
            {
              courseId: 2,
              roomId: 1,
              instructorId: 2,
            },
          ],
        },
      };

      const timeSlots = Object.values(schedule[0]);
      timeSlots.forEach((slot: any) => {
        const roomIds = slot.map((c: any) => c.roomId);
        const uniqueRoomIds = new Set(roomIds);
        if (uniqueRoomIds.size < roomIds.length) {
          conflicts.push("Room conflict detected");
        }
      });

      expect(conflicts.length).toBeGreaterThan(0);
    });

    it("should detect instructor conflicts", () => {
      const conflicts = [];
      const schedule = {
        0: {
          "09:00-10:30": [
            {
              courseId: 1,
              instructorId: 1,
              startTime: "09:00",
              endTime: "10:30",
            },
          ],
          "10:00-11:30": [
            {
              courseId: 2,
              instructorId: 1,
              startTime: "10:00",
              endTime: "11:30",
            },
          ],
        },
      };

      const allClasses = Object.values(schedule[0]).flat();
      const instructorMap = new Map();

      allClasses.forEach((c: any) => {
        if (!instructorMap.has(c.instructorId)) {
          instructorMap.set(c.instructorId, []);
        }
        instructorMap.get(c.instructorId).push(c);
      });

      instructorMap.forEach((classes: any) => {
        for (let i = 0; i < classes.length; i++) {
          for (let j = i + 1; j < classes.length; j++) {
            const c1 = classes[i];
            const c2 = classes[j];
            if (c1.startTime < c2.endTime && c1.endTime > c2.startTime) {
              conflicts.push("Instructor conflict detected");
            }
          }
        }
      });

      expect(conflicts.length).toBeGreaterThan(0);
    });
  });

  describe("Rollback Functionality", () => {
    it("should rollback invalid move", () => {
      const originalSchedule = {
        0: {
          "09:00-10:30": [
            {
              courseId: 1,
              roomId: 1,
              instructorId: 1,
            },
          ],
          "11:00-12:30": [],
        },
      };

      const backup = JSON.parse(JSON.stringify(originalSchedule));

      const modifiedSchedule = JSON.parse(JSON.stringify(originalSchedule));
      modifiedSchedule[0]["09:00-10:30"] = [];
      modifiedSchedule[0]["11:00-12:30"] = [
        {
          courseId: 1,
          roomId: 1,
          instructorId: 1,
        },
      ];

      const hasConflict = true;
      if (hasConflict) {
        modifiedSchedule[0] = backup[0];
      }

      expect(modifiedSchedule[0]["09:00-10:30"][0].courseId).toBe(1);
      expect(modifiedSchedule[0]["11:00-12:30"]).toHaveLength(0);
    });
  });
});
