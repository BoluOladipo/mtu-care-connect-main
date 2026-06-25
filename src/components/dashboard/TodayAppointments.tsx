import { Calendar, Clock, User, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "Adebayo Oluwaseun",
    time: "09:00 AM",
    type: "General Checkup",
    status: "completed",
  },
  {
    id: "2",
    patientName: "Chiamaka Okonkwo",
    time: "09:30 AM",
    type: "Follow-up",
    status: "in_progress",
  },
  {
    id: "3",
    patientName: "Emmanuel Nwosu",
    time: "10:00 AM",
    type: "Immunization",
    status: "confirmed",
  },
  {
    id: "4",
    patientName: "Fatima Abubakar",
    time: "10:30 AM",
    type: "Medical Fitness",
    status: "scheduled",
  },
  {
    id: "5",
    patientName: "Grace Okafor",
    time: "11:00 AM",
    type: "General Checkup",
    status: "scheduled",
  },
  {
    id: "6",
    patientName: "Hassan Yusuf",
    time: "11:30 AM",
    type: "Specialist",
    status: "scheduled",
  },
];

const statusConfig = {
  scheduled: { label: "Scheduled", className: "bg-muted text-muted-foreground" },
  confirmed: { label: "Confirmed", className: "bg-info/20 text-info" },
  in_progress: { label: "In Progress", className: "bg-primary/20 text-primary" },
  completed: { label: "Completed", className: "bg-success/20 text-success" },
  cancelled: { label: "Cancelled", className: "bg-destructive/20 text-destructive" },
};

export function TodayAppointments() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="flex h-[400px] flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Today's Appointments</CardTitle>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <Button size="sm" variant="outline">
          View All
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-3">
            {mockAppointments.map((appointment) => {
              const status = statusConfig[appointment.status];

              return (
                <div
                  key={appointment.id}
                  className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm cursor-pointer"
                >
                  {/* Time */}
                  <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-3 py-2">
                    <Clock className="mb-1 h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {appointment.time}
                    </span>
                  </div>

                  {/* Appointment Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {appointment.patientName}
                    </p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  </div>

                  {/* Status */}
                  <Badge variant="secondary" className={status.className}>
                    {status.label}
                  </Badge>

                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
