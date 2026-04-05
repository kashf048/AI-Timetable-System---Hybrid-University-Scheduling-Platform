import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, BookOpen, Users, DoorOpen, Clock } from "lucide-react";
import { useState } from "react";
import InstructorForm from "@/components/InstructorForm";
import CourseForm from "@/components/CourseForm";
import RoomForm from "@/components/RoomForm";
import TimeSlotForm from "@/components/TimeSlotForm";
import TimetableGenerator from "@/components/TimetableGenerator";
import InstructorList from "@/components/InstructorList";
import CourseList from "@/components/CourseList";
import RoomList from "@/components/RoomList";
import TimeSlotList from "@/components/TimeSlotList";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showTimeSlotForm, setShowTimeSlotForm] = useState(false);

  const instructorsQuery = trpc.scheduling.instructor.list.useQuery();
  const coursesQuery = trpc.scheduling.course.list.useQuery();
  const roomsQuery = trpc.scheduling.room.list.useQuery();
  const timeSlotsQuery = trpc.scheduling.timeSlot.list.useQuery();
  const timetablesQuery = trpc.scheduling.timetable.list.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to access the timetable system</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Timetable Management System</h1>
          <p className="text-muted-foreground mt-2">
            Welcome, {user?.name || "User"}. Manage your university timetables efficiently.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Instructors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {instructorsQuery.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : instructorsQuery.data?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {coursesQuery.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : coursesQuery.data?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DoorOpen className="h-4 w-4" />
                Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {roomsQuery.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : roomsQuery.data?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timetables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timetablesQuery.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : timetablesQuery.data?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="instructors">Instructors</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Set up your timetable system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">1. Add Instructors</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a list of instructors with their availability and preferences.
                    </p>
                    <Button onClick={() => setActiveTab("instructors")} variant="outline" size="sm">
                      Go to Instructors
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">2. Add Courses</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Define courses with their instructors and scheduling requirements.
                    </p>
                    <Button onClick={() => setActiveTab("courses")} variant="outline" size="sm">
                      Go to Courses
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">3. Add Rooms</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create classrooms with capacity and facility information.
                    </p>
                    <Button onClick={() => setActiveTab("rooms")} variant="outline" size="sm">
                      Go to Rooms
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">4. Generate Timetable</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use AI algorithms to generate optimized timetables.
                    </p>
                    <Button onClick={() => setActiveTab("generate")} variant="outline" size="sm">
                      Generate Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructors Tab */}
          <TabsContent value="instructors" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Instructors</h2>
              <Button onClick={() => setShowInstructorForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Instructor
              </Button>
            </div>
            {showInstructorForm && (
              <InstructorForm onClose={() => setShowInstructorForm(false)} />
            )}
            <InstructorList />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Courses</h2>
              <Button onClick={() => setShowCourseForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
            {showCourseForm && (
              <CourseForm onClose={() => setShowCourseForm(false)} />
            )}
            <CourseList />
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Rooms</h2>
              <Button onClick={() => setShowRoomForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>
            {showRoomForm && (
              <RoomForm onClose={() => setShowRoomForm(false)} />
            )}
            <RoomList />
          </TabsContent>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-4">
            <h2 className="text-2xl font-bold">Generate Timetable</h2>
            <TimetableGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
