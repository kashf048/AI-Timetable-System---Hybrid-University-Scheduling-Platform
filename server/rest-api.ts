import { Router, Request, Response } from "express";
import {
  getTimetables,
  getTimetable,
  getCourses,
  getInstructors,
  getRooms,
  getTimeSlots,
  getConflictsByTimetable,
  getTimetableVersions,
} from "./db";

const router = Router();

/**
 * GET /api/rest/timetables
 * Get all timetables
 */
router.get("/timetables", async (req: Request, res: Response) => {
  try {
    const timetables = await getTimetables();
    res.json({
      success: true,
      data: timetables,
      count: timetables.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/rest/timetables/:id
 * Get a specific timetable with conflicts
 */
router.get("/timetables/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const timetable = await getTimetable(id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        error: "Timetable not found",
      });
    }

    const conflicts = await getConflictsByTimetable(id);

    res.json({
      success: true,
      data: {
        ...timetable,
        conflicts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/rest/timetables/:id/versions
 * Get version history for a timetable
 */
router.get("/timetables/:id/versions", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const versions = await getTimetableVersions(id);

    res.json({
      success: true,
      data: versions,
      count: versions.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/rest/courses
 * Get all courses
 */
router.get("/courses", async (req: Request, res: Response) => {
  try {
    const courses = await getCourses();
    res.json({
      success: true,
      data: courses,
      count: courses.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/rest/instructors
 * Get all instructors
 */
router.get("/instructors", async (req: Request, res: Response) => {
  try {
    const instructors = await getInstructors();
    res.json({
      success: true,
      data: instructors,
      count: instructors.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/rest/rooms
 * Get all rooms
 */
router.get("/rooms", async (req: Request, res: Response) => {
  try {
    const rooms = await getRooms();
    res.json({
      success: true,
      data: rooms,
      count: rooms.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/rest/timeslots
 * Get all time slots
 */
router.get("/timeslots", async (req: Request, res: Response) => {
  try {
    const timeSlots = await getTimeSlots();
    res.json({
      success: true,
      data: timeSlots,
      count: timeSlots.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/rest/health
 * Health check endpoint
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
