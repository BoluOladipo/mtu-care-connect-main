import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Users,
  Pill,
  Syringe,
  FileDown,
  Calendar,
  Activity,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useReportStats,
  useMonthlyVisits,
  useTopDiagnoses,
  useWeeklyTrend,
  useTopDrugUsage,
} from "@/hooks/useReports";

const chartConfig = {
  visits: { label: "Visits", color: "hsl(var(--primary))" },
  patients: { label: "Patients", color: "hsl(var(--primary))" },
  usage: { label: "Usage", color: "hsl(var(--primary))" },
};

const Reports = () => {
  const { data: stats, isLoading: statsLoading } = useReportStats();
  const { data: monthlyVisits, isLoading: visitsLoading } = useMonthlyVisits();
  const { data: diagnoses, isLoading: diagnosesLoading } = useTopDiagnoses();
  const { data: weeklyTrend, isLoading: weeklyLoading } = useWeeklyTrend();
  const { data: drugUsage, isLoading: drugsLoading } = useTopDrugUsage();

  const maxDiagnosisCount = diagnoses && diagnoses.length > 0 
    ? Math.max(...diagnoses.map(d => d.count)) 
    : 1;

  return (
    <AppLayout title="Reports & Analytics" subtitle="View clinic performance metrics and trends">
      <div className="space-y-6">
        {/* Report Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Select defaultValue="this-month">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="this-quarter">This Quarter</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="general">General Medicine</SelectItem>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Visits</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{stats?.totalVisits.toLocaleString() || 0}</p>
                      <p className={`text-xs ${stats?.visitChange && stats.visitChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {stats?.visitChange && stats.visitChange >= 0 ? '+' : ''}{stats?.visitChange || 0}% from last month
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                  <Activity className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Daily Visits</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{stats?.avgDailyVisits || 0}</p>
                      <p className="text-xs text-muted-foreground">Based on this month</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <Syringe className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vaccinations</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{stats?.vaccinations || 0}</p>
                      <p className={`text-xs ${stats?.vaccinationChange && stats.vaccinationChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {stats?.vaccinationChange && stats.vaccinationChange >= 0 ? '+' : ''}{stats?.vaccinationChange || 0}% from last month
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <Pill className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Drugs Dispensed</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{stats?.drugsDispensed.toLocaleString() || 0}</p>
                      <p className="text-xs text-muted-foreground">Units this month</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Visits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Visit Trends
              </CardTitle>
              <CardDescription>Patient visits over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {visitsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : monthlyVisits && monthlyVisits.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={monthlyVisits}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No visit data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Common Diagnoses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Common Diagnoses
              </CardTitle>
              <CardDescription>Top diagnoses this month</CardDescription>
            </CardHeader>
            <CardContent>
              {diagnosesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : diagnoses && diagnoses.length > 0 ? (
                <div className="space-y-4">
                  {diagnoses.map((item) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium truncate">{item.name}</div>
                      <div className="flex-1">
                        <div className="h-3 rounded-full bg-muted">
                          <div
                            className="h-3 rounded-full"
                            style={{
                              width: `${(item.count / maxDiagnosisCount) * 100}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm font-medium">{item.count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  No diagnosis data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Patient Flow
              </CardTitle>
              <CardDescription>Patients per day this week</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : weeklyTrend && weeklyTrend.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="patients"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No weekly data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Drug Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Top Drug Usage
              </CardTitle>
              <CardDescription>Most dispensed medications</CardDescription>
            </CardHeader>
            <CardContent>
              {drugsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : drugUsage && drugUsage.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={drugUsage} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="drug" type="category" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No drug usage data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
            <CardDescription>Generate common reports with one click</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <Users className="h-6 w-6" />
                <span>Daily Summary</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <Pill className="h-6 w-6" />
                <span>Inventory Report</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <Syringe className="h-6 w-6" />
                <span>Vaccination Stats</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <Activity className="h-6 w-6" />
                <span>Staff Performance</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;
