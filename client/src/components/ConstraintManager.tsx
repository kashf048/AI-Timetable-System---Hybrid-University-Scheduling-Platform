import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

export default function ConstraintManager() {
  const [hardConstraintForm, setHardConstraintForm] = useState({
    type: "room_capacity",
    description: "",
    weight: 100,
  });

  const [softConstraintForm, setSoftConstraintForm] = useState({
    type: "instructor_preference",
    description: "",
    weight: 50,
  });

  const hardConstraintsQuery = trpc.constraints.hardConstraints.list.useQuery();
  const softConstraintsQuery = trpc.constraints.softConstraints.list.useQuery();

  const createHardMutation = trpc.constraints.hardConstraints.create.useMutation({
    onSuccess: () => {
      toast.success("Hard constraint created");
      hardConstraintsQuery.refetch();
      setHardConstraintForm({ type: "room_capacity", description: "", weight: 100 });
    },
    onError: (error) => toast.error(error.message),
  });

  const createSoftMutation = trpc.constraints.softConstraints.create.useMutation({
    onSuccess: () => {
      toast.success("Soft constraint created");
      softConstraintsQuery.refetch();
      setSoftConstraintForm({ type: "instructor_preference", description: "", weight: 50 });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteHardMutation = trpc.constraints.hardConstraints.delete.useMutation({
    onSuccess: () => {
      toast.success("Hard constraint deleted");
      hardConstraintsQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteSoftMutation = trpc.constraints.softConstraints.delete.useMutation({
    onSuccess: () => {
      toast.success("Soft constraint deleted");
      softConstraintsQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Tabs defaultValue="hard" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="hard">Hard Constraints</TabsTrigger>
        <TabsTrigger value="soft">Soft Constraints</TabsTrigger>
      </TabsList>

      <TabsContent value="hard" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Hard Constraint</CardTitle>
            <CardDescription>
              Must-satisfy constraints (room capacity, availability, conflicts)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createHardMutation.mutate(hardConstraintForm as any);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={hardConstraintForm.type}
                  onValueChange={(value) =>
                    setHardConstraintForm({ ...hardConstraintForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room_capacity">Room Capacity</SelectItem>
                    <SelectItem value="instructor_availability">Instructor Availability</SelectItem>
                    <SelectItem value="no_overlap">No Overlap</SelectItem>
                    <SelectItem value="time_unavailable">Time Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={hardConstraintForm.description}
                  onChange={(e) =>
                    setHardConstraintForm({ ...hardConstraintForm, description: e.target.value })
                  }
                />
              </div>
              <Button type="submit" disabled={createHardMutation.isPending}>
                {createHardMutation.isPending ? "Creating..." : "Add Constraint"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hard Constraints</CardTitle>
          </CardHeader>
          <CardContent>
            {hardConstraintsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hardConstraintsQuery.data?.map((constraint) => (
                    <TableRow key={constraint.id}>
                      <TableCell>{constraint.type}</TableCell>
                      <TableCell>{JSON.stringify(constraint.metadata)}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHardMutation.mutate({ id: constraint.id })}
                          disabled={deleteHardMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="soft" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Soft Constraint</CardTitle>
            <CardDescription>
              Preferences to optimize (instructor/room preferences, time distribution)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createSoftMutation.mutate(softConstraintForm as any);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={softConstraintForm.type}
                  onValueChange={(value) =>
                    setSoftConstraintForm({ ...softConstraintForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instructor_preference">Instructor Preference</SelectItem>
                    <SelectItem value="room_preference">Room Preference</SelectItem>
                    <SelectItem value="time_distribution">Time Distribution</SelectItem>
                    <SelectItem value="minimize_gaps">Minimize Gaps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={softConstraintForm.description}
                  onChange={(e) =>
                    setSoftConstraintForm({ ...softConstraintForm, description: e.target.value })
                  }
                />
              </div>
              <Button type="submit" disabled={createSoftMutation.isPending}>
                {createSoftMutation.isPending ? "Creating..." : "Add Constraint"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soft Constraints</CardTitle>
          </CardHeader>
          <CardContent>
            {softConstraintsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {softConstraintsQuery.data?.map((constraint) => (
                    <TableRow key={constraint.id}>
                      <TableCell>{constraint.type}</TableCell>
                      <TableCell>{JSON.stringify(constraint.metadata)}</TableCell>
                      <TableCell>{constraint.weight}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSoftMutation.mutate({ id: constraint.id })}
                          disabled={deleteSoftMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
