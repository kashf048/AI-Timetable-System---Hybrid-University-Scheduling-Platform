import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface RoomFormProps {
  onClose: () => void;
}

export default function RoomForm({ onClose }: RoomFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    building: "",
    floor: 0,
    capacity: 30,
    hasProjector: false,
    hasWhiteboard: false,
    hasComputers: false,
  });

  const createMutation = trpc.scheduling.room.create.useMutation({
    onSuccess: () => {
      toast.success("Room created successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Room</CardTitle>
        <CardDescription>Create a new classroom</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Room Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="building">Building</Label>
            <Input
              id="building"
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-3">
            <Label>Facilities</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="projector"
                  checked={formData.hasProjector}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasProjector: checked as boolean })}
                />
                <Label htmlFor="projector" className="font-normal cursor-pointer">Projector</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="whiteboard"
                  checked={formData.hasWhiteboard}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasWhiteboard: checked as boolean })}
                />
                <Label htmlFor="whiteboard" className="font-normal cursor-pointer">Whiteboard</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="computers"
                  checked={formData.hasComputers}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasComputers: checked as boolean })}
                />
                <Label htmlFor="computers" className="font-normal cursor-pointer">Computers</Label>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Room"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
