import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ClinicInfo {
  clinicName: string;
  phone: string;
  email: string;
  address: string;
  weekdayStart: string;
  weekdayEnd: string;
  weekendStart: string;
  weekendEnd: string;
  emergencyServices: boolean;
}

export function GeneralSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>({
    clinicName: "MTU Health Centre",
    phone: "+234 803 123 4567",
    email: "health@mtu.edu.ng",
    address: "Mountain Top University, Ogun State",
    weekdayStart: "08:00",
    weekdayEnd: "18:00",
    weekendStart: "09:00",
    weekendEnd: "14:00",
    emergencyServices: true,
  });

  const handleSaveClinicInfo = async () => {
    setIsSaving(true);
    // Simulate save - in production, this would persist to a settings table
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Clinic information updated");
    setIsSaving(false);
  };

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Schedule updated");
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Clinic Information
          </CardTitle>
          <CardDescription>Basic information about the health centre</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input
                id="clinicName"
                value={clinicInfo.clinicName}
                onChange={(e) =>
                  setClinicInfo({ ...clinicInfo, clinicName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={clinicInfo.phone}
                onChange={(e) =>
                  setClinicInfo({ ...clinicInfo, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={clinicInfo.email}
                onChange={(e) =>
                  setClinicInfo({ ...clinicInfo, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={clinicInfo.address}
                onChange={(e) =>
                  setClinicInfo({ ...clinicInfo, address: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveClinicInfo} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
          <CardDescription>Set the clinic's operating schedule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Weekdays</Label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={clinicInfo.weekdayStart}
                  onChange={(e) =>
                    setClinicInfo({ ...clinicInfo, weekdayStart: e.target.value })
                  }
                />
                <span className="self-center">to</span>
                <Input
                  type="time"
                  value={clinicInfo.weekdayEnd}
                  onChange={(e) =>
                    setClinicInfo({ ...clinicInfo, weekdayEnd: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Weekends</Label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={clinicInfo.weekendStart}
                  onChange={(e) =>
                    setClinicInfo({ ...clinicInfo, weekendStart: e.target.value })
                  }
                />
                <span className="self-center">to</span>
                <Input
                  type="time"
                  value={clinicInfo.weekendEnd}
                  onChange={(e) =>
                    setClinicInfo({ ...clinicInfo, weekendEnd: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="emergency"
              checked={clinicInfo.emergencyServices}
              onCheckedChange={(checked) =>
                setClinicInfo({ ...clinicInfo, emergencyServices: checked })
              }
            />
            <Label htmlFor="emergency">24/7 Emergency Services Available</Label>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveSchedule} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
