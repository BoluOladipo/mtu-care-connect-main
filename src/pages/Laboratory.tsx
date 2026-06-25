import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  FlaskConical,
  Clock,
  CheckCircle,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLabRequests, useStartLabRequest, useCompleteLabRequest, LabRequestWithPatient } from "@/hooks/useLabRequests";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";

const statusConfig = {
  pending: { label: "Pending", color: "bg-warning/20 text-warning", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-info/20 text-info", icon: FlaskConical },
  completed: { label: "Completed", color: "bg-success/20 text-success", icon: CheckCircle },
};

const Laboratory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LabRequestWithPatient | null>(null);
  const { user } = useAuth();

  const { data: labRequests = [], isLoading } = useLabRequests(searchQuery);
  const startLabRequest = useStartLabRequest();
  const completeLabRequest = useCompleteLabRequest();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      results: "",
    },
  });

  const pendingCount = labRequests.filter((r) => r.status === "pending").length;
  const inProgressCount = labRequests.filter((r) => r.status === "in_progress").length;
  const completedCount = labRequests.filter((r) => r.status === "completed").length;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleStartTest = async (id: string) => {
    await startLabRequest.mutateAsync(id);
  };

  const handleOpenResultsDialog = (request: LabRequestWithPatient) => {
    setSelectedRequest(request);
    setResultsDialogOpen(true);
  };

  const onSubmitResults = handleSubmit(async (data) => {
    if (!selectedRequest || !user?.id) return;
    await completeLabRequest.mutateAsync({
      id: selectedRequest.id,
      results: data.results,
      completedBy: user.id,
    });
    reset();
    setResultsDialogOpen(false);
    setSelectedRequest(null);
  });

  return (
    <AppLayout title="Laboratory" subtitle="Lab requests and test results">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{labRequests.length}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning text-warning-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-info/30 bg-info/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info text-info-foreground">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
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
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <Tabs defaultValue="requests" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="requests" className="gap-2">
                <FlaskConical className="h-4 w-4" />
                Requests
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-2">
                <FileText className="h-4 w-4" />
                Results
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:w-64"
                />
              </div>
            </div>
          </div>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Lab Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : labRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FlaskConical className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium">No lab requests</p>
                    <p className="text-muted-foreground">Lab requests from consultations will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Test Type</TableHead>
                          <TableHead>Requested At</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {labRequests.map((request) => {
                          const status = statusConfig[request.status as keyof typeof statusConfig];
                          const StatusIcon = status?.icon || Clock;

                          return (
                            <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                      {getInitials(request.patients.first_name, request.patients.last_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {request.patients.first_name} {request.patients.last_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {request.patients.student_id}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{request.test_type}</p>
                              </TableCell>
                              <TableCell>
                                {new Date(request.requested_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={request.priority === "urgent" ? "destructive" : "secondary"}
                                >
                                  {request.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${status?.color} flex w-fit items-center gap-1`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {status?.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {request.status === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStartTest(request.id)}
                                    disabled={startLabRequest.isPending}
                                  >
                                    {startLabRequest.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Start"
                                    )}
                                  </Button>
                                )}
                                {request.status === "in_progress" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenResultsDialog(request)}
                                  >
                                    Enter Results
                                  </Button>
                                )}
                                {request.status === "completed" && (
                                  <Button size="sm" variant="ghost" className="gap-1">
                                    <FileText className="h-3 w-3" />
                                    View
                                  </Button>
                                )}
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

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Completed Results</CardTitle>
              </CardHeader>
              <CardContent>
                {labRequests.filter((r) => r.status === "completed").length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium">No completed results</p>
                    <p className="text-muted-foreground">Completed lab results will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {labRequests
                      .filter((r) => r.status === "completed")
                      .map((request) => (
                        <div
                          key={request.id}
                          className="flex items-start justify-between rounded-lg border p-4"
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(request.patients.first_name, request.patients.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {request.patients.first_name} {request.patients.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {request.test_type}
                              </p>
                              <p className="mt-2 text-sm">
                                <span className="font-medium">Result:</span> {request.results}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Completed: {request.completed_at ? new Date(request.completed_at).toLocaleString() : "N/A"}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Results Entry Dialog */}
      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Lab Results</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <form onSubmit={onSubmitResults} className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="font-medium">
                  {selectedRequest.patients.first_name} {selectedRequest.patients.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{selectedRequest.test_type}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="results">Test Results *</Label>
                <Textarea
                  id="results"
                  placeholder="Enter the test results..."
                  rows={4}
                  {...register("results", { required: true })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setResultsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={completeLabRequest.isPending}>
                  {completeLabRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Results
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Laboratory;
