import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    maxHoursPerInstructor: 20,
    minBreakBetweenClasses: 15,
    preferredRoomUtilization: 80,
    enableConflictWarnings: true,
    enableAutoOptimization: false,
    optimizationFrequency: "weekly",
    notifyOnConflicts: true,
    notifyOnChanges: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    try {
      localStorage.setItem("timetable-settings", JSON.stringify(settings));
      setSaved(true);
      toast.success("Settings saved successfully");
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    }
  };

  const handleReset = () => {
    setSettings({
      maxHoursPerInstructor: 20,
      minBreakBetweenClasses: 15,
      preferredRoomUtilization: 80,
      enableConflictWarnings: true,
      enableAutoOptimization: false,
      optimizationFrequency: "weekly",
      notifyOnConflicts: true,
      notifyOnChanges: true,
    });
    toast.info("Settings reset to defaults");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure system preferences and scheduling parameters
        </p>
      </div>

      {saved && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings have been saved successfully
          </AlertDescription>
        </Alert>
      )}

      {/* Scheduling Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduling Parameters</CardTitle>
          <CardDescription>Configure constraints and preferences for timetable generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxHours">Maximum Hours per Instructor (per week)</Label>
            <Input
              id="maxHours"
              type="number"
              min="1"
              max="40"
              value={settings.maxHoursPerInstructor}
              onChange={(e) =>
                setSettings({ ...settings, maxHoursPerInstructor: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-gray-600">
              Maximum teaching hours allowed per instructor per week
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minBreak">Minimum Break Between Classes (minutes)</Label>
            <Input
              id="minBreak"
              type="number"
              min="0"
              max="120"
              value={settings.minBreakBetweenClasses}
              onChange={(e) =>
                setSettings({ ...settings, minBreakBetweenClasses: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-gray-600">
              Minimum break time required between consecutive classes for instructors
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomUtil">Preferred Room Utilization (%)</Label>
            <Input
              id="roomUtil"
              type="number"
              min="0"
              max="100"
              value={settings.preferredRoomUtilization}
              onChange={(e) =>
                setSettings({ ...settings, preferredRoomUtilization: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-gray-600">
              Target room utilization percentage for optimization
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Conflict Management */}
      <Card>
        <CardHeader>
          <CardTitle>Conflict Management</CardTitle>
          <CardDescription>Configure how conflicts are handled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="conflictWarnings">Enable Conflict Warnings</Label>
              <p className="text-sm text-gray-600 mt-1">
                Show warnings when potential conflicts are detected
              </p>
            </div>
            <Switch
              id="conflictWarnings"
              checked={settings.enableConflictWarnings}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableConflictWarnings: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoOptimize">Enable Auto-Optimization</Label>
              <p className="text-sm text-gray-600 mt-1">
                Automatically optimize timetables on a schedule
              </p>
            </div>
            <Switch
              id="autoOptimize"
              checked={settings.enableAutoOptimization}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableAutoOptimization: checked })
              }
            />
          </div>

          {settings.enableAutoOptimization && (
            <div className="space-y-2 pl-4 border-l-2 border-blue-200">
              <Label htmlFor="frequency">Optimization Frequency</Label>
              <Select
                value={settings.optimizationFrequency}
                onValueChange={(value) =>
                  setSettings({ ...settings, optimizationFrequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifyConflicts">Notify on Conflicts</Label>
              <p className="text-sm text-gray-600 mt-1">
                Send notifications when conflicts are detected
              </p>
            </div>
            <Switch
              id="notifyConflicts"
              checked={settings.notifyOnConflicts}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifyOnConflicts: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifyChanges">Notify on Changes</Label>
              <p className="text-sm text-gray-600 mt-1">
                Send notifications when timetables are modified
              </p>
            </div>
            <Switch
              id="notifyChanges"
              checked={settings.notifyOnChanges}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifyOnChanges: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
