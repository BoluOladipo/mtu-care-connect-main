import { AlertTriangle, Package, Calendar, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "stock" | "expiry" | "appointment" | "system";
  title: string;
  message: string;
  severity: "warning" | "error" | "info";
  time: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "stock",
    title: "Low Stock Alert",
    message: "Paracetamol 500mg is running low (12 units remaining)",
    severity: "warning",
    time: "5 min ago",
  },
  {
    id: "2",
    type: "expiry",
    title: "Expiring Soon",
    message: "Amoxicillin 250mg batch #B2024-001 expires in 7 days",
    severity: "error",
    time: "1 hour ago",
  },
  {
    id: "3",
    type: "appointment",
    title: "No-Show Patient",
    message: "2 patients missed their morning appointments",
    severity: "info",
    time: "2 hours ago",
  },
  {
    id: "4",
    type: "stock",
    title: "Out of Stock",
    message: "Vitamin C 1000mg is out of stock",
    severity: "error",
    time: "3 hours ago",
  },
];

const typeIcons = {
  stock: Package,
  expiry: AlertTriangle,
  appointment: Calendar,
  system: Bell,
};

const severityStyles = {
  warning: "border-l-warning bg-warning/5",
  error: "border-l-destructive bg-destructive/5",
  info: "border-l-info bg-info/5",
};

const severityBadge = {
  warning: "bg-warning/20 text-warning",
  error: "bg-destructive/20 text-destructive",
  info: "bg-info/20 text-info",
};

export function AlertsPanel() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Alerts & Notifications
        </CardTitle>
        <Badge variant="destructive" className="animate-pulse-subtle">
          {mockAlerts.length} Active
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockAlerts.map((alert) => {
          const Icon = typeIcons[alert.type];

          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border-l-4 p-4 transition-colors",
                severityStyles[alert.severity]
              )}
            >
              <div className={cn("rounded-full p-2", severityBadge[alert.severity])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{alert.title}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {alert.time}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
              </div>
            </div>
          );
        })}
        <Button variant="ghost" className="w-full mt-2">
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  );
}
