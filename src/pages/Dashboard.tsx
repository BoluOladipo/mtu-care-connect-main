import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LiveQueue } from "@/components/queue/LiveQueue";
import { TodayAppointments } from "@/components/dashboard/TodayAppointments";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import {
  Users,
  ClipboardList,
  Clock,
  Calendar,
  AlertTriangle,
  Pill,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboard";

const Dashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <AppLayout title="Dashboard" subtitle="VitaCare(MTU) Health Centre Overview">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Patients Today"
            value={isLoading ? "..." : stats?.totalPatientsToday || 0}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="In Queue"
            value={isLoading ? "..." : stats?.currentQueueLength || 0}
            icon={ClipboardList}
            variant="info"
          />
          <StatCard
            title="Avg. Wait Time"
            value={isLoading ? "..." : `${stats?.averageWaitTime || 0} min`}
            icon={Clock}
            variant="default"
          />
          <StatCard
            title="Appointments"
            value={isLoading ? "..." : stats?.appointmentsToday || 0}
            icon={Calendar}
            variant="success"
          />
          <StatCard
            title="Low Stock Items"
            value={isLoading ? "..." : stats?.lowStockAlerts || 0}
            icon={AlertTriangle}
            variant="warning"
          />
          <StatCard
            title="Expiring Soon"
            value={isLoading ? "..." : stats?.expiringDrugsCount || 0}
            icon={Pill}
            variant="warning"
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Live Queue */}
          <LiveQueue compact />

          {/* Today's Appointments */}
          <TodayAppointments />
        </div>

        {/* Alerts Panel */}
        <AlertsPanel />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
