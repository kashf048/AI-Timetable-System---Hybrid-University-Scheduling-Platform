import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  exportTimetableToPDF,
  exportTimetableToExcel,
  exportTimetableToJSON,
  exportTimetableToCSV,
} from "./export.service";
import { createAuditLog } from "./db";

export const exportRouter = router({
  /**
   * Export timetable to PDF
   */
  toPDF: protectedProcedure
    .input(
      z.object({
        timetableId: z.number(),
        title: z.string().optional(),
        includeScore: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const pdf = await exportTimetableToPDF(input.timetableId, {
          title: input.title,
          includeScore: input.includeScore,
        });

        await createAuditLog({
          action: "EXPORT_PDF",
          entityType: "timetable",
          entityId: input.timetableId,
          userId: ctx.user?.id,
        });

        return {
          success: true,
          data: pdf.toString("base64"),
          filename: `timetable-${input.timetableId}.pdf`,
        };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "PDF export failed");
      }
    }),

  /**
   * Export timetable to Excel
   */
  toExcel: protectedProcedure
    .input(
      z.object({
        timetableId: z.number(),
        title: z.string().optional(),
        includeScore: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const excel = await exportTimetableToExcel(input.timetableId, {
          title: input.title,
          includeScore: input.includeScore,
        });

        await createAuditLog({
          action: "EXPORT_EXCEL",
          entityType: "timetable",
          entityId: input.timetableId,
          userId: ctx.user?.id,
        });

        return {
          success: true,
          data: excel.toString("base64"),
          filename: `timetable-${input.timetableId}.xlsx`,
        };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Excel export failed");
      }
    }),

  /**
   * Export timetable to JSON
   */
  toJSON: protectedProcedure
    .input(z.object({ timetableId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const json = await exportTimetableToJSON(input.timetableId);

        await createAuditLog({
          action: "EXPORT_JSON",
          entityType: "timetable",
          entityId: input.timetableId,
          userId: ctx.user?.id,
        });

        return {
          success: true,
          data: json,
          filename: `timetable-${input.timetableId}.json`,
        };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "JSON export failed");
      }
    }),

  /**
   * Export timetable to CSV
   */
  toCSV: protectedProcedure
    .input(z.object({ timetableId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const csv = await exportTimetableToCSV(input.timetableId);

        await createAuditLog({
          action: "EXPORT_CSV",
          entityType: "timetable",
          entityId: input.timetableId,
          userId: ctx.user?.id,
        });

        return {
          success: true,
          data: csv,
          filename: `timetable-${input.timetableId}.csv`,
        };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "CSV export failed");
      }
    }),
});
