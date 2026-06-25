import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Consultation = Tables<"consultations">;
export type ConsultationInsert = TablesInsert<"consultations">;
export type ConsultationUpdate = TablesUpdate<"consultations">;

export interface ConsultationWithPatient extends Consultation {
  patients: {
    first_name: string;
    last_name: string;
    student_id: string;
  };
  profiles?: {
    full_name: string;
  } | null;
}

export function useConsultations(searchQuery?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ["consultations", searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("consultations")
        .select(`
          *,
          patients (
            first_name,
            last_name,
            student_id
          )
        `)
        .order("consultation_date", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter client-side if search query provided
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        return (data as ConsultationWithPatient[]).filter(
          (con) =>
            con.patients.first_name.toLowerCase().includes(lowerQuery) ||
            con.patients.last_name.toLowerCase().includes(lowerQuery) ||
            con.patients.student_id.toLowerCase().includes(lowerQuery)
        );
      }

      return data as ConsultationWithPatient[];
    },
  });
}

export function useTodayConsultations() {
  return useQuery({
    queryKey: ["consultations", "today"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from("consultations")
        .select(`
          *,
          patients (
            first_name,
            last_name,
            student_id
          )
        `)
        .gte("consultation_date", today.toISOString())
        .lt("consultation_date", tomorrow.toISOString())
        .order("consultation_date", { ascending: true });

      if (error) throw error;
      return data as ConsultationWithPatient[];
    },
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (consultation: ConsultationInsert) => {
      const { data, error } = await supabase
        .from("consultations")
        .insert(consultation)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      toast.success("Consultation started");
    },
    onError: (error) => {
      toast.error(`Failed to start consultation: ${error.message}`);
    },
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ConsultationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("consultations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast.success("Consultation updated");
    },
    onError: (error) => {
      toast.error(`Failed to update consultation: ${error.message}`);
    },
  });
}

export function useCompleteConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, diagnosis, notes, followUpDate }: { 
      id: string; 
      diagnosis: string[]; 
      notes?: string;
      followUpDate?: string;
    }) => {
      const { data, error } = await supabase
        .from("consultations")
        .update({
          status: "completed",
          diagnosis,
          notes,
          follow_up_date: followUpDate || null,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      toast.success("Consultation completed");
    },
    onError: (error) => {
      toast.error(`Failed to complete consultation: ${error.message}`);
    },
  });
}
