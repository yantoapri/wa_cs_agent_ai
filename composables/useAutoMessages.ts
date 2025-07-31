import { ref, computed } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";
import type { AutoMessage } from "~/types/supabase";

export const useAutoMessages = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const autoMessages = ref<AutoMessage[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const scheduledMessages = computed(() =>
    autoMessages.value.filter((msg) => msg.status === "scheduled")
  );

  const sentMessages = computed(() =>
    autoMessages.value.filter((msg) => msg.status === "sent")
  );

  const cancelledMessages = computed(() =>
    autoMessages.value.filter((msg) => msg.status === "cancelled")
  );

  // Fetch all auto messages
  const fetchAutoMessages = async () => {
    if (!user.value) return;

    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("auto_messages")
        .select("*")
        .eq("created_by", user.value.id)
        .order("scheduled_at", { ascending: false });

      if (fetchError) throw fetchError;

      autoMessages.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch auto messages";
      console.error("Error fetching auto messages:", err);
    } finally {
      loading.value = false;
    }
  };

  // Create new auto message
  const createAutoMessage = async (
    message: Omit<
      AutoMessage,
      "id" | "created_at" | "updated_at" | "created_by"
    >
  ) => {
    if (!user.value) return null;

    loading.value = true;
    error.value = null;

    try {
      const { data, error: createError } = await supabase
        .from("auto_messages")
        .insert({
          ...message,
          created_by: user.value.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      autoMessages.value.unshift(data);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create auto message";
      console.error("Error creating auto message:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Update auto message
  const updateAutoMessage = async (
    id: string,
    updates: Partial<AutoMessage>
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from("auto_messages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = autoMessages.value.findIndex((msg) => msg.id === id);
      if (index !== -1) {
        autoMessages.value[index] = data;
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update auto message";
      console.error("Error updating auto message:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Delete auto message
  const deleteAutoMessage = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from("auto_messages")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      autoMessages.value = autoMessages.value.filter((msg) => msg.id !== id);
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete auto message";
      console.error("Error deleting auto message:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Send auto message now
  const sendAutoMessageNow = async (id: string) => {
    return await updateAutoMessage(id, {
      status: "sent",
      sent_at: new Date().toISOString(),
    });
  };

  // Cancel auto message
  const cancelAutoMessage = async (id: string) => {
    return await updateAutoMessage(id, {
      status: "cancelled",
    });
  };

  return {
    autoMessages,
    loading,
    error,
    scheduledMessages,
    sentMessages,
    cancelledMessages,
    fetchAutoMessages,
    createAutoMessage,
    updateAutoMessage,
    deleteAutoMessage,
    sendAutoMessageNow,
    cancelAutoMessage,
  };
};
