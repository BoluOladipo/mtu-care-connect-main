import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type LabRequest = Tables<"lab_requests">;
export type LabRequestInsert = TablesInsert<"lab_requests">;
export type LabRequestUpdate = TablesUpdate<"lab_requests">;

export interface LabRequestWithPatient extends LabRequest {
  patients: {
    first_name: string;
    last_name: string;
    student_id: string;
  };
  profiles?: {
    full_name: string;
  } | null;
}

export function useLabRequests(searchQuery?: string) {
  return useQuery({
    queryKey: ["lab_requests", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("lab_requests")
        .select(`
          *,
          patients (
            first_name,
            last_name,
            student_id
          )
        `)
        .order("requested_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter client-side if search query provided
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        return (data as LabRequestWithPatient[]).filter(
          (req) =>
            req.patients.first_name.toLowerCase().includes(lowerQuery) ||
            req.patients.last_name.toLowerCase().includes(lowerQuery) ||
            req.patients.student_id.toLowerCase().includes(lowerQuery) ||
            req.test_type.toLowerCase().includes(lowerQuery)
        );
      }
      
      return data as LabRequestWithPatient[];
    },
  });
}

export function useCreateLabRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: LabRequestInsert) => {
      const { data, error } = await supabase
        .from("lab_requests")
        .insert(request)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab_requests"] });
      toast.success("Lab request created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create lab request: ${error.message}`);
    },
  });
}

export function useUpdateLabRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: LabRequestUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("lab_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab_requests"] });
      toast.success("Lab request updated");
    },
    onError: (error) => {
      toast.error(`Failed to update lab request: ${error.message}`);
    },
  });
}

export function useCompleteLabRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, results, completedBy }: { id: string; results: string; completedBy: string }) => {
      const { data, error } = await supabase
        .from("lab_requests")
        .update({
          status: "completed",
          results,
          completed_at: new Date().toISOString(),
          completed_by: completedBy,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab_requests"] });
      toast.success("Lab results recorded");
    },
    onError: (error) => {
      toast.error(`Failed to record results: ${error.message}`);
    },
  });
}

export function useStartLabRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("lab_requests")
        .update({ status: "in_progress" })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab_requests"] });
      toast.success("Lab test started");
    },
    onError: (error) => {
      toast.error(`Failed to start test: ${error.message}`);
    },
  });
}
