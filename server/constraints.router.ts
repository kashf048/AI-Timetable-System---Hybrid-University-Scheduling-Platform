import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { hardConstraints, softConstraints } from "../drizzle/schema";
import { createAuditLog } from "./db";

/**
 * Hard constraints: Must be satisfied (room capacity, instructor availability, time conflicts)
 */
const hardConstraintsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["room_capacity", "instructor_availability", "no_overlap", "time_unavailable"]),
        courseId: z.number().optional(),
        instructorId: z.number().optional(),
        roomId: z.number().optional(),
        timeSlotId: z.number().optional(),
        description: z.string().optional(),
        weight: z.number().default(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(hardConstraints).values(input as any);
      await createAuditLog({
        action: "CREATE_HARD_CONSTRAINT",
        entityType: "hardConstraint",
        userId: ctx.user?.id,
      });
      return result;
    }),

  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(hardConstraints);
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.delete(hardConstraints).where(eq(hardConstraints.id, input.id));
      await createAuditLog({
        action: "DELETE_HARD_CONSTRAINT",
        entityType: "hardConstraint",
        entityId: input.id,
        userId: ctx.user?.id,
      });
      return result;
    }),
});

/**
 * Soft constraints: Preferences to optimize (instructor preferences, room preferences, time distribution)
 */
const softConstraintsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["instructor_preference", "room_preference", "time_distribution", "minimize_gaps"]),
        instructorId: z.number().optional(),
        roomId: z.number().optional(),
        timeSlotId: z.number().optional(),
        preferredValue: z.string().optional(),
        description: z.string().optional(),
        weight: z.number().default(50),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(softConstraints).values(input as any);
      await createAuditLog({
        action: "CREATE_SOFT_CONSTRAINT",
        entityType: "softConstraint",
        userId: ctx.user?.id,
      });
      return result;
    }),

  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(softConstraints);
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.delete(softConstraints).where(eq(softConstraints.id, input.id));
      await createAuditLog({
        action: "DELETE_SOFT_CONSTRAINT",
        entityType: "softConstraint",
        entityId: input.id,
        userId: ctx.user?.id,
      });
      return result;
    }),
});

export const constraintsRouter = router({
  hardConstraints: hardConstraintsRouter,
  softConstraints: softConstraintsRouter,
});
