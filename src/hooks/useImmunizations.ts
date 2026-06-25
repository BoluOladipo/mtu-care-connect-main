import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Immunization = Tables<"immunizations">;
export type ImmunizationInsert = TablesInsert<"immunizations">;
export type ImmunizationUpdate = TablesUpdate<"immunizations">;

export interface ImmunizationWithPatient extends Immunization {
  patients: {
    first_name: string;
    last_name: string;
    student_id: string;
  };
}

export function useImmunizations(searchQuery?: string) {
  return useQuery({
    queryKey: ["immunizations", searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("immunizations")
        .select(`
          *,
          patients (
            first_name,
            last_name,
            student_id
          )
        `)
        .order("date_administered", { ascending: false });

      if (error) throw error;

      // Filter client-side if search query provided
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        return (data as ImmunizationWithPatient[]).filter(
          (rec) =>
            rec.patients.first_name.toLowerCase().includes(lowerQuery) ||
            rec.patients.last_name.toLowerCase().includes(lowerQuery) ||
            rec.patients.student_id.toLowerCase().includes(lowerQuery) ||
            rec.vaccine_name.toLowerCase().includes(lowerQuery)
        );
      }

      return data as ImmunizationWithPatient[];
    },
  });
}

export function useCreateImmunization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (immunization: ImmunizationInsert) => {
      const { data, error } = await supabase
        .from("immunizations")
        .insert(immunization)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immunizations"] });
      toast.success("Immunization record added");
    },
    onError: (error) => {
      toast.error(`Failed to add record: ${error.message}`);
    },
  });
}

export function useUpdateImmunization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ImmunizationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("immunizations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immunizations"] });
      toast.success("Immunization record updated");
    },
    onError: (error) => {
      toast.error(`Failed to update record: ${error.message}`);
    },
  });
}

// Helper to determine immunization status
export function getImmunizationStatus(record: ImmunizationWithPatient): "completed" | "due" | "overdue" {
  if (!record.next_dose_date) {
    return "completed";
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDose = new Date(record.next_dose_date);
  nextDose.setHours(0, 0, 0, 0);
  
  if (nextDose < today) {
    return "overdue";
  }
  
  // Due within 7 days
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  if (nextDose <= sevenDaysFromNow) {
    return "due";
  }
  
  return "completed";
}
