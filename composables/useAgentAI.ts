import { ref, readonly } from "vue";
import type { AgentAIConfig } from "../types/supabase";
import { useSupabaseUser } from "#imports";

export const useAgentAIStore = () => {
  const aiConfigs = ref<AgentAIConfig[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const user = useSupabaseUser();

  const supabase = useSupabaseClient();

  // Get AI config by agent ID
  const getAIConfigByAgentId = async (agentId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("agent_ai_configs")
        .select("*")
        .eq("agent_id", agentId)
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      return data || null;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch AI config";
      console.error("Error fetching AI config:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Create or update AI config
  const saveAIConfig = async (
    agentId: string,
    configData: Partial<AgentAIConfig>
  ) => {
    loading.value = true;
    error.value = null;

    try {
      // Use upsert to handle both insert and update
      const { data, error: upsertError } = await supabase
        .from("agent_ai_configs")
        .upsert(
          {
            agent_id: agentId,
            ...configData,
          },
          {
            onConflict: "agent_id",
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (upsertError) {
        throw upsertError;
      }

      // Update local state
      const index = aiConfigs.value.findIndex(
        (config) => config.agent_id === agentId
      );
      if (index !== -1) {
        aiConfigs.value[index] = data;
      } else {
        aiConfigs.value.push(data);
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to save AI config";
      console.error("Error saving AI config:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update specific AI config fields
  const updateAIConfigField = async (
    agentId: string,
    field: keyof AgentAIConfig,
    value: any
  ) => {
    try {
      // First check if config exists
      const existingConfig = await getAIConfigByAgentId(agentId);

      if (existingConfig) {
        // Update existing config
        const { data, error: updateError } = await supabase
          .from("agent_ai_configs")
          .update({ [field]: value })
          .eq("agent_id", agentId)
          .select()
          .single();

        if (updateError) throw updateError;

        // Update local state
        const index = aiConfigs.value.findIndex(
          (config) => config.agent_id === agentId
        );
        if (index !== -1) {
          aiConfigs.value[index] = data;
        } else {
          aiConfigs.value.push(data);
        }

        return data;
      } else {
        // Create new config with the field
        const { data, error: insertError } = await supabase
          .from("agent_ai_configs")
          .insert([
            {
              agent_id: agentId,
              [field]: value,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        // Update local state
        aiConfigs.value.push(data);
        return data;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update AI config field";
      console.error("Error updating AI config field:", err);
      throw err;
    }
  };

  // Update gaya bicara
  const updateGayaBicara = async (agentId: string, gayaBicara: string) => {
    return await updateAIConfigField(agentId, "gaya_bicara", gayaBicara);
  };

  // Update pengetahuan
  const updatePengetahuan = async (agentId: string, pengetahuan: string) => {
    return await updateAIConfigField(agentId, "pengetahuan", pengetahuan);
  };

  // Update handover conditions
  const updateHandoverConditions = async (
    agentId: string,
    handoverConditions: any[]
  ) => {
    return await updateAIConfigField(
      agentId,
      "handover_conditions",
      handoverConditions
    );
  };

  // Update followup configs
  const updateFollowupConfigs = async (
    agentId: string,
    followupConfigs: any[]
  ) => {
    return await updateAIConfigField(
      agentId,
      "followup_configs",
      followupConfigs
    );
  };

  // Update kirim gambar configs
  const updateKirimGambarConfigs = async (
    agentId: string,
    kirimGambarConfigs: any[]
  ) => {
    return await updateAIConfigField(
      agentId,
      "kirim_gambar_configs",
      kirimGambarConfigs
    );
  };

  // Delete AI config
  const deleteAIConfig = async (agentId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from("agent_ai_configs")
        .delete()
        .eq("agent_id", agentId);

      if (deleteError) throw deleteError;

      // Remove from local state
      aiConfigs.value = aiConfigs.value.filter(
        (config) => config.agent_id !== agentId
      );
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete AI config";
      console.error("Error deleting AI config:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get all AI configs
  const fetchAllAIConfigs = async () => {
    loading.value = true;
    error.value = null;

    try {
      if (!user.value) {
        aiConfigs.value = [];
        return [];
      }

      // 1. Get agent_ids for the current user
      const { data: agents, error: agentsError } = await supabase
        .from("agents")
        .select("id")
        .eq("created_by", user.value.id);

      if (agentsError) throw agentsError;

      const agentIds = agents.map((agent) => agent.id);

      if (agentIds.length === 0) {
        aiConfigs.value = [];
        return [];
      }

      // 2. Fetch AI configs for those agents
      const { data, error: fetchError } = await supabase
        .from("agent_ai_configs")
        .select("*")
        .in("agent_id", agentIds)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      aiConfigs.value = data || [];
      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch AI configs";
      console.error("Error fetching AI configs:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    aiConfigs: readonly(aiConfigs),
    loading: readonly(loading),
    error: readonly(error),
    getAIConfigByAgentId,
    saveAIConfig,
    updateAIConfigField,
    updateGayaBicara,
    updatePengetahuan,
    updateHandoverConditions,
    updateFollowupConfigs,
    updateKirimGambarConfigs,
    deleteAIConfig,
    fetchAllAIConfigs,
  };
};