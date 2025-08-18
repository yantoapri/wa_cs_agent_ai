import { ref, readonly } from "vue";
import type { chanel } from "../types/supabase";
import { useSupabaseUser } from "#imports";

export const useChanelstore = () => {
  const chanels = ref<chanel[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const user = useSupabaseUser();

  const supabase = useSupabaseClient();

  // Get all chanels
  const fetchchanels = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("chanels")
        .select("*")
        .eq("is_active", true)
        .eq("created_by", user.value?.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      if (data && data.length > 0) {
        chanels.value = data || [];
    
      }

      
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch chanels";
      console.error("Error fetching chanels:", err);
    } finally {
      loading.value = false;
    }
  };

  // Add new chanel
  const addchanel = async (
    chanelData: Omit<chanel, "id" | "created_at" | "updated_at">
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: insertError } = await supabase
        .from("chanels")
        .insert([
          {
            ...chanelData,
            is_active: true,
            created_by: user.value?.id,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      chanels.value.unshift(data);
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to add chanel";
      console.error("Error adding chanel:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update chanel
  const updatechanel = async (id: string, updates: Partial<chanel>) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from("chanels")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = chanels.value.findIndex((chanel) => chanel.id === id);
      if (index !== -1) {
        chanels.value[index] = data;
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update chanel";
      console.error("Error updating chanel:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete chanel (soft delete)
  const deletechanel = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from("chanels")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      chanels.value = chanels.value.filter((chanel) => chanel.id !== id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete chanel";
      console.error("Error deleting chanel:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get chanel by ID
  const getchanelById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("chanels")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch chanel";
      console.error("Error fetching chanel:", err);
      throw err;
    }
  };

  // Update WhatsApp number for chanel
  const updateWhatsAppNumber = async (
    chanelId: string,
    whatsappNumber: string
  ) => {
    try {
      const { data, error: updateError } = await supabase
        .from("chanels")
        .update({ whatsapp_number: whatsappNumber })
        .eq("id", chanelId)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = chanels.value.findIndex((chanel) => chanel.id === chanelId);
      if (index !== -1) {
        chanels.value[index] = data;
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
    chanels: readonly(chanels),
    loading: readonly(loading),
    error: readonly(error),
    fetchchanels,
    addchanel,
    updatechanel,
    deletechanel,
    getchanelById,
    updateWhatsAppNumber,
  };
};