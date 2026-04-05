import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Users, BookOpen, Zap, BarChart3, FileText } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-slate-900">AI Timetable System</h1>
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate("/timetable-views")}>
                Timetables
              </Button>
              <Button variant="outline" size="sm">
                {user.name || "Profile"}
              </Button>
            </nav>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {user.name}!
            </h2>
            <p className="text-slate-600">
              Manage your university timetables with intelligent scheduling and optimization
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Total Timetables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-slate-500 mt-1">Create your first schedule</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-slate-500 mt-1">Add courses to schedule</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Instructors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-slate-500 mt-1">Manage faculty</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-slate-500 mt-1">Available classrooms</p>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-base">Automated Generation</CardTitle>
                  </div>
                  <CardDescription>CSP solver & Genetic Algorithm</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Generate optimal timetables automatically with advanced constraint satisfaction
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-base">Intelligent Scoring</CardTitle>
                  </div>
                  <CardDescription>Quality evaluation system</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Evaluate timetable quality based on constraints and resource utilization
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-base">Multi-View Display</CardTitle>
                  </div>
                  <CardDescription>Flexible viewing options</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    View schedules by instructor, room, course, or student group
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-base">Constraint Management</CardTitle>
                  </div>
                  <CardDescription>Hard & soft constraints</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Define and enforce scheduling rules and preferences
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-500" />
                    <CardTitle className="text-base">Export & Reports</CardTitle>
                  </div>
                  <CardDescription>PDF, Excel, JSON, CSV</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Export schedules in multiple formats for sharing and analysis
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                    <CardTitle className="text-base">Version Control</CardTitle>
                  </div>
                  <CardDescription>Track & rollback changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Maintain version history and rollback to previous schedules
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Getting Started */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Follow these steps to create your first timetable</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 list-decimal list-inside">
                <li className="text-slate-700">
                  <strong>Add University Data:</strong> Create instructors, courses, rooms, and time slots
                </li>
                <li className="text-slate-700">
                  <strong>Configure Constraints:</strong> Set hard and soft constraints for your schedule
                </li>
                <li className="text-slate-700">
                  <strong>Generate Timetable:</strong> Use automated scheduling to create an initial schedule
                </li>
                <li className="text-slate-700">
                  <strong>Optimize & Review:</strong> Improve quality and resolve any conflicts
                </li>
                <li className="text-slate-700">
                  <strong>Export & Share:</strong> Download and distribute the final timetable
                </li>
              </ol>
              <div className="mt-6 flex gap-3">
                <Button onClick={() => navigate("/")} size="lg">
                  Go to Dashboard
                </Button>
                <Button variant="outline" size="lg">
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Not authenticated - show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">AI Timetable System</h1>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/50">
            Intelligent Scheduling Platform
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Automate Your University Timetable
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Intelligent scheduling system combining CSP solvers, genetic algorithms, and AI to create
            optimal university timetables with minimal conflicts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <a href={getLoginUrl()}>Get Started</a>
            </Button>
            <Button variant="outline" size="lg" className="border-slate-600 text-white hover:bg-slate-800">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <Zap className="h-8 w-8 text-amber-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Automated Generation</h3>
            <p className="text-slate-400">
              Generate optimal schedules using advanced CSP solvers and genetic algorithms
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <BarChart3 className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Smart Optimization</h3>
            <p className="text-slate-400">
              Intelligent scoring system evaluates and improves schedule quality automatically
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <Users className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Conflict Resolution</h3>
            <p className="text-slate-400">
              Detect and resolve scheduling conflicts with intelligent suggestions
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to optimize your scheduling?</h3>
          <p className="text-slate-300 mb-6">
            Sign in now to start creating intelligent timetables for your university
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <a href={getLoginUrl()}>Sign In to Get Started</a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2026 AI Timetable System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
