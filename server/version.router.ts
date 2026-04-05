import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { timetableVersions, timetables, auditTrail } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Version control and rollback procedures
 */
export const versionRouter = router({
  /**
   * Get all versions of a timetable
   */
  listVersions: protectedProcedure
    .input(z.object({ timetableId: z.number().positive() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const versions = await db
        .select()
        .from(timetableVersions)
        .where(eq(timetableVersions.timetableId, input.timetableId))
        .orderBy(timetableVersions.createdAt);

      return versions;
    }),

  /**
   * Get specific version
   */
  getVersion: protectedProcedure
    .input(z.object({ versionId: z.number().positive() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const version = await db
        .select()
        .from(timetableVersions)
        .where(eq(timetableVersions.id, input.versionId))
        .limit(1);

      if (version.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });
      }

      return version[0];
    }),

  /**
   * Compare two versions
   */
  compareVersions: protectedProcedure
    .input(
      z.object({
        versionId1: z.number().positive(),
        versionId2: z.number().positive(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const version1 = await db
        .select()
        .from(timetableVersions)
        .where(eq(timetableVersions.id, input.versionId1))
        .limit(1);

      const version2 = await db
        .select()
        .from(timetableVersions)
        .where(eq(timetableVersions.id, input.versionId2))
        .limit(1);

      if (version1.length === 0 || version2.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });
      }

      const v1 = version1[0];
      const v2 = version2[0];

      // Parse schedule data
      const schedule1 = v1.schedule ? JSON.parse(JSON.stringify(v1.schedule)) : {};
      const schedule2 = v2.schedule ? JSON.parse(JSON.stringify(v2.schedule)) : {};

      // Calculate differences
      const differences = {
        added: [] as any[],
        removed: [] as any[],
        modified: [] as any[],
      };

      // Find added and modified entries
      for (const [dayKey, daySchedule] of Object.entries(schedule2)) {
        const daySchedule2 = daySchedule as Record<string, any[]>;
        const daySchedule1 = (schedule1[dayKey] || {}) as Record<string, any[]>;

        for (const [timeKey, entries] of Object.entries(daySchedule2)) {
          const entries1 = daySchedule1[timeKey] || [];
          const entries2 = entries as any[];

          if (entries1.length === 0) {
            differences.added.push(...entries2);
          } else if (JSON.stringify(entries1) !== JSON.stringify(entries2)) {
            differences.modified.push({
              before: entries1,
              after: entries2,
            });
          }
        }
      }

      // Find removed entries
      for (const [dayKey, daySchedule] of Object.entries(schedule1)) {
        const daySchedule1 = daySchedule as Record<string, any[]>;
        const daySchedule2 = (schedule2[dayKey] || {}) as Record<string, any[]>;

        for (const [timeKey, entries] of Object.entries(daySchedule1)) {
          if (!daySchedule2[timeKey]) {
            differences.removed.push(...entries);
          }
        }
      }

      return {
        version1: v1,
        version2: v2,
        differences,
        summary: {
          added: differences.added.length,
          removed: differences.removed.length,
          modified: differences.modified.length,
        },
      };
    }),

  /**
   * Rollback to previous version
   */
  rollbackToVersion: protectedProcedure
    .input(
      z.object({
        versionId: z.number().positive(),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const version = await db
        .select()
        .from(timetableVersions)
        .where(eq(timetableVersions.id, input.versionId))
        .limit(1);

      if (version.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });
      }

      const v = version[0];

      // Update timetable with version data
      await db
        .update(timetables)
        .set({
          schedule: v.schedule,
          score: v.score,
          updatedAt: new Date(),
        })
        .where(eq(timetables.id, v.timetableId));

      // Create audit log
      await db.insert(auditTrail).values({
        action: "ROLLBACK",
        entityType: "timetable",
        entityId: v.timetableId,
        userId: ctx.user?.id,
        changes: JSON.stringify({
          fromVersion: version[0].id,
          toVersion: input.versionId,
          reason: input.reason,
        }),
        createdAt: new Date(),
      });

      return {
        success: true,
        message: `Rolled back to version ${input.versionId}`,
        timetableId: v.timetableId,
      };
    }),

  /**
   * Create new version (snapshot current state)
   */
  createVersion: protectedProcedure
    .input(
      z.object({
        timetableId: z.number().positive(),
        description: z.string().max(500),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const timetable = await db
        .select()
        .from(timetables)
        .where(eq(timetables.id, input.timetableId))
        .limit(1);

      if (timetable.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Timetable not found" });
      }

      const t = timetable[0];

      // Get current version count
      const versions = await db
        .select()
        .from(timetableVersions)
        .where(eq(timetableVersions.timetableId, t.id));

      const nextVersion = versions.length + 1;

      // Create version
      await db.insert(timetableVersions).values({
        timetableId: t.id,
        versionNumber: nextVersion,
        schedule: t.schedule,
        score: t.score,
        changeDescription: input.description,
        changedBy: ctx.user?.id,
        createdAt: new Date(),
      });

      // Create audit log
      await db.insert(auditTrail).values({
        action: "CREATE_VERSION",
        entityType: "timetable_version",
        entityId: t.id,
        userId: ctx.user?.id,
        changes: JSON.stringify({
          description: input.description,
          versionNumber: nextVersion,
        }),
        createdAt: new Date(),
      });

      return {
        success: true,
        message: "Version created successfully",
        versionNumber: nextVersion,
      };
    }),

  /**
   * Get audit trail for timetable
   */
  getAuditTrail: protectedProcedure
    .input(z.object({ timetableId: z.number().positive() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const trail = await db
        .select()
        .from(auditTrail)
        .where(eq(auditTrail.entityId, input.timetableId))
        .orderBy(auditTrail.createdAt);

      return trail;
    }),
});
