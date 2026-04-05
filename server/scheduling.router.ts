import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createInstructor,
  getInstructors,
  getInstructor,
  updateInstructor,
  deleteInstructor,
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  createTimeSlot,
  getTimeSlots,
  getTimeSlot,
  deleteTimeSlot,
  createTimetable,
  getTimetables,
  getTimetable,
  updateTimetable,
  deleteTimetable,
  getConflictsByTimetable,
  deleteConflictsByTimetable,
  createConflict,
  createEmailNotification,
  getPendingEmailNotifications,
  updateEmailNotificationStatus,
  setInstructorAvailability,
  getInstructorAvailability,
  setRoomAvailability,
  getRoomAvailability,
  createTimetableVersion,
  getTimetableVersions,
  createAuditLog,
} from "./db";
import { generateTimetables } from "./scheduling/cspSolver";
import { optimizeTimetable } from "./scheduling/geneticOptimizer";
import { calculateScore, detectConflicts } from "./scheduling/scoring";

/**
 * Instructor management procedures
 */
const instructorRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        department: z.string().optional(),
        maxHoursPerWeek: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createInstructor(input);
      await createAuditLog({
        action: "CREATE_INSTRUCTOR",
        entityType: "instructor",
        userId: ctx.user?.id,
      });
      return result;
    }),

  list: publicProcedure.query(async () => {
    return await getInstructors();
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getInstructor(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        department: z.string().optional(),
        maxHoursPerWeek: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const result = await updateInstructor(id, data);
      await createAuditLog({
        action: "UPDATE_INSTRUCTOR",
        entityType: "instructor",
        entityId: id,
        userId: ctx.user?.id,
      });
      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const result = await deleteInstructor(input.id);
      await createAuditLog({
        action: "DELETE_INSTRUCTOR",
        entityType: "instructor",
        entityId: input.id,
        userId: ctx.user?.id,
      });
      return result;
    }),
});

/**
 * Course management procedures
 */
const courseRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        name: z.string(),
        description: z.string().optional(),
        instructorId: z.number(),
        slotsPerWeek: z.number(),
        durationMinutes: z.number().optional(),
        studentCount: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createCourse(input);
      await createAuditLog({
        action: "CREATE_COURSE",
        entityType: "course",
        userId: ctx.user?.id,
      });
      return result;
    }),

  list: publicProcedure.query(async () => {
    return await getCourses();
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getCourse(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        code: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        instructorId: z.number().optional(),
        slotsPerWeek: z.number().optional(),
        durationMinutes: z.number().optional(),
        studentCount: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const result = await updateCourse(id, data);
      await createAuditLog({
        action: "UPDATE_COURSE",
        entityType: "course",
        entityId: id,
        userId: ctx.user?.id,
      });
      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const result = await deleteCourse(input.id);
      await createAuditLog({
        action: "DELETE_COURSE",
        entityType: "course",
        entityId: input.id,
        userId: ctx.user?.id,
      });
      return result;
    }),
});

/**
 * Room management procedures
 */
const roomRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        name: z.string(),
        building: z.string().optional(),
        floor: z.number().optional(),
        capacity: z.number(),
        hasProjector: z.boolean().optional(),
        hasWhiteboard: z.boolean().optional(),
        hasComputers: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createRoom(input);
      await createAuditLog({
        action: "CREATE_ROOM",
        entityType: "room",
        userId: ctx.user?.id,
      });
      return result;
    }),

  list: publicProcedure.query(async () => {
    return await getRooms();
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getRoom(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        code: z.string().optional(),
        name: z.string().optional(),
        building: z.string().optional(),
        floor: z.number().optional(),
        capacity: z.number().optional(),
        hasProjector: z.boolean().optional(),
        hasWhiteboard: z.boolean().optional(),
        hasComputers: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const result = await updateRoom(id, data);
      await createAuditLog({
        action: "UPDATE_ROOM",
        entityType: "room",
        entityId: id,
        userId: ctx.user?.id,
      });
      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const result = await deleteRoom(input.id);
      await createAuditLog({
        action: "DELETE_ROOM",
        entityType: "room",
        entityId: input.id,
        userId: ctx.user?.id,
      });
      return result;
    }),
});

/**
 * Time slot management procedures
 */
const timeSlotRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        dayOfWeek: z.number(),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createTimeSlot(input);
      await createAuditLog({
        action: "CREATE_TIMESLOT",
        entityType: "timeSlot",
        userId: ctx.user?.id,
      });
      return result;
    }),

  list: publicProcedure.query(async () => {
    return await getTimeSlots();
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getTimeSlot(input.id);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const result = await deleteTimeSlot(input.id);
      await createAuditLog({
        action: "DELETE_TIMESLOT",
        entityType: "timeSlot",
        entityId: input.id,
        userId: ctx.user?.id,
      });
      return result;
    }),
});

/**
 * Timetable generation and optimization procedures
 */
const timetableRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        count: z.number().optional().default(3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Fetch all data
      const courses = await getCourses();
      const instructors = await getInstructors();
      const rooms = await getRooms();
      const timeSlots = await getTimeSlots();
      const instructorAvailabilities = await Promise.all(
        instructors.map((i) => getInstructorAvailability(i.id))
      ).then((results) => results.flat());
      const roomAvailabilities = await Promise.all(
        rooms.map((r) => getRoomAvailability(r.id))
      ).then((results) => results.flat());

      // Generate timetables
      const cspInput = {
        courses: courses.map((c) => ({
          id: c.id,
          instructorId: c.instructorId,
          slotsPerWeek: c.slotsPerWeek,
          durationMinutes: c.durationMinutes || 60,
          studentCount: c.studentCount || 30,
        })),
        instructors: instructors.map((i) => ({
          id: i.id,
          maxHoursPerWeek: i.maxHoursPerWeek || 20,
        })),
        rooms: rooms.map((r) => ({
          id: r.id,
          capacity: r.capacity,
        })),
        timeSlots: timeSlots.map((t) => ({
          id: t.id,
          dayOfWeek: t.dayOfWeek,
          startTime: t.startTime,
          endTime: t.endTime,
        })),
        instructorAvailability: instructorAvailabilities.map((a) => ({
          instructorId: a.instructorId,
          timeSlotId: a.timeSlotId,
          available: a.available ?? true,
        })),
        roomAvailability: roomAvailabilities.map((a) => ({
          roomId: a.roomId,
          timeSlotId: a.timeSlotId,
          available: a.available ?? true,
        })),
      };

      const schedules = generateTimetables(cspInput, input.count);

      // Save generated timetables
      const results = [];
      for (const schedule of schedules) {
        const scoring = calculateScore(schedule, {
          hardConstraints: [],
          softConstraints: [],
        });

        const timetable = await createTimetable({
          name: `${input.name} - Generated ${results.length + 1}`,
          type: "generated",
          status: "draft",
          schedule,
          score: scoring.score,
          conflictCount: scoring.hardConstraintViolations,
          createdBy: ctx.user?.id,
        });

        // Detect and save conflicts
        const detectedConflicts = detectConflicts(schedule, {
          hardConstraints: [],
          softConstraints: [],
        });

        for (const conflict of detectedConflicts) {
          await createConflict({
            timetableId: (timetable as any).insertId || 0,
            type: conflict.type as any,
            courseId: conflict.courseId,
            instructorId: conflict.instructorId,
            roomId: conflict.roomId,
            severity: conflict.severity,
            description: conflict.description,
          });
        }

        results.push({
          timetableId: (timetable as any).insertId || 0,
          schedule,
          score: scoring.score,
          conflicts: detectedConflicts.length,
        });
      }

      await createAuditLog({
        action: "GENERATE_TIMETABLE",
        entityType: "timetable",
        userId: ctx.user?.id,
      });

      return results;
    }),

  list: publicProcedure.query(async () => {
    return await getTimetables();
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const timetable = await getTimetable(input.id);
      const conflicts = await getConflictsByTimetable(input.id);
      return { ...timetable, conflicts };
    }),

  optimize: protectedProcedure
    .input(
      z.object({
        timetableId: z.number(),
        generations: z.number().optional().default(50),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const timetable = await getTimetable(input.timetableId);
      if (!timetable) throw new Error("Timetable not found");

      const courses = await getCourses();
      const rooms = await getRooms();
      const timeSlots = await getTimeSlots();

      const optimizationInput = {
        initialSchedule: timetable.schedule as any,
        courses: courses.map((c) => ({
          id: c.id,
          instructorId: c.instructorId,
          slotsPerWeek: c.slotsPerWeek,
        })),
        rooms: rooms.map((r) => ({
          id: r.id,
          capacity: r.capacity,
        })),
        timeSlots: timeSlots.map((t) => ({
          id: t.id,
          dayOfWeek: t.dayOfWeek,
          startTime: t.startTime,
          endTime: t.endTime,
        })),
      };

      const optimizedSchedules = optimizeTimetable(
        optimizationInput,
        input.generations
      );

      const results = [];
      for (const schedule of optimizedSchedules) {
        const scoring = calculateScore(schedule, {
          hardConstraints: [],
          softConstraints: [],
        });

        const newTimetable = await createTimetable({
          name: `${timetable.name} - Optimized ${results.length + 1}`,
          type: "optimized",
          status: "draft",
          schedule,
          score: scoring.score,
          conflictCount: scoring.hardConstraintViolations,
          createdBy: ctx.user?.id,
        });

        results.push({
          timetableId: (newTimetable as any).insertId || 0,
          schedule,
          score: scoring.score,
        });
      }

      await createAuditLog({
        action: "OPTIMIZE_TIMETABLE",
        entityType: "timetable",
        entityId: input.timetableId,
        userId: ctx.user?.id,
      });

      return results;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "active", "archived", "deprecated"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await updateTimetable(input.id, { status: input.status });
      await createAuditLog({
        action: "UPDATE_TIMETABLE_STATUS",
        entityType: "timetable",
        entityId: input.id,
        userId: ctx.user?.id,
      });
      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteConflictsByTimetable(input.id);
      const result = await deleteTimetable(input.id);
      await createAuditLog({
        action: "DELETE_TIMETABLE",
        entityType: "timetable",
        entityId: input.id,
        userId: ctx.user?.id,
      });
      return result;
    }),

  getVersions: publicProcedure
    .input(z.object({ timetableId: z.number() }))
    .query(async ({ input }) => {
      return await getTimetableVersions(input.timetableId);
    }),
});

