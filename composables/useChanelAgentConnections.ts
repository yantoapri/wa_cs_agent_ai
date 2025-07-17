import { ref, readonly } from "vue";
import { useSupabaseClient } from "#imports";
import type { chanelAgentConnection } from "../types/supabase";

export const useChanelAgentConnectionStore = () => {
  const connections = ref<chanelAgentConnection[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const supabase = useSupabaseClient();

  // Get all connections
  const fetchConnections = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("chanel_agent_connections")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      connections.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch connections";
      console.error("Error fetching connections:", err);
    } finally {
      loading.value = false;
    }
  };

  // Get connections by chanel
  const fetchConnectionsBychanel = async (chanelId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("chanel_agent_connections")
        .select("*")
        .eq("chanel_id", chanelId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      connections.value = data || [];
      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch connections";
      console.error("Error fetching connections:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get active agent for a chanel
  const getActiveAgentForchanel = async (chanelId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("chanel_agent_connections")
        .select("*")
        .eq("chanel_id", chanelId)
        .eq("is_active", true)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError; // PGRST116 = no rows returned

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch active agent";
      console.error("Error fetching active agent:", err);
      throw err;
    }
  };

  // Connect agent to chanel (with automatic deactivation of other agents)
  const connectAgentTochanel = async (chanelId: string, agentId: string) => {
    loading.value = true;
    error.value = null;

    try {
      // First, deactivate all other agents for this chanel
      const { error: deactivateError } = await supabase
        .from("chanel_agent_connections")
        .update({ is_active: false })
        .eq("chanel_id", chanelId);

      if (deactivateError) throw deactivateError;

      // Check if connection already exists
      const { data: existingConnection, error: checkError } = await supabase
        .from("chanel_agent_connections")
        .select("*")
        .eq("chanel_id", chanelId)
        .eq("agent_id", agentId)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existingConnection) {
        // Update existing connection to active
        const { data, error: updateError } = await supabase
          .from("chanel_agent_connections")
          .update({ is_active: true })
          .eq("id", existingConnection.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Update local state
        const index = connections.value.findIndex(
          (conn) => conn.id === existingConnection.id
        );
        if (index !== -1) {
          connections.value[index] = data;
        } else {
          connections.value.unshift(data);
        }

        return data;
      } else {
        // Create new connection
        const { data, error: insertError } = await supabase
          .from("chanel_agent_connections")
          .insert([
            {
              chanel_id: chanelId,
              agent_id: agentId,
              is_active: true,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        connections.value.unshift(data);
        return data;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to connect agent";
      console.error("Error connecting agent:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Disconnect agent from chanel
  const disconnectAgentFromchanel = async (
    chanelId: string,
    agentId: string
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from("chanel_agent_connections")
        .delete()
        .eq("chanel_id", chanelId)
        .eq("agent_id", agentId);

      if (deleteError) throw deleteError;

      // Remove from local state
      connections.value = connections.value.filter(
        (conn) => !(conn.chanel_id === chanelId && conn.agent_id === agentId)
      );
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to disconnect agent";
      console.error("Error disconnecting agent:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Check if agent is connected to chanel
  const isAgentConnectedTochanel = async (
    chanelId: string,
    agentId: string
  ) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("chanel_agent_connections")
        .select("is_active")
        .eq("chanel_id", chanelId)
        .eq("agent_id", agentId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      return data?.is_active || false;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to check connection";
      console.error("Error checking connection:", err);
      return false;
    }
  };

  // Get all chanels for an agent
  const getchanelsForAgent = async (agentId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("chanel_agent_connections")
        .select(
          `
          *,
          chanels (
            id,
            name,
            type,
            whatsapp_number
          )
        `
        )
        .eq("agent_id", agentId)
        .eq("is_active", true);

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch agent chanels";
      console.error("Error fetching agent chanels:", err);
      throw err;
    }
  };

  // Get all agents for a chanel
  const getAgentsForchanel = async (chanelId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("chanel_agent_connections")
        .select(
          `
          *,
          agents (
            id,
            name,
            type,
            status,
            avatar_url
          )
        `
        )
        .eq("chanel_id", chanelId);

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch chanel agents";
      console.error("Error fetching chanel agents:", err);
      throw err;
    }
  };

  return {
    connections: readonly(connections),
    loading: readonly(loading),
    error: readonly(error),
    fetchConnections,
    fetchConnectionsBychanel,
    getActiveAgentForchanel,
    connectAgentTochanel,
    disconnectAgentFromchanel,
    isAgentConnectedTochanel,
    getchanelsForAgent,
    getAgentsForchanel,
  };
};
