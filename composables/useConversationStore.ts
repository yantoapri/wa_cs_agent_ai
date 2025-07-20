import { ref, readonly } from "vue";
import { useSupabaseUser, useSupabaseClient } from "#imports";
import type { Conversation, Message } from "../types/supabase";

export const useConversationStore = () => {
  const conversations = ref<Conversation[]>([]);
  const messages = ref<Message[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const user = useSupabaseUser();

  const supabase = useSupabaseClient();

  // Get AI agent conversations from messages table grouped by agent, contact, chanel
  const fetchAIAgentConversations = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Query to get messages grouped by AI agents with contact and chanel info
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select(
          `
          agent_id,
          sender,
          contact_id,
          chanel_id,
          message_type,
          content,
          media_url,
          created_at,
          agents!inner(
            id,
            name,
            type,
            avatar_url,
            created_by
          ),
          contacts!left(
            id,
            name,
            phone_number,
            avatar_url
          ),
          chanels!left(
            id,
            name,
            type,
            icon_url
          )
        `
        )
        .eq("agents.type", "ai")
        .eq("agents.created_by", user.value?.id)
        .not("agent_id", "is", null)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      // Group by agent_id, contact_id, chanel_id
      const agentConversations = new Map();

      data?.forEach((item) => {
        const agentId = item.agent_id;
        const contactId = item.contact_id;
        const chanelId = item.chanel_id;
        const agent = item.agents;
        const contact = item.contacts;
        const chanel = item.chanels;

        const groupKey = `${agentId}-${contactId}-${chanelId}`;

        if (!agentConversations.has(groupKey)) {
          agentConversations.set(groupKey, {
            agent: agent,
            contact: contact,
            chanel: chanel,
            messages: [],
            totalMessages: 0,
            unreadCount: 0,
            lastActivity: 0,
          });
        }

        const groupData = agentConversations.get(groupKey);
        groupData.messages.push(item);
        groupData.totalMessages++;
        groupData.lastActivity = Math.max(
          groupData.lastActivity,
          new Date(item.created_at).getTime()
        );
      });

      // Convert to array format for easier use in UI
      const result = Array.from(agentConversations.values()).map((item) => ({
        agent: item.agent,
        contact: item.contact,
        chanel: item.chanel,
        messages: item.messages,
        totalMessages: item.totalMessages,
        unreadCount: item.unreadCount,
        lastActivity: item.lastActivity,
      }));

      // Sort by last activity
      result.sort((a, b) => b.lastActivity - a.lastActivity);

      return result;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch AI agent conversations";
      console.error("Error fetching AI agent conversations:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get Human agent conversations from messages table grouped by agent, contact, chanel
  const fetchHumanAgentConversations = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Query to get messages grouped by Human agents with contact and chanel info
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select(
          `
          agent_id,
          contact_id,
          chanel_id,
          agents!inner(
            id,
            name,
            type,
            avatar_url,
            created_by
          ),
          contacts!left(
            id,
            name,
            phone_number,
            avatar_url
          ),
          chanels!left(
            id,
            name,
            type,
            icon_url
          )
        `
        )
        .eq("agents.type", "manusia")
        .eq("agents.created_by", user.value?.id)
        .not("agent_id", "is", null)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      // Group by agent_id, contact_id, chanel_id
      const agentConversations = new Map();

      data?.forEach((item) => {
        const agentId = item.agent_id;
        const contactId = item.contact_id;
        const chanelId = item.chanel_id;
        const agent = item.agents;
        const contact = item.contacts;
        const chanel = item.chanels;

        const groupKey = `${agentId}-${contactId}-${chanelId}`;

        if (!agentConversations.has(groupKey)) {
          agentConversations.set(groupKey, {
            agent: agent,
            contact: contact,
            chanel: chanel,
            messages: [],
            totalMessages: 0,
            unreadCount: 0,
            lastActivity: 0,
          });
        }

        const groupData = agentConversations.get(groupKey);
        groupData.messages.push(item);
        groupData.totalMessages++;
        groupData.lastActivity = Math.max(
          groupData.lastActivity,
          new Date(item.created_at).getTime()
        );
      });

      // Convert to array format for easier use in UI
      const result = Array.from(agentConversations.values()).map((item) => ({
        agent: item.agent,
        contact: item.contact,
        chanel: item.chanel,
        messages: item.messages,
        totalMessages: item.totalMessages,
        unreadCount: item.unreadCount,
        lastActivity: item.lastActivity,
      }));

      // Sort by last activity
      result.sort((a, b) => b.lastActivity - a.lastActivity);

      return result;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch Human agent conversations";
      console.error("Error fetching Human agent conversations:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get messages for a specific agent-contact-chanel group
  const fetchMessagesByGroupAi = async (
    agentId: string,
    contactId: string,
    chanelId: string
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select(
          `
          *,
          agents!left(
            id,
            name,
            type,
            avatar_url
          ),
          contacts!left(
            id,
            name,
            phone_number,
            avatar_url
          ),
          chanels!left(
            id,
            name,
            type,
            icon_url
          )
        `
        )
        .eq("agent_id", agentId)
        .eq("contact_id", contactId)
        .eq("chanel_id", chanelId)
        .eq("agents.type", "ai")
        .order("created_at", { ascending: true });
      if (fetchError) throw fetchError;

      messages.value = data || [];
      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch messages by group";
      console.error("Error fetching messages by group:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const fetchMessagesByGroupManusia = async (
    agentId: string,
    contactId: string,
    chanelId: string
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select(
          `
          *,
          agents!left(
            id,
            name,
            type,
            avatar_url
          ),
          contacts!left(
            id,
            name,
            phone_number,
            avatar_url
          ),
          chanels!left(
            id,
            name,
            type,
            icon_url
          )
        `
        )
        .eq("agent_id", agentId)
        .eq("contact_id", contactId)
        .eq("chanel_id", chanelId)
        .eq("agents.type", "manusia")
        .order("created_at", { ascending: true });
      if (fetchError) throw fetchError;

      messages.value = data || [];
      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch messages by group";
      console.error("Error fetching messages by group:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  // Add message to a specific agent-contact-chanel group
  const addMessage = async (
    messageData: Omit<Message, "id" | "created_at">
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: insertError } = await supabase
        .from("messages")
        .insert([messageData])
        .select()
        .single();

      if (insertError) throw insertError;

      messages.value.push(data);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to add message";
      console.error("Error adding message:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Mark messages as read for a specific group
  const markMessagesAsRead = async (
    agentId: string,
    contactId: string,
    chanelId: string
  ) => {
    try {
      const { error: updateError } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("agent_id", agentId)
        .eq("contact_id", contactId)
        .eq("chanel_id", chanelId)
        .eq("direction", "inbound");

      if (updateError) throw updateError;

      // Update local messages
      messages.value.forEach((message) => {
        if (
          message.agent_id === agentId &&
          message.contact_id === contactId &&
          message.chanel_id === chanelId &&
          message.direction === "inbound"
        ) {
          message.is_read = true;
        }
      });
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to mark messages as read";
      console.error("Error marking messages as read:", err);
      throw err;
    }
  };

  return {
    conversations: readonly(conversations),
    messages: readonly(messages),
    loading: readonly(loading),
    error: readonly(error),
    fetchAIAgentConversations,
    fetchHumanAgentConversations,
    fetchMessagesByGroupAi,
    addMessage,
    markMessagesAsRead,
  };
};
