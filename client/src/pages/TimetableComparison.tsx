import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function TimetableComparison() {
  const [selectedTimetable, setSelectedTimetable] = useState<number | null>(null);
  const [version1, setVersion1] = useState<number | null>(null);
  const [version2, setVersion2] = useState<number | null>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const timetablesQuery = trpc.scheduling.timetable.list.useQuery();
  const versionsQuery = trpc.scheduling.timetable.getVersions.useQuery(
    { timetableId: selectedTimetable || 0 },
    { enabled: !!selectedTimetable }
  );
  const rollbackMutation = trpc.version.rollbackToVersion.useMutation();

  const handleCompare = async () => {
    if (!version1 || !version2) {
      toast.error("Please select two versions to compare");
      return;
    }

    setLoading(true);
    try {
      const result = await trpc.version.compareVersions.useQuery({
        versionId1: version1,
        versionId2: version2,
      }).refetch();
      
      if (result.data) {
        setComparison(result.data);
      }
    } catch (error) {
      toast.error("Failed to compare versions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (versionId: number) => {
    if (!confirm("Are you sure you want to rollback to this version?")) return;

    try {
      await rollbackMutation.mutateAsync({ versionId });
      toast.success("Rollback successful");
      setComparison(null);
      setVersion1(null);
      setVersion2(null);
    } catch (error) {
      toast.error("Failed to rollback");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timetable Comparison & Rollback</h1>
        <p className="text-gray-600 mt-2">
          Compare different versions of your timetables and rollback to previous versions if needed
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Timetable</CardTitle>
          <CardDescription>Choose a timetable to view its version history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Timetable</label>
            <Select
              value={selectedTimetable?.toString() || ""}
              onValueChange={(val) => {
                setSelectedTimetable(parseInt(val));
                setVersion1(null);
                setVersion2(null);
                setComparison(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a timetable" />
              </SelectTrigger>
              <SelectContent>
                {timetablesQuery.data?.map((tt: any) => (
                  <SelectItem key={tt.id} value={tt.id.toString()}>
                    {tt.name} (Score: {tt.score?.toFixed(1) || "N/A"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTimetable && versionsQuery.data && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Version 1</label>
                <Select
                  value={version1?.toString() || ""}
                  onValueChange={(val) => setVersion1(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versionsQuery.data?.map((v: any) => (
                      <SelectItem key={v.id} value={v.id.toString()}>
                        v{v.versionNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Version 2</label>
                <Select
                  value={version2?.toString() || ""}
                  onValueChange={(val) => setVersion2(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versionsQuery.data?.map((v: any) => (
                      <SelectItem key={v.id} value={v.id.toString()}>
                        v{v.versionNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button
            onClick={handleCompare}
            disabled={!version1 || !version2 || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Comparing...
              </>
            ) : (
              "Compare Versions"
            )}
          </Button>
        </CardContent>
      </Card>

      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setComparison(null)}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRollback(version1!)}
              >
                Rollback
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {timetablesQuery.isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading timetables...
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
