import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import TimetableGrid from "@/components/TimetableGrid";
import TimetableGridDraggable from "@/components/TimetableGridDraggable";

export default function TimetableViews() {
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");
  const [viewType, setViewType] = useState<"instructor" | "room" | "course">("room");
  const [filterId, setFilterId] = useState<number | undefined>();
  const [editMode, setEditMode] = useState(false);

  const timetablesQuery = trpc.scheduling.timetable.list.useQuery();
  const instructorsQuery = trpc.scheduling.instructor.list.useQuery();
  const roomsQuery = trpc.scheduling.room.list.useQuery();
  const coursesQuery = trpc.scheduling.course.list.useQuery();

  const selectedTimetable = timetablesQuery.data?.find(
    (t) => t.id.toString() === selectedTimetableId
  );

  const getFilterOptions = () => {
    switch (viewType) {
      case "instructor":
        return instructorsQuery.data?.map((i) => ({ id: i.id, name: i.name })) || [];
      case "room":
        return roomsQuery.data?.map((r) => ({ id: r.id, name: r.name })) || [];
      case "course":
        return coursesQuery.data?.map((c) => ({ id: c.id, name: c.name })) || [];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timetable Views</h1>
        <p className="text-gray-600 mt-2">
          View and manage your timetables with multiple perspectives
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timetable">Select Timetable</Label>
              <Select value={selectedTimetableId} onValueChange={setSelectedTimetableId}>
                <SelectTrigger id="timetable">
                  <SelectValue placeholder="Choose a timetable" />
                </SelectTrigger>
                <SelectContent>
                  {timetablesQuery.isLoading ? (
                    <div className="p-2 text-sm text-gray-600">Loading...</div>
                  ) : (
                    timetablesQuery.data?.map((timetable) => (
                      <SelectItem key={timetable.id} value={timetable.id.toString()}>
                        {timetable.name} ({timetable.status})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="viewType">View Type</Label>
              <Select value={viewType} onValueChange={(value) => {
                setViewType(value as any);
                setFilterId(undefined);
              }}>
                <SelectTrigger id="viewType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room">By Room</SelectItem>
                  <SelectItem value="instructor">By Instructor</SelectItem>
                  <SelectItem value="course">By Course</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter">Filter</Label>
              <Select
                value={filterId?.toString() || ""}
                onValueChange={(value) => setFilterId(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger id="filter">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {getFilterOptions().map((option) => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant={editMode ? "destructive" : "default"}
                onClick={() => setEditMode(!editMode)}
                className="w-full"
                disabled={!selectedTimetable}
              >
                {editMode ? "Exit Edit Mode" : "Edit Schedule"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedTimetable ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{selectedTimetable.name}</CardTitle>
              <CardDescription>
                Status: {selectedTimetable.status} | Score: {selectedTimetable.score ? (selectedTimetable.score as any).toFixed(2) : "N/A"} | Conflicts: {selectedTimetable.conflictCount || 0}
              </CardDescription>
            </CardHeader>
          </Card>

          {editMode ? (
            <TimetableGridDraggable
              timetableId={selectedTimetable.id}
              schedule={selectedTimetable.schedule as any}
              viewType={viewType}
              filterId={filterId}
              onScheduleUpdate={() => {
                timetablesQuery.refetch();
                setEditMode(false);
              }}
            />
          ) : (
            <TimetableGrid
              schedule={selectedTimetable.schedule as any}
              viewType={viewType}
              filterId={filterId}
            />
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            {timetablesQuery.isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              "Select a timetable to view"
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
