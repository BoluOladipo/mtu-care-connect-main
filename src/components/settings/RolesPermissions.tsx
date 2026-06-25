import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Check } from "lucide-react";

const ROLE_PERMISSIONS = {
  admin: {
    label: "Admin",
    color: "bg-destructive/10 text-destructive",
    description: "Full system access",
    permissions: [
      "Manage all users and roles",
      "Access all patient records",
      "Manage system settings",
      "View all reports and analytics",
      "Manage inventory and drugs",
    ],
  },
  doctor: {
    label: "Doctor",
    color: "bg-primary/10 text-primary",
    description: "Clinical access",
    permissions: [
      "View and manage patient records",
      "Create consultations and diagnoses",
      "Write prescriptions",
      "Order lab tests",
      "Issue medical fitness certificates",
    ],
  },
  nurse: {
    label: "Nurse",
    color: "bg-info/10 text-info",
    description: "Patient care access",
    permissions: [
      "View patient records",
      "Record patient vitals",
      "Administer immunizations",
      "Manage patient queue",
      "Assist with consultations",
    ],
  },
  pharmacist: {
    label: "Pharmacist",
    color: "bg-success/10 text-success",
    description: "Pharmacy access",
    permissions: [
      "Manage drug inventory",
      "Dispense prescriptions",
      "View prescription orders",
      "Track stock levels",
      "Manage expiry alerts",
    ],
  },
  lab_technician: {
    label: "Lab Technician",
    color: "bg-warning/10 text-warning",
    description: "Laboratory access",
    permissions: [
      "View lab requests",
      "Process lab tests",
      "Enter test results",
      "Manage lab inventory",
      "Generate lab reports",
    ],
  },
  receptionist: {
    label: "Receptionist",
    color: "bg-muted text-muted-foreground",
    description: "Front desk access",
    permissions: [
      "Register new patients",
      "Manage appointments",
      "Check-in patients",
      "Manage queue",
      "View basic patient info",
    ],
  },
};

export function RolesPermissions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Roles & Permissions
        </CardTitle>
        <CardDescription>
          View access levels and permissions for each role
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(ROLE_PERMISSIONS).map(([key, role], index) => (
          <div key={key}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={role.color}>{role.label}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {role.description}
                  </span>
                </div>
                <ul className="mt-2 space-y-1">
                  {role.permissions.map((permission) => (
                    <li
                      key={permission}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-3 w-3 text-success" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {index < Object.keys(ROLE_PERMISSIONS).length - 1 && (
              <Separator className="mt-4" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