/**
 * Availability management procedures
 */
const availabilityRouter = router({
  setInstructorAvailability: protectedProcedure
    .input(
      z.object({
        instructorId: z.number(),
        timeSlotId: z.number(),
        available: z.boolean(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await setInstructorAvailability(input);
      await createAuditLog({
        action: "SET_INSTRUCTOR_AVAILABILITY",
        entityType: "instructorAvailability",
        userId: ctx.user?.id,
      });
      return result;
    }),

  getInstructorAvailability: publicProcedure
    .input(z.object({ instructorId: z.number() }))
    .query(async ({ input }) => {
      return await getInstructorAvailability(input.instructorId);
    }),

  setRoomAvailability: protectedProcedure
    .input(
      z.object({
        roomId: z.number(),
        timeSlotId: z.number(),
        available: z.boolean(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await setRoomAvailability(input);
      await createAuditLog({
        action: "SET_ROOM_AVAILABILITY",
        entityType: "roomAvailability",
        userId: ctx.user?.id,
      });
      return result;
    }),

  getRoomAvailability: publicProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ input }) => {
      return await getRoomAvailability(input.roomId);
    }),
});

/**
 * Schedule update and conflict checking procedures
 */
const scheduleManagementRouter = router({
  updateSchedule: protectedProcedure
    .input(
      z.object({
        timetableId: z.number(),
        schedule: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const updated = await updateTimetable(input.timetableId, {
          schedule: input.schedule,
        });

        await createAuditLog({
          entityType: "timetable",
          entityId: input.timetableId,
          action: "UPDATE_SCHEDULE",
          userId: ctx.user.id,
          changes: { schedule: "updated" },
        });

        return { success: true, timetable: updated };
      } catch (error) {
        console.error("Failed to update schedule:", error);
        throw error;
      }
    }),

  checkConflicts: publicProcedure
    .input(
      z.object({
        schedule: z.record(z.string(), z.any()),
      })
    )
    .query(async ({ input }) => {
      try {
        const { detectConflicts: detectConflictsFunc } = await import(
          "./scheduling/conflictDetection"
        );
        const conflicts = detectConflictsFunc(input.schedule, [], []);
        return {
          success: true,
          conflicts,
          hasConflicts: conflicts.length > 0,
        };
      } catch (error) {
        console.error("Failed to check conflicts:", error);
        throw error;
      }
    }),
});

/**
 * Email notification procedures
 */
const emailRouter = router({
  getPending: protectedProcedure.query(async () => {
    return await getPendingEmailNotifications();
  }),

  markSent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await updateEmailNotificationStatus(input.id, "sent");
    }),

  markFailed: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await updateEmailNotificationStatus(input.id, "failed", input.reason);
    }),
});

export const schedulingRouter = router({
  instructor: instructorRouter,
  course: courseRouter,
  room: roomRouter,
  timeSlot: timeSlotRouter,
  timetable: timetableRouter,
  availability: availabilityRouter,
  email: emailRouter,
  schedule: scheduleManagementRouter,
});
