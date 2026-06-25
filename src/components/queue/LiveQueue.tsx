import { Clock, User, Stethoscope, FlaskConical, Pill, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { QueueStatus } from "@/types/clinic";

interface QueueItem {
  id: string;
  patientName: string;
  patientId: string;
  status: QueueStatus;
  priority: "normal" | "urgent" | "emergency";
  waitTime: number;
  assignedDoctor?: string;
}

const mockQueueData: QueueItem[] = [
  {
    id: "1",
    patientName: "Adebayo Oluwaseun",
    patientId: "MTU/2023/0451",
    status: "in_consultation",
    priority: "normal",
    waitTime: 45,
    assignedDoctor: "Dr. Johnson",
  },
  {
    id: "2",
    patientName: "Chiamaka Okonkwo",
    patientId: "MTU/2022/1234",
    status: "waiting",
    priority: "urgent",
    waitTime: 25,
  },
  {
    id: "3",
    patientName: "Emmanuel Nwosu",
    patientId: "MTU/2024/0089",
    status: "in_lab",
    priority: "normal",
    waitTime: 60,
    assignedDoctor: "Dr. Adeyemi",
  },
  {
    id: "4",
    patientName: "Fatima Abubakar",
    patientId: "MTU/2023/0567",
    status: "in_pharmacy",
    priority: "normal",
    waitTime: 80,
  },
  {
    id: "5",
    patientName: "Grace Okafor",
    patientId: "MTU/2021/2345",
    status: "waiting",
    priority: "emergency",
    waitTime: 5,
  },
  {
    id: "6",
    patientName: "Ibrahim Mohammed",
    patientId: "MTU/2024/0123",
    status: "waiting",
    priority: "normal",
    waitTime: 15,
  },
];

const statusConfig: Record<QueueStatus, { label: string; icon: typeof Clock; className: string }> = {
  waiting: {
    label: "Waiting",
    icon: Clock,
    className: "status-waiting",
  },
  in_consultation: {
    label: "In Consultation",
    icon: Stethoscope,
    className: "status-in-progress",
  },
  in_lab: {
    label: "In Laboratory",
    icon: FlaskConical,
    className: "status-in-progress",
  },
  in_pharmacy: {
    label: "In Pharmacy",
    icon: Pill,
    className: "status-in-progress",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "status-completed",
  },
};

const priorityConfig = {
  normal: { label: "Normal", className: "bg-muted text-muted-foreground" },
  urgent: { label: "Urgent", className: "bg-warning text-warning-foreground" },
  emergency: { label: "Emergency", className: "bg-destructive text-destructive-foreground animate-pulse-subtle" },
};

interface LiveQueueProps {
  compact?: boolean;
}

export function LiveQueue({ compact = false }: LiveQueueProps) {
  const waitingCount = mockQueueData.filter((q) => q.status === "waiting").length;
  const inProgressCount = mockQueueData.filter(
    (q) => q.status === "in_consultation" || q.status === "in_lab" || q.status === "in_pharmacy"
  ).length;

  return (
    <Card className={cn("flex flex-col", compact ? "h-[400px]" : "h-full")}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Live Queue</CardTitle>
          <p className="text-sm text-muted-foreground">
            {waitingCount} waiting • {inProgressCount} in progress
          </p>
        </div>
        <Button size="sm" variant="outline">
          View All
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-3">
            {mockQueueData.map((item, index) => {
              const status = statusConfig[item.status];
              const priority = priorityConfig[item.priority];
              const StatusIcon = status.icon;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-sm",
                    item.priority === "emergency" && "border-destructive/50 bg-destructive/5"
                  )}
                >
                  {/* Queue Number */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {index + 1}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {item.patientName}
                      </p>
                      <Badge className={priority.className} variant="secondary">
                        {priority.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.patientId}</p>
                    {item.assignedDoctor && (
                      <p className="text-xs text-muted-foreground">
                        Assigned to: {item.assignedDoctor}
                      </p>
                    )}
                  </div>

                  {/* Status & Wait Time */}
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className={cn("flex items-center gap-1", status.className)}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.waitTime} min
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
