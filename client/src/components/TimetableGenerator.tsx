import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function TimetableGenerator() {
  const [name, setName] = useState("Semester 1 Timetable");
  const [count, setCount] = useState(3);

  const generateMutation = trpc.scheduling.timetable.generate.useMutation({
    onSuccess: (data) => {
      toast.success(`Generated ${data.length} timetables successfully`);
      setName("Semester 1 Timetable");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate({ name, count });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Generate Timetable</CardTitle>
          <CardDescription>
            Use AI algorithms to automatically generate optimized timetables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Timetable Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Number of Timetables to Generate</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
              />
            </div>
            <Button type="submit" disabled={generateMutation.isPending} className="w-full">
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Timetables"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generateMutation.data && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Timetables</h3>
          {generateMutation.data.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">Timetable {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold">{result.score.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conflicts</p>
                    <p className="text-2xl font-bold">{result.conflicts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
