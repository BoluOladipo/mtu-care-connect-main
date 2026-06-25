import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Syringe,
  Calendar,
  Download,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useImmunizations, useCreateImmunization, getImmunizationStatus } from "@/hooks/useImmunizations";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";

const vaccines = [
  "Hepatitis B - Dose 1",
  "Hepatitis B - Dose 2",
  "Hepatitis B - Dose 3",
  "Meningitis ACYW135",
  "Yellow Fever",
  "Tetanus Booster",
  "COVID-19 - Dose 1",
  "COVID-19 - Dose 2",
  "COVID-19 Booster",
  "Typhoid",
  "HPV - Dose 1",
  "HPV - Dose 2",
];

const statusConfig = {
  completed: { label: "Completed", color: "bg-success/20 text-success" },
  due: { label: "Due", color: "bg-warning/20 text-warning" },
  overdue: { label: "Overdue", color: "bg-destructive/20 text-destructive" },
};

const Immunization = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  const { data: immunizations = [], isLoading } = useImmunizations(searchQuery);
  const { data: patients = [] } = usePatients(patientSearch);
  const createImmunization = useCreateImmunization();

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      patient_id: "",
      vaccine_name: "",
      batch_number: "",
      next_dose_date: "",
      notes: "",
    },
  });

  const selectedPatientId = watch("patient_id");

  // Calculate stats with status
  const recordsWithStatus = immunizations.map((record) => ({
    ...record,
    computedStatus: getImmunizationStatus(record),
  }));

  const completedCount = recordsWithStatus.filter((r) => r.computedStatus === "completed").length;
  const dueCount = recordsWithStatus.filter((r) => r.computedStatus === "due").length;
  const overdueCount = recordsWithStatus.filter((r) => r.computedStatus === "overdue").length;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!user?.id) return;
    await createImmunization.mutateAsync({
      patient_id: data.patient_id,
      vaccine_name: data.vaccine_name,
      administered_by: user.id,
      batch_number: data.batch_number || null,
      next_dose_date: data.next_dose_date || null,
      notes: data.notes || null,
    });
    reset();
    setPatientSearch("");
    setIsDialogOpen(false);
  });

  return (
    <AppLayout title="Immunization" subtitle="Vaccination records and schedules">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Syringe className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{immunizations.length}</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-success/30 bg-success/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success text-success-foreground">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning text-warning-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dueCount}</p>
                <p className="text-sm text-muted-foreground">Due Soon</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueCount}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <Tabs defaultValue="records" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="records" className="gap-2">
                <Syringe className="h-4 w-4" />
                Records
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="certificates" className="gap-2">
                <FileText className="h-4 w-4" />
                Certificates
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:w-64"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Immunization Record</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Search Patient *</Label>
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
                    <div className="space-y-2">
                      <Label>Vaccine *</Label>
                      <Select onValueChange={(val) => setValue("vaccine_name", val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vaccine" />
                        </SelectTrigger>
                        <SelectContent>
                          {vaccines.map((vaccine) => (
                            <SelectItem key={vaccine} value={vaccine}>
                              {vaccine}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="batch_number">Batch Number</Label>
                        <Input id="batch_number" {...register("batch_number")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="next_dose_date">Next Dose Date</Label>
                        <Input id="next_dose_date" type="date" {...register("next_dose_date")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" rows={2} {...register("notes")} />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createImmunization.isPending || !selectedPatientId}>
                        {createImmunization.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Record
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>Vaccination Records</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : recordsWithStatus.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Syringe className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium">No immunization records</p>
                    <p className="text-muted-foreground">Add your first vaccination record to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Vaccine</TableHead>
                          <TableHead>Date Administered</TableHead>
                          <TableHead>Next Dose</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recordsWithStatus.map((record) => {
                          const status = statusConfig[record.computedStatus];

                          return (
                            <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                      {getInitials(record.patients.first_name, record.patients.last_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {record.patients.first_name} {record.patients.last_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {record.patients.student_id}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{record.vaccine_name}</p>
                                {record.batch_number && (
                                  <p className="text-sm text-muted-foreground">
                                    Batch: {record.batch_number}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(record.date_administered).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {record.next_dose_date
                                  ? new Date(record.next_dose_date).toLocaleDateString()
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Badge className={status.color}>{status.label}</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Immunization Schedule
                </p>
                <p className="text-muted-foreground text-center max-w-md">
                  View upcoming vaccinations and send reminders to students.
                </p>
                {(dueCount > 0 || overdueCount > 0) && (
                  <div className="mt-4 space-y-2">
                    {overdueCount > 0 && (
                      <p className="text-destructive font-medium">{overdueCount} overdue vaccinations</p>
                    )}
                    {dueCount > 0 && (
                      <p className="text-warning font-medium">{dueCount} vaccinations due soon</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Vaccination Certificates
                </p>
                <p className="text-muted-foreground text-center max-w-md">
                  Generate and download vaccination certificates for students.
                </p>
                <Button className="mt-4 gap-2">
                  <Download className="h-4 w-4" />
                  Generate Certificate
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Immunization;
