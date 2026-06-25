import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  Clock,
  TrendingDown,
  Pill,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDrugs, useCreateDrug, useUpdateDrug, useLowStockDrugs, useExpiringDrugs, Drug } from "@/hooks/useDrugs";
import { usePendingPrescriptions, useDispensePrescription } from "@/hooks/usePrescriptions";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";

const categories = [
  "Analgesics",
  "Antibiotics",
  "NSAIDs",
  "Antidiabetics",
  "Vitamins",
  "Gastrointestinal",
  "Antihistamines",
  "Antimalarials",
  "Cardiovascular",
  "Other",
];

const Pharmacy = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user } = useAuth();

  const { data: drugs = [], isLoading } = useDrugs(searchQuery);
  const { data: lowStockDrugs = [] } = useLowStockDrugs();
  const { data: expiringDrugs = [] } = useExpiringDrugs(30);
  const { data: pendingPrescriptions = [] } = usePendingPrescriptions();

  const createDrug = useCreateDrug();
  const updateDrug = useUpdateDrug();
  const dispensePrescription = useDispensePrescription();

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      generic_name: "",
      category: "",
      unit_of_measure: "tablets",
      current_stock: 0,
      minimum_stock: 10,
      unit_price: 0,
      batch_number: "",
      expiry_date: "",
      supplier: "",
    },
  });

  const outOfStockDrugs = drugs.filter((d) => d.current_stock === 0);

  const onSubmitDrug = handleSubmit(async (data) => {
    await createDrug.mutateAsync({
      name: data.name,
      generic_name: data.generic_name || null,
      category: data.category,
      unit_of_measure: data.unit_of_measure,
      current_stock: data.current_stock,
      minimum_stock: data.minimum_stock,
      unit_price: data.unit_price,
      batch_number: data.batch_number || null,
      expiry_date: data.expiry_date || null,
      supplier: data.supplier || null,
    });
    reset();
    setIsAddDialogOpen(false);
  });

  const handleDispense = async (prescriptionId: string) => {
    if (!user?.id) return;
    await dispensePrescription.mutateAsync({
      prescriptionId,
      dispensedBy: user.id,
    });
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { label: "Out of Stock", color: "bg-destructive text-destructive-foreground" };
    if (current <= minimum) return { label: "Low Stock", color: "bg-warning text-warning-foreground" };
    return { label: "In Stock", color: "bg-success/20 text-success" };
  };

  const getStockPercentage = (current: number, minimum: number) => {
    const target = minimum * 2;
    return Math.min((current / target) * 100, 100);
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };

  return (
    <AppLayout title="Pharmacy" subtitle="Drug inventory and dispensing management">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{drugs.length}</p>
                <p className="text-sm text-muted-foreground">Total Drugs</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning text-warning-foreground">
                <TrendingDown className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStockDrugs.length}</p>
                <p className="text-sm text-muted-foreground">Low Stock</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStockDrugs.length}</p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-info/30 bg-info/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info text-info-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiringDrugs.length}</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inventory" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="inventory" className="gap-2">
                <Package className="h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="dispense" className="gap-2">
                <Pill className="h-4 w-4" />
                Dispense ({pendingPrescriptions.length})
              </TabsTrigger>
              <TabsTrigger value="alerts" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alerts
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search drugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:w-64"
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Drug
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Drug</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={onSubmitDrug} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Drug Name *</Label>
                        <Input id="name" {...register("name", { required: true })} placeholder="e.g. Paracetamol 500mg" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="generic_name">Generic Name</Label>
                        <Input id="generic_name" {...register("generic_name")} placeholder="e.g. Acetaminophen" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select onValueChange={(val) => setValue("category", val)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit_of_measure">Unit of Measure *</Label>
                        <Select defaultValue="tablets" onValueChange={(val) => setValue("unit_of_measure", val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tablets">Tablets</SelectItem>
                            <SelectItem value="capsules">Capsules</SelectItem>
                            <SelectItem value="ml">ML (Liquid)</SelectItem>
                            <SelectItem value="bottles">Bottles</SelectItem>
                            <SelectItem value="sachets">Sachets</SelectItem>
                            <SelectItem value="vials">Vials</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="current_stock">Current Stock *</Label>
                        <Input id="current_stock" type="number" {...register("current_stock", { valueAsNumber: true })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimum_stock">Minimum Stock *</Label>
                        <Input id="minimum_stock" type="number" {...register("minimum_stock", { valueAsNumber: true })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit_price">Unit Price (₦) *</Label>
                        <Input id="unit_price" type="number" {...register("unit_price", { valueAsNumber: true })} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="batch_number">Batch Number</Label>
                        <Input id="batch_number" {...register("batch_number")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiry_date">Expiry Date</Label>
                        <Input id="expiry_date" type="date" {...register("expiry_date")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input id="supplier" {...register("supplier")} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createDrug.isPending}>
                        {createDrug.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Drug
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Drug Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : drugs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium">No drugs in inventory</p>
                    <p className="text-muted-foreground">Add your first drug to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Drug Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Stock Level</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead>Expiry</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drugs.map((drug) => {
                          const stockStatus = getStockStatus(drug.current_stock, drug.minimum_stock);
                          const stockPercentage = getStockPercentage(drug.current_stock, drug.minimum_stock);

                          return (
                            <TableRow key={drug.id} className="cursor-pointer hover:bg-muted/50">
                              <TableCell>
                                <div>
                                  <p className="font-medium">{drug.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {drug.generic_name || "-"}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{drug.category}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="w-32 space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>{drug.current_stock}</span>
                                    <span className="text-muted-foreground">
                                      / {drug.minimum_stock * 2}
                                    </span>
                                  </div>
                                  <Progress
                                    value={stockPercentage}
                                    className={cn(
                                      "h-2",
                                      drug.current_stock === 0 && "[&>div]:bg-destructive",
                                      drug.current_stock <= drug.minimum_stock && drug.current_stock > 0 && "[&>div]:bg-warning"
                                    )}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {drug.batch_number || "-"}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    "text-sm",
                                    isExpiringSoon(drug.expiry_date) && "text-destructive font-medium"
                                  )}
                                >
                                  {drug.expiry_date ? new Date(drug.expiry_date).toLocaleDateString() : "-"}
                                  {isExpiringSoon(drug.expiry_date) && (
                                    <Badge variant="destructive" className="ml-2 text-xs">
                                      Expiring
                                    </Badge>
                                  )}
                                </span>
                              </TableCell>
                              <TableCell>₦{Number(drug.unit_price).toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
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

          <TabsContent value="dispense">
            <Card>
              <CardHeader>
                <CardTitle>Pending Prescriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingPrescriptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Pill className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium">No pending prescriptions</p>
                    <p className="text-muted-foreground">All prescriptions have been dispensed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPrescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium">
                                {prescription.consultations.patients.first_name}{" "}
                                {prescription.consultations.patients.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {prescription.consultations.patients.student_id}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <p>
                              <span className="font-medium">{prescription.drugs.name}</span>
                              {prescription.drugs.generic_name && (
                                <span className="text-muted-foreground"> ({prescription.drugs.generic_name})</span>
                              )}
                            </p>
                            <p className="text-muted-foreground">
                              {prescription.dosage} | {prescription.frequency} | {prescription.duration} | Qty: {prescription.quantity}
                            </p>
                            {prescription.instructions && (
                              <p className="text-muted-foreground mt-1">Note: {prescription.instructions}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {prescription.drugs.current_stock < prescription.quantity ? (
                            <Badge variant="destructive">Insufficient Stock</Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleDispense(prescription.id)}
                              disabled={dispensePrescription.isPending}
                            >
                              {dispensePrescription.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Dispense"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-4">
              {lowStockDrugs.length === 0 && expiringDrugs.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium">No alerts</p>
                    <p className="text-muted-foreground">All stock levels are healthy</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {lowStockDrugs.map((drug) => (
                    <Card key={drug.id} className="border-l-4 border-l-warning">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                            <TrendingDown className="h-5 w-5 text-warning" />
                          </div>
                          <div>
                            <p className="font-medium">{drug.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Only {drug.current_stock} units remaining (min: {drug.minimum_stock})
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {expiringDrugs.map((drug) => (
                    <Card key={drug.id} className="border-l-4 border-l-destructive">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
                            <Clock className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium">{drug.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Batch {drug.batch_number} expires on{" "}
                              {drug.expiry_date ? new Date(drug.expiry_date).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                        </div>
                        <Button variant="destructive" size="sm">
                          Flag for Review
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Pharmacy;
