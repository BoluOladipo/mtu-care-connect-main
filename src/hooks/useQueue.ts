import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useEffect } from "react";

export type QueueEntry = Tables<"queue_entries">;
export type QueueEntryInsert = TablesInsert<"queue_entries">;

export interface QueueEntryWithPatient extends QueueEntry {
  patients: {
    first_name: string;
    last_name: string;
    student_id: string;
  };
}

export function useQueue() {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("queue-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_entries",
        },
        () => {
          // Refetch queue data when any change occurs
          queryClient.invalidateQueries({ queryKey: ["queue"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("queue_entries")
        .select(`
          *,
          patients (
            first_name,
            last_name,
            student_id
          )
        `)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as QueueEntryWithPatient[];
    },
  });
}

export function useAddToQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: QueueEntryInsert) => {
      const { data, error } = await supabase
        .from("queue_entries")
        .insert(entry)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      toast.success("Patient added to queue");
    },
    onError: (error) => {
      toast.error(`Failed to add to queue: ${error.message}`);
    },
  });
}

export function useUpdateQueueEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<QueueEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from("queue_entries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
    onError: (error) => {
      toast.error(`Failed to update queue: ${error.message}`);
    },
  });
}

export function useRemoveFromQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("queue_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      toast.success("Removed from queue");
    },
    onError: (error) => {
      toast.error(`Failed to remove from queue: ${error.message}`);
    },
  });
}

// Alias for consistent naming
export const useQueueEntries = useQueue;

export function useUpdateQueueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("queue_entries")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
    onError: (error) => {
      toast.error(`Failed to update queue status: ${error.message}`);
    },
  });
}
