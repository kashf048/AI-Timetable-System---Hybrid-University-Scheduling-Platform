import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function RoomList() {
  const { data: rooms, isLoading } = trpc.scheduling.room.list.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No rooms yet. Create one to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rooms</CardTitle>
        <CardDescription>List of all rooms in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Facilities</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.code}</TableCell>
                <TableCell>{room.name}</TableCell>
                <TableCell>{room.building || "-"}</TableCell>
                <TableCell>{room.capacity}</TableCell>
                <TableCell className="text-sm">
                  {[
                    room.hasProjector && "Projector",
                    room.hasWhiteboard && "Whiteboard",
                    room.hasComputers && "Computers",
                  ]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
