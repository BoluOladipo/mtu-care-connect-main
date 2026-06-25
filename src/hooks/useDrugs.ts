import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Drug = Tables<"drugs">;
export type DrugInsert = TablesInsert<"drugs">;

export function useDrugs(searchQuery?: string) {
  return useQuery({
    queryKey: ["drugs", searchQuery],
    queryFn: async () => {
      let query = supabase.from("drugs").select("*").order("name");

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,generic_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDrug() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (drug: DrugInsert) => {
      const { data, error } = await supabase.from("drugs").insert(drug).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drugs"] });
      toast.success("Drug added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add drug: ${error.message}`);
    },
  });
}

export function useUpdateDrug() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Drug> & { id: string }) => {
      const { data, error } = await supabase
        .from("drugs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drugs"] });
      toast.success("Drug updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update drug: ${error.message}`);
    },
  });
}

export function useLowStockDrugs() {
  return useQuery({
    queryKey: ["drugs", "low-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drugs")
        .select("*")
        .filter("current_stock", "lte", supabase.rpc ? 10 : 10); // Fallback for minimum_stock comparison

      if (error) throw error;
      return (data || []).filter((d) => d.current_stock <= d.minimum_stock);
    },
  });
}

export function useExpiringDrugs(daysAhead: number = 30) {
  return useQuery({
    queryKey: ["drugs", "expiring", daysAhead],
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data, error } = await supabase
        .from("drugs")
        .select("*")
        .not("expiry_date", "is", null)
        .lte("expiry_date", futureDate.toISOString().split("T")[0])
        .order("expiry_date");

      if (error) throw error;
      return data;
    },
  });
}
