import { ref, computed } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";
import type { BroadcastMessage } from "~/types/supabase";

export const useBroadcastMessages = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const broadcastMessages = ref<BroadcastMessage[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const draftMessages = computed(() =>
    broadcastMessages.value.filter((msg) => msg.status === "draft")
  );

  const pendingMessages = computed(() =>
    broadcastMessages.value.filter((msg) => msg.status === "pending")
  );

  const sentMessages = computed(() =>
    broadcastMessages.value.filter((msg) => msg.status === "sent")
  );

  // Fetch all broadcast messages
  const fetchBroadcastMessages = async () => {
    if (!user.value) return;

    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("broadcast_messages")
        .select("*")
        .eq("created_by", user.value.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      broadcastMessages.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch broadcast messages";
      console.error("Error fetching broadcast messages:", err);
    } finally {
      loading.value = false;
    }
  };

  // Create new broadcast message
  const createBroadcastMessage = async (
    message: Omit<
      BroadcastMessage,
      "id" | "created_at" | "updated_at" | "created_by"
    >
  ) => {
    if (!user.value) return null;

    loading.value = true;
    error.value = null;

    try {
      const { data, error: createError } = await supabase
        .from("broadcast_messages")
        .insert({
          ...message,
          created_by: user.value.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      broadcastMessages.value.unshift(data);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to create broadcast message";
      console.error("Error creating broadcast message:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Update broadcast message
  const updateBroadcastMessage = async (
    id: string,
    updates: Partial<BroadcastMessage>
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from("broadcast_messages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = broadcastMessages.value.findIndex((msg) => msg.id === id);
      if (index !== -1) {
        broadcastMessages.value[index] = data;
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to update broadcast message";
      console.error("Error updating broadcast message:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Delete broadcast message
  const deleteBroadcastMessage = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from("broadcast_messages")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      broadcastMessages.value = broadcastMessages.value.filter(
        (msg) => msg.id !== id
      );
      return true;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to delete broadcast message";
      console.error("Error deleting broadcast message:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Send broadcast message
  const sendBroadcastMessage = async (id: string) => {
    return await updateBroadcastMessage(id, {
      status: "sent",
      sent_at: new Date().toISOString(),
    });
  };

  return {
    broadcastMessages,
    loading,
    error,
    draftMessages,
    pendingMessages,
    sentMessages,
    fetchBroadcastMessages,
    createBroadcastMessage,
    updateBroadcastMessage,
    deleteBroadcastMessage,
    sendBroadcastMessage,
  };
};
