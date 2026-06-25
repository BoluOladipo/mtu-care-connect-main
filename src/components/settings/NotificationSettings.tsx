import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";
import { toast } from "sonner";

interface NotificationConfig {
  lowStock: boolean;
  expiry: boolean;
  appointments: boolean;
  queue: boolean;
}

export function NotificationSettings() {
  const [config, setConfig] = useState<NotificationConfig>({
    lowStock: true,
    expiry: true,
    appointments: true,
    queue: true,
  });

  const handleToggle = (key: keyof NotificationConfig) => {
    setConfig((prev) => {
      const newConfig = { ...prev, [key]: !prev[key] };
      toast.success(
        `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${
          newConfig[key] ? "enabled" : "disabled"
        }`
      );
      return newConfig;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>Configure alerts and notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Low Stock Alerts</p>
              <p className="text-sm text-muted-foreground">
                Notify when inventory is running low
              </p>
            </div>
            <Switch
              checked={config.lowStock}
              onCheckedChange={() => handleToggle("lowStock")}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Expiry Alerts</p>
              <p className="text-sm text-muted-foreground">
                Notify before drugs expire
              </p>
            </div>
            <Switch
              checked={config.expiry}
              onCheckedChange={() => handleToggle("expiry")}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Appointment Reminders</p>
              <p className="text-sm text-muted-foreground">
                Send reminders to patients
              </p>
            </div>
            <Switch
              checked={config.appointments}
              onCheckedChange={() => handleToggle("appointments")}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Queue Updates</p>
              <p className="text-sm text-muted-foreground">
                Real-time queue notifications
              </p>
            </div>
            <Switch
              checked={config.queue}
              onCheckedChange={() => handleToggle("queue")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
