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
      // Use a more efficient query with DISTINCT to get unique combinations
      const { data: rawData, error: queryError } = await supabase
      .rpc('get_latest_messages_by_agent_chanel_contact',{
        p_agent_type: "ai",
        p_created_by: user.value?.id
      });
       if (queryError) {
      console.error('Error saat memanggil fungsi:', error);
      return null;
    }
      return rawData;
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
      // Use a more efficient query with DISTINCT to get unique combinations
       const { data: rawData, error: queryError } = await supabase
      .rpc('get_latest_messages_by_agent_chanel_contact',{
        p_agent_type: "ai",
        p_created_by: user.value?.id
      });
       if (queryError) {
      console.error('Error saat memanggil fungsi:', error);
      return null;
    }
      return rawData;
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
    console.log({agentId,
    contactId,
    chanelId})
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
        .eq("created_by", user.value?.id)
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
        .eq("agent_type", "manusia") // filter by agent_type di tabel messages
        .eq("created_by", user.value?.id)
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
      // First, check if the channel is active/connected
      const { data: channelData, error: channelError } = await supabase
        .from("chanels")
        .select("is_active, name")
        .eq("id", messageData.chanel_id)
        .single();

      if (channelError) {
        console.error("Error fetching channel status:", channelError);
        throw new Error("Gagal memeriksa status channel");
      }

      if (!channelData?.is_active) {
        const channelName = channelData?.name || "Unknown";
        const errorMessage = `Channel "${channelName}" tidak terhubung. Silakan hubungkan channel terlebih dahulu.`;
        error.value = errorMessage;
        throw new Error(errorMessage);
      }

      // Get agent type for the message
      let agent_type = null;
      try {
        const { data: agentData, error: agentErr } = await supabase
          .from("agents")
          .select("type")
          .eq("id", messageData.agent_id)
          .maybeSingle();
        if (agentData && agentData.type) {
          agent_type = agentData.type; // 'ai' atau 'manusia'
        }
      } catch (e) {
        console.error("Error fetching agent type:", e);
      }

      if (!agent_type) {
        throw new Error(
          "agent_type tidak ditemukan untuk agent_id: " + messageData.agent_id
        );
      }

      // Send message to WAHA first if it's an outbound message
      if (messageData.direction === "outbound") {
        try {
          // Get contact phone number
          const { data: contactData, error: contactError } = await supabase
            .from("contacts")
            .select("phone_number")
            .eq("id", messageData.contact_id)
            .single();

          if (contactError) {
            console.error("Error fetching contact:", contactError);
            throw new Error("Gagal mendapatkan nomor telepon contact");
          }

          // Get channel session name
          const { data: channelSessionData, error: sessionError } =
            await supabase
              .from("chanels")
              .select("session_name")
              .eq("id", messageData.chanel_id)
              .single();

          if (sessionError) {
            console.error("Error fetching channel session:", sessionError);
            throw new Error("Gagal mendapatkan session channel");
          }

          // Prepare WAHA message data
          const wahaMessageData: any = {
            session: channelSessionData.session_name,
            to: contactData.phone_number,
          };

          // Add text if present
          if (messageData.content && messageData.content.trim()) {
            wahaMessageData.text = messageData.content;
          }

          // Add media if present
          if (messageData.media_url) {
            wahaMessageData.media = messageData.media_url;
          }

          // Send to WAHA API first
          const wahaResponse = await $fetch(`/api/waha-send-message`, {
            method: "POST",
            body: wahaMessageData,
          });

          if (!wahaResponse || (wahaResponse as any).error) {
            throw new Error(
              (wahaResponse as any)?.message || "Gagal mengirim pesan ke Wa"
            );
          }

        } catch (wahaError) {
          console.error("Error sending message to Wa:", wahaError);
          throw new Error(
            wahaError instanceof Error
              ? wahaError.message
              : "Gagal mengirim pesan ke Wa"
          );
        }
      }

      // Prepare message data for database insertion (using same structure as message.post.js)
      const dbMessageData = {
        agent_id: messageData.agent_id,
        chanel_id: messageData.chanel_id,
        contact_id: messageData.contact_id,
        message_type: messageData.message_type,
        media_url: messageData.media_url || null,
        content: messageData.content,
        from: messageData.agent_id, // Use agent_id as from
        to: messageData.contact_id, // Use contact_id as to
        agent_type: agent_type,
      };

      // Save message to database only after successful WAHA send
      const { data, error: insertError } = await supabase
        .from("messages")
        .insert([dbMessageData])
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to local messages
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
    fetchMessagesByGroupManusia, // tambahkan ini
    addMessage,
    markMessagesAsRead,
  };
};
