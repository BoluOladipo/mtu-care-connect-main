import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, FileText, Stethoscope, ClipboardList, Loader2 } from "lucide-react";
import { useConsultations, useCreateConsultation, useCompleteConsultation, ConsultationWithPatient } from "@/hooks/useConsultations";
import { useCreatePrescription } from "@/hooks/usePrescriptions";
import { useCreateLabRequest } from "@/hooks/useLabRequests";
import { useQueueEntries, useUpdateQueueStatus } from "@/hooks/useQueue";
import { useDrugs } from "@/hooks/useDrugs";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";

const Consultations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isNewConsultDialogOpen, setIsNewConsultDialogOpen] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState<ConsultationWithPatient | null>(null);
  const [isConsultDialogOpen, setIsConsultDialogOpen] = useState(false);
  const { user } = useAuth();

  const { data: consultations = [], isLoading } = useConsultations(searchTerm, filterStatus);
  const { data: queueEntries = [] } = useQueueEntries();
  const { data: drugs = [] } = useDrugs();
  
  const createConsultation = useCreateConsultation();
  const completeConsultation = useCompleteConsultation();
  const createPrescription = useCreatePrescription();
  const createLabRequest = useCreateLabRequest();
  const updateQueueStatus = useUpdateQueueStatus();

  // Only show waiting patients in queue
  const waitingPatients = queueEntries.filter((e) => e.status === "waiting");

  const todayCount = consultations.filter((c) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const consultDate = new Date(c.consultation_date);
    consultDate.setHours(0, 0, 0, 0);
    return consultDate.getTime() === today.getTime();
  }).length;

  const inProgressCount = consultations.filter((c) => c.status === "in_progress").length;
  const completedCount = consultations.filter((c) => c.status === "completed").length;

  const { register: registerNew, handleSubmit: handleSubmitNew, reset: resetNew, setValue: setValueNew, watch: watchNew } = useForm({
    defaultValues: {
      queue_entry_id: "",
      patient_id: "",
      chief_complaint: "",
    },
  });

  const { register: registerComplete, handleSubmit: handleSubmitComplete, reset: resetComplete, setValue: setValueComplete, watch: watchComplete } = useForm({
    defaultValues: {
      diagnosis: "",
      notes: "",
      follow_up_date: "",
      // Prescription fields
      add_prescription: false,
      drug_id: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: 0,
      instructions: "",
      // Lab request fields
      add_lab_request: false,
      test_type: "",
      priority: "normal",
    },
  });

  const selectedQueueEntry = watchNew("queue_entry_id");
  const addPrescription = watchComplete("add_prescription");
  const addLabRequest = watchComplete("add_lab_request");

  const onStartConsultation = handleSubmitNew(async (data) => {
    if (!user?.id) return;
    const queueEntry = waitingPatients.find((e) => e.id === data.queue_entry_id);
    if (!queueEntry) return;

    // Create consultation
    await createConsultation.mutateAsync({
      patient_id: queueEntry.patient_id,
      doctor_id: user.id,
      chief_complaint: data.chief_complaint,
      status: "in_progress",
    });

    // Update queue status to in_consultation
    await updateQueueStatus.mutateAsync({
      id: data.queue_entry_id,
      status: "in_consultation",
    });

    resetNew();
    setIsNewConsultDialogOpen(false);
  });

  const onCompleteConsultation = handleSubmitComplete(async (data) => {
    if (!activeConsultation || !user?.id) return;

    // Complete the consultation
    await completeConsultation.mutateAsync({
      id: activeConsultation.id,
      diagnosis: data.diagnosis.split(",").map((d) => d.trim()).filter(Boolean),
      notes: data.notes || undefined,
      followUpDate: data.follow_up_date || undefined,
    });

    // Add prescription if selected
    if (data.add_prescription && data.drug_id) {
      await createPrescription.mutateAsync({
        consultation_id: activeConsultation.id,
        drug_id: data.drug_id,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration,
        quantity: data.quantity,
        instructions: data.instructions || null,
      });
    }

    // Add lab request if selected
    if (data.add_lab_request && data.test_type) {
      await createLabRequest.mutateAsync({
        patient_id: activeConsultation.patient_id,
        consultation_id: activeConsultation.id,
        test_type: data.test_type,
        requested_by: user.id,
        priority: data.priority as "normal" | "urgent",
      });
    }

    resetComplete();
    setActiveConsultation(null);
    setIsConsultDialogOpen(false);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-info/10 text-info hover:bg-info/20">In Progress</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleOpenConsultation = (consultation: ConsultationWithPatient) => {
    setActiveConsultation(consultation);
    setIsConsultDialogOpen(true);
  };

  return (
    <AppLayout title="Consultations" subtitle="Manage patient consultations and diagnoses">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Consultations</p>
                  <p className="text-2xl font-bold">{todayCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                  <ClipboardList className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{inProgressCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <FileText className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <Stethoscope className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Waiting in Queue</p>
                  <p className="text-2xl font-bold">{waitingPatients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Consultation Records</CardTitle>
            <Dialog open={isNewConsultDialogOpen} onOpenChange={setIsNewConsultDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={waitingPatients.length === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Consultation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Start New Consultation</DialogTitle>
                </DialogHeader>
                <form onSubmit={onStartConsultation} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Patient from Queue *</Label>
                    <Select onValueChange={(val) => setValueNew("queue_entry_id", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient from queue" />
                      </SelectTrigger>
                      <SelectContent>
                        {waitingPatients.map((entry) => (
                          <SelectItem key={entry.id} value={entry.id}>
                            {entry.patients.first_name} {entry.patients.last_name} - {entry.patients.student_id}
                            {entry.priority !== "normal" && (
                              <Badge variant="destructive" className="ml-2">{entry.priority}</Badge>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chief_complaint">Chief Complaint *</Label>
                    <Textarea
                      id="chief_complaint"
                      placeholder="Describe the patient's main complaint..."
                      rows={3}
                      {...registerNew("chief_complaint", { required: true })}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsNewConsultDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createConsultation.isPending || !selectedQueueEntry}>
                      {createConsultation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Start Consultation
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name or ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : consultations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Stethoscope className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No consultations found</p>
                <p className="text-muted-foreground">Start a new consultation from the queue</p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Chief Complaint</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultations.map((consultation) => (
                      <TableRow key={consultation.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {consultation.patients.first_name} {consultation.patients.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {consultation.patients.student_id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{new Date(consultation.consultation_date).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(consultation.consultation_date).toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {consultation.chief_complaint}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {consultation.diagnosis && consultation.diagnosis.length > 0 ? (
                              consultation.diagnosis.map((d, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {d}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(consultation.status)}</TableCell>
                        <TableCell className="text-right">
                          {consultation.status === "in_progress" ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenConsultation(consultation)}
                            >
                              Complete
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Complete Consultation Dialog */}
      <Dialog open={isConsultDialogOpen} onOpenChange={setIsConsultDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Consultation</DialogTitle>
          </DialogHeader>
          {activeConsultation && (
            <form onSubmit={onCompleteConsultation} className="space-y-6">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="font-medium">
                  {activeConsultation.patients.first_name} {activeConsultation.patients.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Chief Complaint: {activeConsultation.chief_complaint}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis (comma-separated) *</Label>
                  <Input
                    id="diagnosis"
                    placeholder="e.g. Malaria, Typhoid fever"
                    {...registerComplete("diagnosis", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Clinical Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional clinical notes..."
                    rows={3}
                    {...registerComplete("notes")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="follow_up_date">Follow-up Date</Label>
                  <Input id="follow_up_date" type="date" {...registerComplete("follow_up_date")} />
                </div>
              </div>

              {/* Prescription Section */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="add_prescription"
                    className="h-4 w-4 rounded border-gray-300"
                    {...registerComplete("add_prescription")}
                  />
                  <Label htmlFor="add_prescription" className="font-medium">Add Prescription</Label>
                </div>

                {addPrescription && (
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label>Drug *</Label>
                      <Select onValueChange={(val) => setValueComplete("drug_id", val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select drug" />
                        </SelectTrigger>
                        <SelectContent>
                          {drugs.map((drug) => (
                            <SelectItem key={drug.id} value={drug.id}>
                              {drug.name} ({drug.current_stock} in stock)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="dosage">Dosage *</Label>
                        <Input id="dosage" placeholder="e.g. 500mg" {...registerComplete("dosage")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency *</Label>
                        <Input id="frequency" placeholder="e.g. 3x daily" {...registerComplete("frequency")} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration *</Label>
                        <Input id="duration" placeholder="e.g. 5 days" {...registerComplete("duration")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input id="quantity" type="number" {...registerComplete("quantity", { valueAsNumber: true })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructions">Instructions</Label>
                      <Input id="instructions" placeholder="e.g. Take after meals" {...registerComplete("instructions")} />
                    </div>
                  </div>
                )}
              </div>

              {/* Lab Request Section */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="add_lab_request"
                    className="h-4 w-4 rounded border-gray-300"
                    {...registerComplete("add_lab_request")}
                  />
                  <Label htmlFor="add_lab_request" className="font-medium">Request Lab Test</Label>
                </div>

                {addLabRequest && (
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="test_type">Test Type *</Label>
                      <Input id="test_type" placeholder="e.g. Complete Blood Count" {...registerComplete("test_type")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select defaultValue="normal" onValueChange={(val) => setValueComplete("priority", val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsConsultDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={completeConsultation.isPending}>
                  {completeConsultation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Consultation
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Consultations;
