import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalPatientsToday: number;
  currentQueueLength: number;
  averageWaitTime: number;
  appointmentsToday: number;
  lowStockAlerts: number;
  expiringDrugsCount: number;
  totalPatients: number;
  completedToday: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      // Fetch all data in parallel
      const [
        { count: totalPatients },
        { data: todayQueue },
        { data: appointments },
        { data: drugs },
      ] = await Promise.all([
        supabase.from("patients").select("*", { count: "exact", head: true }),
        supabase.from("queue_entries").select("*").gte("created_at", `${today}T00:00:00`),
        supabase.from("appointments").select("*").eq("appointment_date", today),
        supabase.from("drugs").select("*"),
      ]);

      const waitingCount = todayQueue?.filter((q) => q.status === "waiting").length || 0;
      const completedCount = todayQueue?.filter((q) => q.status === "completed").length || 0;

      const lowStockDrugs = drugs?.filter((d) => d.current_stock <= d.minimum_stock) || [];
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const expiringDrugs = drugs?.filter((d) => {
        if (!d.expiry_date) return false;
        return new Date(d.expiry_date) <= futureDate;
      }) || [];

      return {
        totalPatients: totalPatients || 0,
        totalPatientsToday: todayQueue?.length || 0,
        currentQueueLength: waitingCount,
        completedToday: completedCount,
        appointmentsToday: appointments?.length || 0,
        lowStockAlerts: lowStockDrugs.length,
        expiringDrugsCount: expiringDrugs.length,
        averageWaitTime: 18, // Would need more complex calculation
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
