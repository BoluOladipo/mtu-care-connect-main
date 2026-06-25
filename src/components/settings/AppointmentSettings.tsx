import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AppointmentConfig {
  defaultDuration: string;
  bookingWindow: string;
  doubleBooking: boolean;
  autoConfirm: boolean;
}

export function AppointmentSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<AppointmentConfig>({
    defaultDuration: "15",
    bookingWindow: "14",
    doubleBooking: false,
    autoConfirm: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Appointment settings saved");
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Appointment Configuration
        </CardTitle>
        <CardDescription>Configure booking rules and time slots</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Default Appointment Duration</Label>
            <Select
              value={config.defaultDuration}
              onValueChange={(v) =>
                setConfig({ ...config, defaultDuration: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Booking Window</Label>
            <Select
              value={config.bookingWindow}
              onValueChange={(v) => setConfig({ ...config, bookingWindow: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="doubleBooking"
            checked={config.doubleBooking}
            onCheckedChange={(checked) =>
              setConfig({ ...config, doubleBooking: checked })
            }
          />
          <Label htmlFor="doubleBooking">
            Allow double booking (Admin only)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="autoConfirm"
            checked={config.autoConfirm}
            onCheckedChange={(checked) =>
              setConfig({ ...config, autoConfirm: checked })
            }
          />
          <Label htmlFor="autoConfirm">Auto-confirm appointments</Label>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
