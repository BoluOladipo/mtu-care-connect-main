import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarPlus,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppointments, useCreateAppointment, useCancelAppointment, AppointmentWithPatient } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { format, addDays, subDays } from "date-fns";

const appointmentTypes = [
  { value: "general", label: "General Checkup" },
  { value: "follow_up", label: "Follow-up" },
  { value: "immunization", label: "Immunization" },
  { value: "fitness_exam", label: "Medical Fitness" },
  { value: "specialist", label: "Specialist" },
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30",
];

const statusColors: Record<string, string> = {
  scheduled: "bg-muted text-muted-foreground border-muted",
  confirmed: "bg-success/20 text-success border-success/30",
  completed: "bg-info/20 text-info border-info/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

const Appointments = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const { user } = useAuth();

  const selectedDate = date ? format(date, "yyyy-MM-dd") : undefined;
  const { data: appointments = [], isLoading } = useAppointments(selectedDate);
  const { data: patients = [] } = usePatients(patientSearch);
  
  const createAppointment = useCreateAppointment();
  const cancelAppointment = useCancelAppointment();

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      patient_id: "",
      appointment_date: "",
      appointment_time: "",
      type: "",
      reason: "",
    },
  });

  const selectedPatientId = watch("patient_id");

  const onSubmit = handleSubmit(async (data) => {
    if (!user?.id) return;
    await createAppointment.mutateAsync({
      patient_id: data.patient_id,
      doctor_id: user.id,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      type: data.type,
      reason: data.reason || null,
      status: "scheduled",
    });
    reset();
    setIsDialogOpen(false);
  });

  const formatDisplayDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Create a map of booked time slots
  const bookedSlots = new Map<string, AppointmentWithPatient>();
  appointments.forEach((apt) => {
    const timeKey = apt.appointment_time.slice(0, 5);
    bookedSlots.set(timeKey, apt);
  });

  const goToPreviousDay = () => {
    if (date) setDate(subDays(date, 1));
  };

  const goToNextDay = () => {
    if (date) setDate(addDays(date, 1));
  };

  const totalSlots = timeSlots.length;
  const bookedCount = appointments.filter((a) => a.status !== "cancelled").length;
  const availableCount = totalSlots - bookedCount;

  return (
    <AppLayout title="Appointments" subtitle="Schedule and manage patient appointments">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar - Calendar & Filters */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Slots</span>
                <span className="font-medium">{totalSlots}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Booked</span>
                <span className="font-medium text-primary">{bookedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium text-success">{availableCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Schedule View */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {date ? formatDisplayDate(date) : "Select a date"}
              </h2>
              <Button variant="outline" size="icon" onClick={goToNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <CalendarPlus className="h-4 w-4" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Book New Appointment</DialogTitle>
                  <DialogDescription>
                    Schedule a new appointment for a patient.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Search Patient</Label>
                    <Input
                      placeholder="Type to search patients..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                    />
                    {patientSearch && patients.length > 0 && (
                      <div className="max-h-32 overflow-y-auto rounded border bg-background">
                        {patients.slice(0, 5).map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            className={cn(
                              "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                              selectedPatientId === patient.id && "bg-primary/10"
                            )}
                            onClick={() => {
                              setValue("patient_id", patient.id);
                              setPatientSearch(`${patient.first_name} ${patient.last_name}`);
                            }}
                          >
                            <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                            <p className="text-xs text-muted-foreground">{patient.student_id}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        {...register("appointment_date", { required: true })}
                        defaultValue={selectedDate}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Select onValueChange={(val) => setValue("appointment_time", val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots
                            .filter((t) => !bookedSlots.has(t))
                            .map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {formatTime(slot)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Appointment Type</Label>
                    <Select onValueChange={(val) => setValue("type", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason for Visit</Label>
                    <Textarea
                      placeholder="Brief description of the reason for visit"
                      {...register("reason")}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createAppointment.isPending || !selectedPatientId}>
                      {createAppointment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Book Appointment
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Time Slots Grid */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Schedule
                </CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Booked</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {timeSlots.map((slot) => {
                    const appointment = bookedSlots.get(slot);
                    const isBooked = !!appointment && appointment.status !== "cancelled";

                    return (
                      <div
                        key={slot}
                        className={cn(
                          "rounded-lg border p-4 transition-all",
                          !isBooked
                            ? "border-dashed border-success/50 bg-success/5 hover:border-success hover:bg-success/10 cursor-pointer"
                            : "border-primary/30 bg-primary/5"
                        )}
                        onClick={() => {
                          if (!isBooked) {
                            setValue("appointment_time", slot);
                            setValue("appointment_date", selectedDate || "");
                            setIsDialogOpen(true);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatTime(slot)}</span>
                          </div>
                          {!isBooked ? (
                            <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                              Open
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className={statusColors[appointment.status]}
                            >
                              {appointment.status}
                            </Badge>
                          )}
                        </div>
                        {isBooked && appointment && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              {appointment.patients.first_name} {appointment.patients.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {appointmentTypes.find((t) => t.value === appointment.type)?.label || appointment.type}
                            </p>
                            {appointment.status === "scheduled" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="mt-2 h-7 text-xs text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelAppointment.mutate(appointment.id);
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        )}
                        {!isBooked && (
                          <p className="text-sm text-success">Click to book</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Appointments;
