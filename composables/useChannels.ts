import { ref, readonly } from "vue";
import type { Channel } from "../types/supabase";
import { useSupabaseUser } from "#imports";

export const useChannelStore = () => {
  const channels = ref<Channel[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const user = useSupabaseUser();

  const supabase = useSupabaseClient();

  // Get all channels
  const fetchChannels = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("channels")
        .select("*")
        .eq("is_active", true)
        .eq("created_by", user.value?.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      channels.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch channels";
      console.error("Error fetching channels:", err);
    } finally {
      loading.value = false;
    }
  };

  // Add new channel
  const addChannel = async (
    channelData: Omit<Channel, "id" | "created_at" | "updated_at">
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: insertError } = await supabase
        .from("channels")
        .insert([
          {
            ...channelData,
            is_active: true,
            created_by: user.value?.id,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      channels.value.unshift(data);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to add channel";
      console.error("Error adding channel:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update channel
  const updateChannel = async (id: string, updates: Partial<Channel>) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from("channels")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = channels.value.findIndex((channel) => channel.id === id);
      if (index !== -1) {
        channels.value[index] = data;
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update channel";
      console.error("Error updating channel:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete channel (soft delete)
  const deleteChannel = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from("channels")
        .update({ is_active: false })
        .eq("id", id);

      if (deleteError) throw deleteError;

      channels.value = channels.value.filter((channel) => channel.id !== id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete channel";
      console.error("Error deleting channel:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get channel by ID
  const getChannelById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("channels")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch channel";
      console.error("Error fetching channel:", err);
      throw err;
    }
  };

  // Update WhatsApp number for channel
  const updateWhatsAppNumber = async (
    channelId: string,
    whatsappNumber: string
  ) => {
    try {
      const { data, error: updateError } = await supabase
        .from("channels")
        .update({ whatsapp_number: whatsappNumber })
        .eq("id", channelId)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = channels.value.findIndex(
        (channel) => channel.id === channelId
      );
      if (index !== -1) {
        channels.value[index] = data;
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update WhatsApp number";
      console.error("Error updating WhatsApp number:", err);
      throw err;
    }
  };

  return {
    channels: readonly(channels),
    loading: readonly(loading),
    error: readonly(error),
    fetchChannels,
    addChannel,
    updateChannel,
    deleteChannel,
    getChannelById,
    updateWhatsAppNumber,
  };
};
