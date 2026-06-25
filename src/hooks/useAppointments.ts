import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useEffect } from "react";

export type Appointment = Tables<"appointments">;
export type AppointmentInsert = TablesInsert<"appointments">;

export interface AppointmentWithPatient extends Appointment {
  patients: {
    first_name: string;
    last_name: string;
    student_id: string;
  };
}

export function useAppointments(date?: string) {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("appointment-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        () => {
          // Refetch appointments data when any change occurs
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["appointments", date],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          patients (
            first_name,
            last_name,
            student_id
          )
        `)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (date) {
        query = query.eq("appointment_date", date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AppointmentWithPatient[];
    },
  });
}

export function useTodayAppointments() {
  const today = new Date().toISOString().split("T")[0];
  return useAppointments(today);
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert(appointment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment scheduled successfully");
    },
    onError: (error) => {
      toast.error(`Failed to schedule appointment: ${error.message}`);
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment updated");
    },
    onError: (error) => {
      toast.error(`Failed to update appointment: ${error.message}`);
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment cancelled");
    },
    onError: (error) => {
      toast.error(`Failed to cancel appointment: ${error.message}`);
    },
  });
}
