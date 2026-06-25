import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Clock,
  UserPlus,
  Play,
  CheckCircle,
  Stethoscope,
  FlaskConical,
  Pill,
  RefreshCw,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueue, useAddToQueue, useUpdateQueueEntry, useRemoveFromQueue, QueueEntryWithPatient } from "@/hooks/useQueue";
import { usePatients } from "@/hooks/usePatients";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInMinutes } from "date-fns";
import { toast } from "sonner";

type QueueStatus = "waiting" | "in_consultation" | "in_lab" | "in_pharmacy" | "completed";

const statusConfig: Record<QueueStatus, { label: string; icon: typeof Clock; color: string }> = {
  waiting: { label: "Waiting", icon: Clock, color: "bg-warning/20 text-warning border-warning/30" },
  in_consultation: { label: "In Consultation", icon: Stethoscope, color: "bg-info/20 text-info border-info/30" },
  in_lab: { label: "In Laboratory", icon: FlaskConical, color: "bg-chart-4/20 text-chart-4 border-chart-4/30" },
  in_pharmacy: { label: "In Pharmacy", icon: Pill, color: "bg-primary/20 text-primary border-primary/30" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-success/20 text-success border-success/30" },
};

const priorityConfig = {
  normal: { label: "Normal", color: "bg-muted text-muted-foreground" },
  urgent: { label: "Urgent", color: "bg-warning text-warning-foreground" },
  emergency: { label: "Emergency", color: "bg-destructive text-destructive-foreground animate-pulse-subtle" },
};

const Queue = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<"normal" | "urgent" | "emergency">("normal");
  
  const { data: queue = [], isLoading, refetch } = useQueue();
  const { data: patients = [] } = usePatients();
  const addToQueue = useAddToQueue();
  const updateEntry = useUpdateQueueEntry();
  const removeFromQueue = useRemoveFromQueue();

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("queue-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_entries" },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const waitingQueue = queue.filter((q) => q.status === "waiting");
  const inProgressQueue = queue.filter(
    (q) => q.status === "in_consultation" || q.status === "in_lab" || q.status === "in_pharmacy"
  );
  const completedQueue = queue.filter((q) => q.status === "completed");

  const handleAddToQueue = async () => {
    if (!selectedPatient) return;
    await addToQueue.mutateAsync({
      patient_id: selectedPatient,
      priority: selectedPriority,
    });
    setIsDialogOpen(false);
    setSelectedPatient("");
    setSelectedPriority("normal");
  };

  const handleUpdateStatus = async (id: string, status: QueueStatus) => {
    await updateEntry.mutateAsync({ id, status });
    toast.success(`Patient moved to ${statusConfig[status].label}`);
  };

  const calculateWaitTime = (checkInTime: string) => {
    return differenceInMinutes(new Date(), new Date(checkInTime));
  };

  const getAverageWaitTime = () => {
    const waiting = queue.filter((q) => q.status === "waiting");
    if (waiting.length === 0) return 0;
    const totalWait = waiting.reduce((sum, q) => sum + calculateWaitTime(q.check_in_time), 0);
    return Math.round(totalWait / waiting.length);
  };

  const renderQueueCard = (entry: QueueEntryWithPatient) => {
    const status = statusConfig[entry.status as QueueStatus];
    const priority = priorityConfig[entry.priority as keyof typeof priorityConfig];
    const StatusIcon = status.icon;
    const waitTime = calculateWaitTime(entry.check_in_time);

    return (
      <Card
        key={entry.id}
        className={cn(
          "transition-all hover:shadow-md",
          entry.priority === "emergency" && "border-destructive/50 ring-2 ring-destructive/20"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <span className="text-xs">Queue</span>
                <span className="text-lg font-bold">#{queue.indexOf(entry) + 1}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    {entry.patients.first_name} {entry.patients.last_name}
                  </h3>
                  <Badge className={priority.color}>{priority.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{entry.patients.student_id}</p>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Check-in: {format(new Date(entry.check_in_time), "h:mm a")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Wait: {waitTime} min
                  </span>
                </div>
                {entry.notes && (
                  <p className="mt-1 text-sm text-muted-foreground italic">{entry.notes}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className={cn("flex items-center gap-1", status.color)}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </Badge>
              {entry.status === "waiting" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => handleUpdateStatus(entry.id, "in_consultation")}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Start
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => removeFromQueue.mutate(entry.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              {entry.status === "in_consultation" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => handleUpdateStatus(entry.id, "in_lab")}
                  >
                    <FlaskConical className="h-3.5 w-3.5" />
                    To Lab
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => handleUpdateStatus(entry.id, "in_pharmacy")}
                  >
                    <Pill className="h-3.5 w-3.5" />
                    To Pharmacy
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => handleUpdateStatus(entry.id, "completed")}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Complete
                  </Button>
                </div>
              )}
              {(entry.status === "in_lab" || entry.status === "in_pharmacy") && (
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => handleUpdateStatus(entry.id, "completed")}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <AppLayout title="Queue Management" subtitle="Live clinic queue and patient flow">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Queue Management" subtitle="Live clinic queue and patient flow">
      <div className="space-y-6">
        {/* Stats Bar */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-warning/10 border-warning/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning text-warning-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{waitingQueue.length}</p>
                <p className="text-sm text-muted-foreground">Waiting</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-info/10 border-info/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info text-info-foreground">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressQueue.length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-success/10 border-success/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success text-success-foreground">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedQueue.length}</p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{getAverageWaitTime()} min</p>
                <p className="text-sm text-muted-foreground">Avg. Wait Time</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add to Queue
          </Button>
        </div>

        {/* Queue Tabs */}
        <Tabs defaultValue="waiting" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="waiting" className="gap-2">
              <Clock className="h-4 w-4" />
              Waiting ({waitingQueue.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              In Progress ({inProgressQueue.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({completedQueue.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="waiting" className="space-y-4">
            {waitingQueue.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No patients waiting</p>
                </CardContent>
              </Card>
            ) : (
              waitingQueue
                .sort((a, b) => {
                  const priorityOrder = { emergency: 0, urgent: 1, normal: 2 };
                  return (
                    priorityOrder[a.priority as keyof typeof priorityOrder] -
                    priorityOrder[b.priority as keyof typeof priorityOrder]
                  );
                })
                .map(renderQueueCard)
            )}
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4">
            {inProgressQueue.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Stethoscope className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No patients in progress</p>
                </CardContent>
              </Card>
            ) : (
              inProgressQueue.map(renderQueueCard)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedQueue.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No completed visits today</p>
                </CardContent>
              </Card>
            ) : (
              completedQueue.map(renderQueueCard)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add to Queue Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Patient to Queue</DialogTitle>
            <DialogDescription>Select a patient to add to the waiting queue</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} ({p.student_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={selectedPriority} onValueChange={(v) => setSelectedPriority(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToQueue} disabled={!selectedPatient || addToQueue.isPending}>
              {addToQueue.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Queue;
