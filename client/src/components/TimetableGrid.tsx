import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ScheduleEntry {
  courseId: number;
  courseName: string;
  instructorId: number;
  instructorName: string;
  roomId: number;
  roomName: string;
  timeSlotId: number;
  startTime: string;
  endTime: string;
}

interface TimetableGridProps {
  schedule: Record<number, Record<string, ScheduleEntry[]>>;
  viewType?: "instructor" | "room" | "course";
  filterId?: number;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TimetableGrid({
  schedule,
  viewType = "room",
  filterId,
}: TimetableGridProps) {
  if (!schedule || Object.keys(schedule).length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No timetable data available
        </CardContent>
      </Card>
    );
  }

  // Get all unique time slots
  const timeSlots = new Set<string>();
  Object.values(schedule).forEach((daySchedule) => {
    Object.keys(daySchedule).forEach((timeSlot) => {
      timeSlots.add(timeSlot);
    });
  });

  const sortedTimeSlots = Array.from(timeSlots).sort();

  // Filter entries based on view type and filter ID
  const getDisplayEntries = (entries: ScheduleEntry[]) => {
    if (!filterId) return entries;

    return entries.filter((entry) => {
      switch (viewType) {
        case "instructor":
          return entry.instructorId === filterId;
        case "room":
          return entry.roomId === filterId;
        case "course":
          return entry.courseId === filterId;
        default:
          return true;
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timetable Grid</CardTitle>
        <CardDescription>
          View: {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
          {filterId && ` (ID: ${filterId})`}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Day</TableHead>
              {sortedTimeSlots.map((timeSlot) => (
                <TableHead key={timeSlot} className="text-center text-xs">
                  {timeSlot}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(schedule).map(([dayNum, daySchedule]) => (
              <TableRow key={dayNum}>
                <TableCell className="font-semibold">
                  {DAYS[parseInt(dayNum)] || `Day ${dayNum}`}
                </TableCell>
                {sortedTimeSlots.map((timeSlot) => {
                  const entries = daySchedule[timeSlot] || [];
                  const displayEntries = getDisplayEntries(entries);

                  return (
                    <TableCell key={`${dayNum}-${timeSlot}`} className="p-2 align-top">
                      <div className="space-y-1">
                        {displayEntries.map((entry, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-blue-50 border border-blue-200 rounded text-xs"
                          >
                            <div className="font-semibold text-blue-900">
                              {entry.courseName}
                            </div>
                            <div className="text-blue-700">{entry.instructorName}</div>
                            <div className="text-blue-600">{entry.roomName}</div>
                            <div className="text-blue-500 text-xs">
                              {entry.startTime} - {entry.endTime}
                            </div>
                          </div>
                        ))}
                        {entries.length > 0 && displayEntries.length === 0 && (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500">
                            Filtered out
                          </div>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
