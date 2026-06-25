import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, startOfWeek, addDays } from "date-fns";

export interface ReportStats {
  totalVisits: number;
  visitChange: number;
  avgDailyVisits: number;
  vaccinations: number;
  vaccinationChange: number;
  drugsDispensed: number;
}

export interface MonthlyVisitData {
  month: string;
  visits: number;
}

export interface DiagnosisData {
  name: string;
  count: number;
  color: string;
}

export interface WeeklyTrendData {
  day: string;
  patients: number;
}

export interface DrugUsageData {
  drug: string;
  usage: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--muted-foreground))",
];

export const useReportStats = () => {
  return useQuery({
    queryKey: ["report-stats"],
    queryFn: async (): Promise<ReportStats> => {
      const now = new Date();
      const thisMonthStart = startOfMonth(now).toISOString();
      const thisMonthEnd = endOfMonth(now).toISOString();
      const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString();
      const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();

      const [
        thisMonthVisitsRes,
        lastMonthVisitsRes,
        thisMonthVaccRes,
        lastMonthVaccRes,
        drugsDispensedRes,
      ] = await Promise.all([
        supabase
          .from("consultations")
          .select("id", { count: "exact", head: true })
          .gte("consultation_date", thisMonthStart)
          .lte("consultation_date", thisMonthEnd),
        supabase
          .from("consultations")
          .select("id", { count: "exact", head: true })
          .gte("consultation_date", lastMonthStart)
          .lte("consultation_date", lastMonthEnd),
        supabase
          .from("immunizations")
          .select("id", { count: "exact", head: true })
          .gte("date_administered", thisMonthStart)
          .lte("date_administered", thisMonthEnd),
        supabase
          .from("immunizations")
          .select("id", { count: "exact", head: true })
          .gte("date_administered", lastMonthStart)
          .lte("date_administered", lastMonthEnd),
        supabase
          .from("prescriptions")
          .select("quantity")
          .eq("dispensed", true)
          .gte("dispensed_at", thisMonthStart)
          .lte("dispensed_at", thisMonthEnd),
      ]);

      const thisMonthVisits = thisMonthVisitsRes.count || 0;
      const lastMonthVisits = lastMonthVisitsRes.count || 0;
      const visitChange = lastMonthVisits > 0 
        ? Math.round(((thisMonthVisits - lastMonthVisits) / lastMonthVisits) * 100) 
        : 0;

      const thisMonthVacc = thisMonthVaccRes.count || 0;
      const lastMonthVacc = lastMonthVaccRes.count || 0;
      const vaccinationChange = lastMonthVacc > 0 
        ? Math.round(((thisMonthVacc - lastMonthVacc) / lastMonthVacc) * 100) 
        : 0;

      const drugsDispensed = drugsDispensedRes.data?.reduce((sum, p) => sum + p.quantity, 0) || 0;

      const daysInMonth = now.getDate();
      const avgDailyVisits = daysInMonth > 0 ? Math.round(thisMonthVisits / daysInMonth) : 0;

      return {
        totalVisits: thisMonthVisits,
        visitChange,
        avgDailyVisits,
        vaccinations: thisMonthVacc,
        vaccinationChange,
        drugsDispensed,
      };
    },
  });
};

export const useMonthlyVisits = () => {
  return useQuery({
    queryKey: ["monthly-visits"],
    queryFn: async (): Promise<MonthlyVisitData[]> => {
      const now = new Date();
      const months: MonthlyVisitData[] = [];

      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate).toISOString();
        const monthEnd = endOfMonth(monthDate).toISOString();

        const { count } = await supabase
          .from("consultations")
          .select("id", { count: "exact", head: true })
          .gte("consultation_date", monthStart)
          .lte("consultation_date", monthEnd);

        months.push({
          month: format(monthDate, "MMM"),
          visits: count || 0,
        });
      }

      return months;
    },
  });
};

export const useTopDiagnoses = () => {
  return useQuery({
    queryKey: ["top-diagnoses"],
    queryFn: async (): Promise<DiagnosisData[]> => {
      const now = new Date();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();

      const { data } = await supabase
        .from("consultations")
        .select("diagnosis")
        .gte("consultation_date", monthStart)
        .lte("consultation_date", monthEnd)
        .not("diagnosis", "is", null);

      const diagnosisCounts: Record<string, number> = {};

      (data || []).forEach((c) => {
        if (c.diagnosis && Array.isArray(c.diagnosis)) {
          c.diagnosis.forEach((d: string) => {
            const normalized = d.trim().toLowerCase();
            if (normalized) {
              diagnosisCounts[normalized] = (diagnosisCounts[normalized] || 0) + 1;
            }
          });
        }
      });

      const sorted = Object.entries(diagnosisCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      return sorted.map(([name, count], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        color: COLORS[index % COLORS.length],
      }));
    },
  });
};

export const useWeeklyTrend = () => {
  return useQuery({
    queryKey: ["weekly-trend"],
    queryFn: async (): Promise<WeeklyTrendData[]> => {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const days: WeeklyTrendData[] = [];

      for (let i = 0; i < 5; i++) {
        const dayDate = addDays(weekStart, i);
        const dayStart = new Date(dayDate.setHours(0, 0, 0, 0)).toISOString();
        const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999)).toISOString();

        const { count } = await supabase
          .from("consultations")
          .select("id", { count: "exact", head: true })
          .gte("consultation_date", dayStart)
          .lte("consultation_date", dayEnd);

        days.push({
          day: format(dayDate, "EEE"),
          patients: count || 0,
        });
      }

      return days;
    },
  });
};

export const useTopDrugUsage = () => {
  return useQuery({
    queryKey: ["top-drug-usage"],
    queryFn: async (): Promise<DrugUsageData[]> => {
      const now = new Date();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();

      const { data: prescriptions } = await supabase
        .from("prescriptions")
        .select(`
          quantity,
          drug_id,
          drugs!inner(name)
        `)
        .eq("dispensed", true)
        .gte("dispensed_at", monthStart)
        .lte("dispensed_at", monthEnd);

      const drugUsage: Record<string, number> = {};

      (prescriptions || []).forEach((p) => {
        const drug = p.drugs as unknown as { name: string };
        if (drug?.name) {
          drugUsage[drug.name] = (drugUsage[drug.name] || 0) + p.quantity;
        }
      });

      return Object.entries(drugUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([drug, usage]) => ({ drug, usage }));
    },
  });
};
