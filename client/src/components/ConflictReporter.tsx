import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface Conflict {
  id: number;
  type: string;
  severity: "high" | "medium" | "low";
  description: string;
  affectedEntities: {
    courseId?: number;
    courseName?: string;
    instructorId?: number;
    instructorName?: string;
    roomId?: number;
    roomName?: string;
    timeSlotId?: number;
  };
  suggestedResolution?: string;
}

interface ConflictReporterProps {
  conflicts: Conflict[];
  isLoading?: boolean;
}

const severityColors = {
  high: "bg-red-100 text-red-800 border-red-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-blue-100 text-blue-800 border-blue-300",
};

const severityIcons = {
  high: <AlertTriangle className="h-5 w-5 text-red-600" />,
  medium: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  low: <AlertTriangle className="h-5 w-5 text-blue-600" />,
};

export default function ConflictReporter({ conflicts, isLoading }: ConflictReporterProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading conflicts...
        </CardContent>
      </Card>
    );
  }

  if (!conflicts || conflicts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            No Conflicts Detected
          </CardTitle>
          <CardDescription>Your timetable satisfies all constraints</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const highSeverity = conflicts.filter((c) => c.severity === "high");
  const mediumSeverity = conflicts.filter((c) => c.severity === "medium");
  const lowSeverity = conflicts.filter((c) => c.severity === "low");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Conflict Report</CardTitle>
          <CardDescription>
            Found {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""} in the timetable
          </CardDescription>
        </CardHeader>
      </Card>

      {highSeverity.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-red-700">High Severity ({highSeverity.length})</h3>
          {highSeverity.map((conflict) => (
            <Alert key={conflict.id} className={`border-2 ${severityColors.high}`}>
              <div className="flex gap-3">
                {severityIcons.high}
                <div className="flex-1">
                  <AlertTitle>{conflict.type}</AlertTitle>
                  <AlertDescription className="mt-2">{conflict.description}</AlertDescription>
                  {conflict.affectedEntities.courseName && (
                    <div className="mt-2 text-sm">
                      <strong>Course:</strong> {conflict.affectedEntities.courseName}
                    </div>
                  )}
                  {conflict.affectedEntities.instructorName && (
                    <div className="text-sm">
                      <strong>Instructor:</strong> {conflict.affectedEntities.instructorName}
                    </div>
                  )}
                  {conflict.affectedEntities.roomName && (
                    <div className="text-sm">
                      <strong>Room:</strong> {conflict.affectedEntities.roomName}
                    </div>
                  )}
                  {conflict.suggestedResolution && (
                    <div className="mt-2 rounded bg-white/50 p-2 text-sm">
                      <strong>Suggestion:</strong> {conflict.suggestedResolution}
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {mediumSeverity.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-yellow-700">Medium Severity ({mediumSeverity.length})</h3>
          {mediumSeverity.map((conflict) => (
            <Alert key={conflict.id} className={`border-2 ${severityColors.medium}`}>
              <div className="flex gap-3">
                {severityIcons.medium}
                <div className="flex-1">
                  <AlertTitle>{conflict.type}</AlertTitle>
                  <AlertDescription className="mt-2">{conflict.description}</AlertDescription>
                  {conflict.suggestedResolution && (
                    <div className="mt-2 rounded bg-white/50 p-2 text-sm">
                      <strong>Suggestion:</strong> {conflict.suggestedResolution}
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {lowSeverity.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-blue-700">Low Severity ({lowSeverity.length})</h3>
          {lowSeverity.map((conflict) => (
            <Alert key={conflict.id} className={`border-2 ${severityColors.low}`}>
              <div className="flex gap-3">
                {severityIcons.low}
                <div className="flex-1">
                  <AlertTitle>{conflict.type}</AlertTitle>
                  <AlertDescription className="mt-2">{conflict.description}</AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
