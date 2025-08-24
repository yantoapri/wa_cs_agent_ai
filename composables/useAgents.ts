import { ref, readonly } from "vue";
import type { Agent } from "../types/supabase";
import { useSupabaseUser } from "#imports";

export const useAgentStore = () => {
  const agents = ref<Agent[]>([]);
  const aiAgents = ref<Agent[]>([]);
  const humanAgents = ref<Agent[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const user = useSupabaseUser();

  const supabase = useSupabaseClient();

  // Get all agents
  const fetchAgents = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("agents")
        .select("*")
        .eq("is_active", true)
        .eq("created_by", user.value?.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      agents.value = data || [];
      aiAgents.value = data?.filter((agent) => agent.type === "ai") || [];
      humanAgents.value =
        data?.filter((agent) => agent.type === "manusia") || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch agents";
      console.error("Error fetching agents:", err);
    } finally {
      loading.value = false;
    }
  };

  // Get agents by type
  const fetchAgentsByType = async (type: "ai" | "manusia") => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("agents")
        .select("*")
        .eq("type", type)
        .eq("is_active", true)
        .eq("created_by", user.value?.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      if (type === "ai") {
        aiAgents.value = data || [];
      } else {
        humanAgents.value = data || [];
      }

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : `Failed to fetch ${type} agents`;
      console.error(`Error fetching ${type} agents:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Add new agent
  const addAgent = async (
    agentData: Omit<Agent, "id" | "created_at" | "updated_at">
  ) => {
    loading.value = true;
    error.value = null;

    try {
      // Check for duplicate phone number for human agents within the same user
      if (agentData.type === "manusia" && agentData.phone) {
        const { data: existingAgent, error: checkError } = await supabase
          .from("agents")
          .select("*")
          .eq("phone", agentData.phone)
          .eq("type", "manusia")
          .eq("created_by", user.value?.id)
          .eq("is_active", true)
          .maybeSingle();

        if (checkError) throw checkError;
        if (existingAgent) {
          throw new Error("Nomor telepon sudah ada,gunakan nomor lain");
        }
      }

      const { data, error: insertError } = await supabase
        .from("agents")
        .insert([
          {
            ...agentData,
            is_active: true,
            created_by: user.value?.id,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      agents.value.unshift(data);

      if (data.type === "ai") {
        aiAgents.value.unshift(data);
      } else {
        humanAgents.value.unshift(data);
      }

      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to add agent";
      console.error("Error adding agent:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update agent
  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    loading.value = true;
    error.value = null;

    try {
      // Check for duplicate phone number for human agents within the same user (excluding current agent)
      if (updates.type === "manusia" && updates.phone) {
        const { data: existingAgent, error: checkError } = await supabase
          .from("agents")
          .select("*")
          .eq("phone", updates.phone)
          .eq("type", "manusia")
          .eq("created_by", user.value?.id)
          .eq("is_active", true)
          .neq("id", id) // Exclude current agent being updated
          .maybeSingle();

        if (checkError) throw checkError;
        if (existingAgent) {
          throw new Error("Nomor telepon sudah digunakan di agent manusia lain milik Anda");
        }
      }

      const { data, error: updateError } = await supabase
        .from("agents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update in main agents array
      const index = agents.value.findIndex((agent) => agent.id === id);
      if (index !== -1) {
        agents.value[index] = data;
      }

      // Update in type-specific arrays
      if (data.type === "ai") {
        const aiIndex = aiAgents.value.findIndex((agent) => agent.id === id);
        if (aiIndex !== -1) {
          aiAgents.value[aiIndex] = data;
        }
      } else {
        const humanIndex = humanAgents.value.findIndex(
          (agent) => agent.id === id
        );
        if (humanIndex !== -1) {
          humanAgents.value[humanIndex] = data;
        }
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update agent";
      console.error("Error updating agent:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete agent (soft delete)
  const deleteAgent = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from("agents")
        .update({ is_active: false })
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Remove from all arrays
      agents.value = agents.value.filter((agent) => agent.id !== id);
      aiAgents.value = aiAgents.value.filter((agent) => agent.id !== id);
      humanAgents.value = humanAgents.value.filter((agent) => agent.id !== id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete agent";
      console.error("Error deleting agent:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get agent by ID
  const getAgentById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("agents")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch agent";
      console.error("Error fetching agent:", err);
      throw err;
    }
  };

  // Update agent status
  const updateAgentStatus = async (id: string, status: Agent["status"]) => {
    try {
      const { data, error: updateError } = await supabase
        .from("agents")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update in all arrays
      const updateArrays = [agents, aiAgents, humanAgents];
      updateArrays.forEach((array) => {
        const index = array.value.findIndex((agent) => agent.id === id);
        if (index !== -1) {
          array.value[index] = data;
        }
      });

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update agent status";
      console.error("Error updating agent status:", err);
      throw err;
    }
  };

  return {
    agents: readonly(agents),
    aiAgents: readonly(aiAgents),
    humanAgents: readonly(humanAgents),
    loading: readonly(loading),
    error: readonly(error),
    fetchAgents,
    fetchAgentsByType,
    addAgent,
    updateAgent,
    deleteAgent,
    getAgentById,
    updateAgentStatus,
  };
};
