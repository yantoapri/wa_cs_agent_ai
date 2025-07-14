import { ref, readonly } from "vue";
import type { ChannelAgentConnection } from "../types/supabase";

export const useChannelAgentConnectionStore = () => {
  const connections = ref<ChannelAgentConnection[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const supabase = useSupabaseClient();

  // Get all connections
  const fetchConnections = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("channel_agent_connections")
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

  // Get connections by channel
  const fetchConnectionsByChannel = async (channelId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("channel_agent_connections")
        .select("*")
        .eq("channel_id", channelId)
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

  // Get active agent for a channel
  const getActiveAgentForChannel = async (channelId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("channel_agent_connections")
        .select("*")
        .eq("channel_id", channelId)
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

  // Connect agent to channel (with automatic deactivation of other agents)
  const connectAgentToChannel = async (channelId: string, agentId: string) => {
    loading.value = true;
    error.value = null;

    try {
      // First, deactivate all other agents for this channel
      const { error: deactivateError } = await supabase
        .from("channel_agent_connections")
        .update({ is_active: false })
        .eq("channel_id", channelId);

      if (deactivateError) throw deactivateError;

      // Check if connection already exists
      const { data: existingConnection, error: checkError } = await supabase
        .from("channel_agent_connections")
        .select("*")
        .eq("channel_id", channelId)
        .eq("agent_id", agentId)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existingConnection) {
        // Update existing connection to active
        const { data, error: updateError } = await supabase
          .from("channel_agent_connections")
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
          .from("channel_agent_connections")
          .insert([
            {
              channel_id: channelId,
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

  // Disconnect agent from channel
  const disconnectAgentFromChannel = async (
    channelId: string,
    agentId: string
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: updateError } = await supabase
        .from("channel_agent_connections")
        .update({ is_active: false })
        .eq("channel_id", channelId)
        .eq("agent_id", agentId);

      if (updateError) throw updateError;

      // Update local state
      const index = connections.value.findIndex(
        (conn) => conn.channel_id === channelId && conn.agent_id === agentId
      );
      if (index !== -1) {
        connections.value[index].is_active = false;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to disconnect agent";
      console.error("Error disconnecting agent:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Check if agent is connected to channel
  const isAgentConnectedToChannel = async (
    channelId: string,
    agentId: string
  ) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("channel_agent_connections")
        .select("is_active")
        .eq("channel_id", channelId)
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

  // Get all channels for an agent
  const getChannelsForAgent = async (agentId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("channel_agent_connections")
        .select(
          `
          *,
          channels (
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
        err instanceof Error ? err.message : "Failed to fetch agent channels";
      console.error("Error fetching agent channels:", err);
      throw err;
    }
  };

  // Get all agents for a channel
  const getAgentsForChannel = async (channelId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("channel_agent_connections")
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
        .eq("channel_id", channelId);

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch channel agents";
      console.error("Error fetching channel agents:", err);
      throw err;
    }
  };

  return {
    connections: readonly(connections),
    loading: readonly(loading),
    error: readonly(error),
    fetchConnections,
    fetchConnectionsByChannel,
    getActiveAgentForChannel,
    connectAgentToChannel,
    disconnectAgentFromChannel,
    isAgentConnectedToChannel,
    getChannelsForAgent,
    getAgentsForChannel,
  };
};
