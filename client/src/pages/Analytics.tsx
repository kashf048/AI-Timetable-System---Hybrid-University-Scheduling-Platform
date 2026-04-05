import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Analytics() {
  const timetablesQuery = trpc.scheduling.timetable.list.useQuery();
  const instructorsQuery = trpc.scheduling.instructor.list.useQuery();
  const coursesQuery = trpc.scheduling.course.list.useQuery();
  const roomsQuery = trpc.scheduling.room.list.useQuery();

  const timetables = timetablesQuery.data || [];
  const instructors = instructorsQuery.data || [];
  const courses = coursesQuery.data || [];
  const rooms = roomsQuery.data || [];

  // Calculate statistics
  const stats = {
    totalTimetables: timetables.length,
    averageScore: timetables.length > 0 
      ? (timetables.reduce((sum: number, t: any) => sum + (t.score || 0), 0) / timetables.length).toFixed(2)
      : 0,
    totalInstructors: instructors.length,
    totalCourses: courses.length,
    totalRooms: rooms.length,
    averageConflicts: timetables.length > 0
      ? (timetables.reduce((sum: number, t: any) => sum + (t.conflictCount || 0), 0) / timetables.length).toFixed(2)
      : 0,
  };

  // Score distribution
  const scoreDistribution = [
    { range: "0-20", count: timetables.filter((t: any) => (t.score || 0) < 20).length },
    { range: "20-40", count: timetables.filter((t: any) => (t.score || 0) >= 20 && (t.score || 0) < 40).length },
    { range: "40-60", count: timetables.filter((t: any) => (t.score || 0) >= 40 && (t.score || 0) < 60).length },
    { range: "60-80", count: timetables.filter((t: any) => (t.score || 0) >= 60 && (t.score || 0) < 80).length },
    { range: "80-100", count: timetables.filter((t: any) => (t.score || 0) >= 80).length },
  ];

  // Status distribution
  const statusDistribution = [
    { name: "Draft", value: timetables.filter((t: any) => t.status === "draft").length },
    { name: "Active", value: timetables.filter((t: any) => t.status === "active").length },
    { name: "Archived", value: timetables.filter((t: any) => t.status === "archived").length },
  ];

  // Room utilization
  const roomUtilization = rooms.map((room: any) => ({
    name: room.name,
    capacity: room.capacity,
    utilization: Math.floor(Math.random() * 100), // Placeholder
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const isLoading = timetablesQuery.isLoading || instructorsQuery.isLoading || coursesQuery.isLoading || roomsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">
          View insights and statistics about your timetables
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Timetables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTimetables}</div>
            <p className="text-xs text-gray-600 mt-2">Generated schedules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageScore}</div>
            <p className="text-xs text-gray-600 mt-2">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageConflicts}</div>
            <p className="text-xs text-gray-600 mt-2">Per timetable</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resource Counts */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Summary</CardTitle>
            <CardDescription>Total entities in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">Instructors</span>
                <span className="text-2xl font-bold text-blue-600">{stats.totalInstructors}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-medium">Courses</span>
                <span className="text-2xl font-bold text-green-600">{stats.totalCourses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Rooms</span>
                <span className="text-2xl font-bold text-purple-600">{stats.totalRooms}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Timetable Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
          <CardDescription>Number of timetables in each score range</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Room Utilization */}
      {roomUtilization.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Room Utilization</CardTitle>
            <CardDescription>Average utilization by room</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="capacity" fill="#10b981" name="Capacity" />
                <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
