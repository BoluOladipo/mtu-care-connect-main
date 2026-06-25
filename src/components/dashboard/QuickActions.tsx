import { Link } from "react-router-dom";
import {
  UserPlus,
  ClipboardPlus,
  Calendar,
  Pill,
  FlaskConical,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    title: "New Patient",
    description: "Register new patient",
    icon: UserPlus,
    path: "/patients/new",
    color: "bg-primary",
  },
  {
    title: "Add to Queue",
    description: "Walk-in registration",
    icon: ClipboardPlus,
    path: "/queue/add",
    color: "bg-info",
  },
  {
    title: "Book Appointment",
    description: "Schedule visit",
    icon: Calendar,
    path: "/appointments/new",
    color: "bg-success",
  },
  {
    title: "Dispense Drug",
    description: "Pharmacy action",
    icon: Pill,
    path: "/pharmacy/dispense",
    color: "bg-warning",
  },
  {
    title: "Lab Request",
    description: "Order tests",
    icon: FlaskConical,
    path: "/laboratory/new",
    color: "bg-chart-4",
  },
  {
    title: "View Reports",
    description: "Analytics & exports",
    icon: FileText,
    path: "/reports",
    color: "bg-muted-foreground",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {actions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color} text-white transition-transform group-hover:scale-110`}
              >
                <action.icon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {action.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
