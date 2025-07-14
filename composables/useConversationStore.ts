import { ref, readonly } from "vue";
import type { Conversation, Message } from "../types/supabase";

export const useConversationStore = () => {
  const conversations = ref<Conversation[]>([]);
  const messages = ref<Message[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const supabase = useSupabaseClient();

  // Get all conversations
  const fetchConversations = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("conversations")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false });

      if (fetchError) throw fetchError;

      conversations.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch conversations";
      console.error("Error fetching conversations:", err);
    } finally {
      loading.value = false;
    }
  };

  // Get conversations by channel
  const fetchConversationsByChannel = async (channelId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("conversations")
        .select("*")
        .eq("channel_id", channelId)
        .eq("is_active", true)
        .order("updated_at", { ascending: false });

      if (fetchError) throw fetchError;

      conversations.value = data || [];
      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch conversations";
      console.error("Error fetching conversations:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get conversations by agent
  const fetchConversationsByAgent = async (agentId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("conversations")
        .select("*")
        .eq("assigned_agent_id", agentId)
        .eq("is_active", true)
        .order("updated_at", { ascending: false });

      if (fetchError) throw fetchError;

      conversations.value = data || [];
      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch conversations";
      console.error("Error fetching conversations:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get conversation by ID
  const getConversationById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch conversation";
      console.error("Error fetching conversation:", err);
      throw err;
    }
  };

  // Create new conversation
  const createConversation = async (
    conversationData: Omit<Conversation, "id" | "created_at" | "updated_at">
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: insertError } = await supabase
        .from("conversations")
        .insert([
          {
            ...conversationData,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      conversations.value.unshift(data);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create conversation";
      console.error("Error creating conversation:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update conversation
  const updateConversation = async (
    id: string,
    updates: Partial<Conversation>
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from("conversations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = conversations.value.findIndex(
        (conversation) => conversation.id === id
      );
      if (index !== -1) {
        conversations.value[index] = data;
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update conversation";
      console.error("Error updating conversation:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Assign conversation to agent
  const assignConversationToAgent = async (
    conversationId: string,
    agentId: string
  ) => {
    try {
      const { data, error: updateError } = await supabase
        .from("conversations")
        .update({ assigned_agent_id: agentId })
        .eq("id", conversationId)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = conversations.value.findIndex(
        (conversation) => conversation.id === conversationId
      );
      if (index !== -1) {
        conversations.value[index] = data;
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to assign conversation";
      console.error("Error assigning conversation:", err);
      throw err;
    }
  };

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from("conversations")
        .update({ unread_count: 0 })
        .eq("id", conversationId)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = conversations.value.findIndex(
        (conversation) => conversation.id === conversationId
      );
      if (index !== -1) {
        conversations.value[index] = data;
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to mark conversation as read";
      console.error("Error marking conversation as read:", err);
      throw err;
    }
  };

  // Get messages for conversation
  const fetchMessages = async (conversationId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      messages.value = data || [];
      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch messages";
      console.error("Error fetching messages:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Add message to conversation
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

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .eq("direction", "inbound");

      if (updateError) throw updateError;

      // Update local messages
      messages.value.forEach((message) => {
        if (
          message.conversation_id === conversationId &&
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
    fetchConversations,
    fetchConversationsByChannel,
    fetchConversationsByAgent,
    getConversationById,
    createConversation,
    updateConversation,
    assignConversationToAgent,
    markConversationAsRead,
    fetchMessages,
    addMessage,
    markMessagesAsRead,
  };
};
