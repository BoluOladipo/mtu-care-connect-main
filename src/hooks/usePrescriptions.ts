import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Prescription = Tables<"prescriptions">;
export type PrescriptionInsert = TablesInsert<"prescriptions">;
export type PrescriptionUpdate = TablesUpdate<"prescriptions">;

export interface PrescriptionWithDrug extends Prescription {
  drugs: {
    name: string;
    generic_name: string | null;
    current_stock: number;
  };
}

export interface PrescriptionWithDetails extends Prescription {
  drugs: {
    name: string;
    generic_name: string | null;
    current_stock: number;
  };
  consultations: {
    patient_id: string;
    patients: {
      first_name: string;
      last_name: string;
      student_id: string;
    };
  };
}

export function usePrescriptions(consultationId?: string) {
  return useQuery({
    queryKey: ["prescriptions", consultationId],
    queryFn: async () => {
      let query = supabase
        .from("prescriptions")
        .select(`
          *,
          drugs (
            name,
            generic_name,
            current_stock
          )
        `)
        .order("created_at", { ascending: false });

      if (consultationId) {
        query = query.eq("consultation_id", consultationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PrescriptionWithDrug[];
    },
    enabled: !!consultationId || consultationId === undefined,
  });
}

export function usePendingPrescriptions() {
  return useQuery({
    queryKey: ["prescriptions", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          drugs (
            name,
            generic_name,
            current_stock
          ),
          consultations!inner (
            patient_id,
            patients (
              first_name,
              last_name,
              student_id
            )
          )
        `)
        .eq("dispensed", false)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as PrescriptionWithDetails[];
    },
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prescription: PrescriptionInsert) => {
      const { data, error } = await supabase
        .from("prescriptions")
        .insert(prescription)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast.success("Prescription added");
    },
    onError: (error) => {
      toast.error(`Failed to add prescription: ${error.message}`);
    },
  });
}

export function useDispensePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prescriptionId, dispensedBy }: { prescriptionId: string; dispensedBy: string }) => {
      // Get prescription details first
      const { data: prescription, error: fetchError } = await supabase
        .from("prescriptions")
        .select("*, drugs(current_stock)")
        .eq("id", prescriptionId)
        .single();

      if (fetchError) throw fetchError;

      // Check stock
      const drug = prescription.drugs as { current_stock: number };
      if (drug.current_stock < prescription.quantity) {
        throw new Error("Insufficient stock");
      }

      // Update prescription as dispensed
      const { error: updateError } = await supabase
        .from("prescriptions")
        .update({
          dispensed: true,
          dispensed_at: new Date().toISOString(),
          dispensed_by: dispensedBy,
        })
        .eq("id", prescriptionId);

      if (updateError) throw updateError;

      // Reduce drug stock
      const { error: stockError } = await supabase
        .from("drugs")
        .update({
          current_stock: drug.current_stock - prescription.quantity,
        })
        .eq("id", prescription.drug_id);

      if (stockError) throw stockError;

      return prescription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["drugs"] });
      toast.success("Prescription dispensed");
    },
    onError: (error) => {
      toast.error(`Failed to dispense: ${error.message}`);
    },
  });
}
