import { PDFDocument, rgb } from "pdf-lib";
import ExcelJS from "exceljs";
import { getTimetable, getInstructors, getCourses, getRooms } from "./db";

interface ExportOptions {
  title?: string;
  includeConflicts?: boolean;
  includeScore?: boolean;
}

/**
 * Export timetable to PDF
 */
export async function exportTimetableToPDF(
  timetableId: number,
  options: ExportOptions = {}
) {
  try {
    const timetable = await getTimetable(timetableId);
    if (!timetable) {
      throw new Error("Timetable not found");
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([850, 1100]);
    const { width, height } = page.getSize();

    // Title
    page.drawText(options.title || timetable.name, {
      x: 50,
      y: height - 50,
      size: 24,
      color: rgb(0, 0, 0),
    });

    // Metadata
    let yPosition = height - 100;
    page.drawText(`Status: ${timetable.status}`, {
      x: 50,
      y: yPosition,
      size: 12,
      color: rgb(0.5, 0.5, 0.5),
    });

    if (options.includeScore && timetable.score) {
      yPosition -= 20;
      page.drawText(`Quality Score: ${timetable.score}`, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    yPosition -= 40;

    // Schedule table header
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const colWidth = (width - 100) / 5;

    // Draw day headers
    days.forEach((day, index) => {
      page.drawText(day, {
        x: 50 + index * colWidth,
        y: yPosition,
        size: 11,
        color: rgb(0, 0, 0),
      });
    });

    yPosition -= 30;

    // Draw schedule entries (simplified)
    const schedule = timetable.schedule as Record<string, Record<string, any[]>>;
    let entryCount = 0;
    const maxEntries = 20; // Limit entries per page

    for (const [dayNum, daySchedule] of Object.entries(schedule)) {
      for (const [timeSlot, entries] of Object.entries(daySchedule)) {
        if (entryCount >= maxEntries) break;

        for (const entry of entries) {
          if (entryCount >= maxEntries) break;

          const dayIndex = parseInt(dayNum);
          const xPos = 50 + dayIndex * colWidth;

          page.drawText(`${entry.courseName}`, {
            x: xPos,
            y: yPosition,
            size: 9,
            color: rgb(0, 0, 0),
          });

          page.drawText(`${entry.instructorName}`, {
            x: xPos,
            y: yPosition - 12,
            size: 8,
            color: rgb(0.3, 0.3, 0.3),
          });

          page.drawText(`${entry.roomName}`, {
            x: xPos,
            y: yPosition - 22,
            size: 8,
            color: rgb(0.3, 0.3, 0.3),
          });

          yPosition -= 35;
          entryCount++;
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("[Export] PDF generation failed:", error);
    throw error;
  }
}

/**
 * Export timetable to Excel
 */
export async function exportTimetableToExcel(
  timetableId: number,
  options: ExportOptions = {}
) {
  try {
    const timetable = await getTimetable(timetableId);
    if (!timetable) {
      throw new Error("Timetable not found");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Timetable");

    // Set column widths
    worksheet.columns = [
      { header: "Time Slot", key: "timeSlot", width: 15 },
      { header: "Monday", key: "monday", width: 30 },
      { header: "Tuesday", key: "tuesday", width: 30 },
      { header: "Wednesday", key: "wednesday", width: 30 },
      { header: "Thursday", key: "thursday", width: 30 },
      { header: "Friday", key: "friday", width: 30 },
    ];

    // Add title row
    worksheet.insertRows(1, [
      {
        timeSlot: options.title || timetable.name,
      },
    ]);

    // Add metadata
    worksheet.insertRows(2, [
      {
        timeSlot: `Status: ${timetable.status}`,
      },
    ]);

    if (options.includeScore && timetable.score) {
      worksheet.insertRows(3, [
        {
          timeSlot: `Quality Score: ${timetable.score}`,
        },
      ]);
    }

    worksheet.insertRows(4, [{}]); // Blank row

    // Add schedule data
    const schedule = timetable.schedule as Record<string, Record<string, any[]>>;
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    let rowIndex = 5;
    const timeSlots = new Set<string>();

    // Collect all time slots
    for (const daySchedule of Object.values(schedule)) {
      for (const timeSlot of Object.keys(daySchedule)) {
        timeSlots.add(timeSlot);
      }
    }

    // Add rows for each time slot
    for (const timeSlot of Array.from(timeSlots).sort()) {
      const row: Record<string, string> = { timeSlot };

      for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
        const daySchedule = schedule[dayIndex] || {};
        const entries = daySchedule[timeSlot] || [];

        if (entries.length > 0) {
          row[days[dayIndex]] = entries
            .map(
              (e: any) =>
                `${e.courseName}\n${e.instructorName}\n${e.roomName} (${e.startTime}-${e.endTime})`
            )
            .join("\n---\n");
        }
      }

      worksheet.addRow(row);
      rowIndex++;
    }

    // Style header row
    const headerRow = worksheet.getRow(5);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF366092" },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as ArrayBuffer);
  } catch (error) {
    console.error("[Export] Excel generation failed:", error);
    throw error;
  }
}

/**
 * Export schedule data as JSON
 */
export async function exportTimetableToJSON(timetableId: number) {
  try {
    const timetable = await getTimetable(timetableId);
    if (!timetable) {
      throw new Error("Timetable not found");
    }

    return JSON.stringify(timetable, null, 2);
  } catch (error) {
    console.error("[Export] JSON export failed:", error);
    throw error;
  }
}

/**
 * Export schedule data as CSV
 */
export async function exportTimetableToCSV(timetableId: number) {
  try {
    const timetable = await getTimetable(timetableId);
    if (!timetable) {
      throw new Error("Timetable not found");
    }

    const schedule = timetable.schedule as Record<string, Record<string, any[]>>;
    const rows: string[] = [];

    // Header
    rows.push("Day,Time Slot,Course,Instructor,Room,Start Time,End Time");

    // Data rows
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    for (const [dayNum, daySchedule] of Object.entries(schedule)) {
      const dayName = days[parseInt(dayNum)] || `Day ${dayNum}`;

      for (const [timeSlot, entries] of Object.entries(daySchedule)) {
        for (const entry of entries) {
          rows.push(
            `"${dayName}","${timeSlot}","${entry.courseName}","${entry.instructorName}","${entry.roomName}","${entry.startTime}","${entry.endTime}"`
          );
        }
      }
    }

    return rows.join("\n");
  } catch (error) {
    console.error("[Export] CSV export failed:", error);
    throw error;
  }
}
