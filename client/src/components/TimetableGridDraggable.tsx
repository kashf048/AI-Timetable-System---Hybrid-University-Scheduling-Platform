import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, GripVertical } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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

interface TimetableGridDraggableProps {
  timetableId: number;
  schedule: Record<number, Record<string, ScheduleEntry[]>>;
  viewType?: "instructor" | "room" | "course";
  filterId?: number;
  onScheduleUpdate?: (newSchedule: Record<number, Record<string, ScheduleEntry[]>>) => void;
}

export default function TimetableGridDraggable({
  timetableId,
  schedule,
  viewType = "course",
  filterId,
  onScheduleUpdate,
}: TimetableGridDraggableProps) {
  const [localSchedule, setLocalSchedule] = useState(schedule);
  const [draggedItem, setDraggedItem] = useState<{
    day: number;
    time: string;
    index: number;
  } | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const updateScheduleMutation = trpc.scheduling.schedule.updateSchedule.useMutation();

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Get all unique time slots
  const timeSlots = new Set<string>();
  Object.values(localSchedule).forEach((daySchedule) => {
    Object.keys(daySchedule).forEach((time) => {
      timeSlots.add(time);
    });
  });
  const sortedTimeSlots = Array.from(timeSlots).sort();

  // Filter entries based on view type and filter ID
  const getFilteredEntries = (entries: ScheduleEntry[]) => {
    if (!filterId) return entries;

    switch (viewType) {
      case "instructor":
        return entries.filter((e) => e.instructorId === filterId);
      case "room":
        return entries.filter((e) => e.roomId === filterId);
      case "course":
        return entries.filter((e) => e.courseId === filterId);
      default:
        return entries;
    }
  };

  const handleDragStart = (day: number, time: string, index: number) => {
    setDraggedItem({ day, time, index });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (destDay: number, destTime: string, destIndex: number) => {
    if (!draggedItem) return;

    const { day: sourceDay, time: sourceTime, index: sourceIndex } = draggedItem;

    if (sourceDay === destDay && sourceTime === destTime && sourceIndex === destIndex) {
      setDraggedItem(null);
      return;
    }

    const newSchedule = JSON.parse(JSON.stringify(localSchedule));

    // Get the entry being moved
    const sourceEntries = newSchedule[sourceDay]?.[sourceTime] || [];
    if (sourceIndex >= sourceEntries.length) {
      setDraggedItem(null);
      return;
    }

    const [movedEntry] = sourceEntries.splice(sourceIndex, 1);

    // Add to destination
    if (!newSchedule[destDay]) newSchedule[destDay] = {};
    if (!newSchedule[destDay][destTime]) newSchedule[destDay][destTime] = [];

    newSchedule[destDay][destTime].splice(destIndex, 0, movedEntry);

    setConflicts([]);
    setLocalSchedule(newSchedule);
    setDraggedItem(null);

    // Update in database
    try {
      await updateScheduleMutation.mutateAsync({
        timetableId,
        schedule: newSchedule,
      });

      toast.success("Schedule updated successfully");
      onScheduleUpdate?.(newSchedule);
    } catch (error) {
      toast.error("Failed to update schedule");
      console.error(error);
      setLocalSchedule(schedule); // Revert on error
    }
  };

  return (
    <div className="space-y-4">
      {conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Conflicts Detected:</div>
            <ul className="list-disc list-inside space-y-1">
              {conflicts.map((conflict, idx) => (
                <li key={idx} className="text-sm">
                  {conflict}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="p-3 text-left font-semibold text-gray-700 w-24">
                Day
              </th>
              {sortedTimeSlots.map((time) => (
                <th
                  key={time}
                  className="p-3 text-center font-semibold text-gray-700 min-w-[200px]"
                >
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day, dayIndex) => (
              <tr key={dayIndex} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-700 bg-gray-50">
                  {day}
                </td>
                {sortedTimeSlots.map((time) => {
                  const entries = localSchedule[dayIndex]?.[time] || [];
                  const filteredEntries = getFilteredEntries(entries);

                  return (
                    <td
                      key={`${dayIndex}-${time}`}
                      className="p-2 align-top min-w-[200px] bg-white"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(dayIndex, time, filteredEntries.length)}
                    >
                      {filteredEntries.length === 0 && !filterId ? (
                        <div className="text-center text-gray-400 text-sm py-8">
                          No classes
                        </div>
                      ) : filteredEntries.length === 0 && filterId ? (
                        <div className="text-center text-gray-300 text-sm py-8">
                          Filtered out
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredEntries.map((entry, idx) => (
                            <div
                              key={`${dayIndex}-${time}-${idx}`}
                              draggable
                              onDragStart={() => handleDragStart(dayIndex, time, idx)}
                              onDrop={(e) => {
                                e.stopPropagation();
                                handleDrop(dayIndex, time, idx);
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              className="mb-2 cursor-grab active:cursor-grabbing"
                            >
                              <Card className="p-3 bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-2">
                                  <GripVertical className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-blue-900 truncate">
                                      {entry.courseName}
                                    </p>
                                    <p className="text-xs text-blue-700 truncate">
                                      {entry.instructorName}
                                    </p>
                                    <p className="text-xs text-blue-600 truncate">
                                      {entry.roomName}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                      {entry.startTime} - {entry.endTime}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button
          variant="outline"
          onClick={() => {
            setLocalSchedule(schedule);
            setConflicts([]);
          }}
        >
          Reset Changes
        </Button>
        <Button
          onClick={async () => {
            try {
              await updateScheduleMutation.mutateAsync({
                timetableId,
                schedule: localSchedule,
              });
              toast.success("All changes saved successfully");
              onScheduleUpdate?.(localSchedule);
            } catch (error) {
              toast.error("Failed to save changes");
            }
          }}
          disabled={updateScheduleMutation.isPending}
        >
          {updateScheduleMutation.isPending ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
