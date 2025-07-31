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
      console.log(
        "[useConversationStore] Starting AI agent conversations fetch..."
      );

      // Use a more efficient query with DISTINCT to get unique combinations
      const { data: rawData, error: queryError } = await supabase
        .from("messages")
        .select(
          `
          agent_id,
          contact_id,
          chanel_id,
          content,
          created_at,
          agents!inner(
            id,
            name,
            type,
            avatar_url,
            created_by
          ),
          contacts!inner(
            id,
            name,
            phone_number,
            avatar_url
          ),
          chanels!inner(
            id,
            name,
            type,
            icon_url
          )
        `
        )
        .eq("agent_type", "ai") // Ganti filter ke agent_type
        .eq("agents.created_by", user.value?.id)
        .not("agent_id", "is", null)
        .not("contact_id", "is", null)
        .not("chanel_id", "is", null);

      if (queryError) throw queryError;

      console.log("[useConversationStore] Raw data count:", rawData?.length);

      // Group by unique combinations using Map with strict deduplication
      const conversationMap = new Map();
      const processedKeys = new Set();
      const duplicateKeys = new Set();

      console.log(
        "[useConversationStore] Processing raw data for AI grouping..."
      );

      rawData?.forEach((item, index) => {
        const key = `${item.agent_id}-${item.contact_id}-${item.chanel_id}`;

        // Log every item being processed
        console.log(`[useConversationStore] Processing AI item ${index}:`, {
          key,
          agent_id: item.agent_id,
          contact_id: item.contact_id,
          chanel_id: item.chanel_id,
          agent_name: item.agents?.name,
          contact_name: item.contacts?.name || item.contacts?.phone_number,
          chanel_name: item.chanels?.name,
        });

        if (processedKeys.has(key)) {
          duplicateKeys.add(key);
          console.log(`[useConversationStore] Duplicate key found: ${key}`);
        }
        processedKeys.add(key);

        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            agent_id: item.agent_id,
            contact_id: item.contact_id,
            chanel_id: item.chanel_id,
            agent: item.agents,
            contact: item.contacts,
            chanel: item.chanels,
            messageCount: 0,
            lastActivity: 0,
            messages: [],
          });
          console.log(
            `[useConversationStore] Created new AI group for key: ${key}`
          );
        }

        // Count messages for this group
        const group = conversationMap.get(key);
        group.messageCount++;

        // Update last activity
        const messageTime = new Date(item.created_at || new Date()).getTime();
        if (messageTime > group.lastActivity) {
          group.lastActivity = messageTime;
        }
        // Kumpulkan pesan untuk lastMessage
        if (item.content && item.created_at) {
          group.messages.push({
            content: item.content,
            created_at: item.created_at,
          });
        }
      });

      console.log("[useConversationStore] AI Grouping summary:", {
        totalItems: rawData?.length,
        processedKeys: processedKeys.size,
        duplicateKeys: duplicateKeys.size,
        uniqueGroups: conversationMap.size,
        duplicateKeyList: Array.from(duplicateKeys),
      });

      // Convert map to array and format result
      const result = Array.from(conversationMap.values()).map((group) => {
        // Ambil pesan terakhir (created_at terbaru)
        let lastMessage = "";
        if (group.messages && group.messages.length > 0) {
          group.messages.sort(
            (a, b) =>
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime()
          );
          lastMessage = group.messages[0].content;
        }
        return {
          agent: group.agent,
          contact: group.contact,
          chanel: group.chanel,
          messages: [],
          totalMessages: group.messageCount,
          unreadCount: 0, // TODO: Implement unread count
          lastActivity: group.lastActivity,
          lastMessage,
        };
      });

      // Sort by last activity (newest first)
      result.sort((a, b) => b.lastActivity - a.lastActivity);

      console.log("[useConversationStore] AI conversations grouped:", {
        rawDataCount: rawData?.length,
        uniqueGroups: result.length,
        groups: result.map((r) => ({
          agent_name: r.agent?.name,
          contact_name: r.contact?.name || r.contact?.phone_number,
          chanel_name: r.chanel?.name,
          totalMessages: r.totalMessages,
          lastActivity: new Date(r.lastActivity).toISOString(),
        })),
      });

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
      console.log(
        "[useConversationStore] Starting Human agent conversations fetch..."
      );

      // Use a more efficient query with DISTINCT to get unique combinations
      const { data: rawData, error: queryError } = await supabase
        .from("messages")
        .select(
          `
          agent_id,
          contact_id,
          chanel_id,
          content,
          created_at,
          agents!inner(
            id,
            name,
            type,
            avatar_url,
            created_by
          ),
          contacts!inner(
            id,
            name,
            phone_number,
            avatar_url
          ),
          chanels!inner(
            id,
            name,
            type,
            icon_url
          )
        `
        )
        .eq("agent_type", "manusia") // Ganti filter ke agent_type
        .eq("agents.created_by", user.value?.id)
        .not("agent_id", "is", null)
        .not("contact_id", "is", null)
        .not("chanel_id", "is", null);

      if (queryError) throw queryError;

      console.log(
        "[useConversationStore] Raw Human data count:",
        rawData?.length
      );

      // Group by unique combinations using Map with strict deduplication
      const conversationMap = new Map();
      const processedKeys = new Set();
      const duplicateKeys = new Set();

      console.log(
        "[useConversationStore] Processing raw data for Human grouping..."
      );

      rawData?.forEach((item, index) => {
        const key = `${item.agent_id}-${item.contact_id}-${item.chanel_id}`;

        // Log every item being processed
        console.log(`[useConversationStore] Processing Human item ${index}:`, {
          key,
          agent_id: item.agent_id,
          contact_id: item.contact_id,
          chanel_id: item.chanel_id,
          agent_name: item.agents?.name,
          contact_name: item.contacts?.name || item.contacts?.phone_number,
          chanel_name: item.chanels?.name,
        });

        if (processedKeys.has(key)) {
          duplicateKeys.add(key);
          console.log(`[useConversationStore] Duplicate key found: ${key}`);
        }
        processedKeys.add(key);

        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            agent_id: item.agent_id,
            contact_id: item.contact_id,
            chanel_id: item.chanel_id,
            agent: item.agents,
            contact: item.contacts,
            chanel: item.chanels,
            messageCount: 0,
            lastActivity: 0,
            messages: [],
          });
          console.log(
            `[useConversationStore] Created new Human group for key: ${key}`
          );
        }

        // Count messages for this group
        const group = conversationMap.get(key);
        group.messageCount++;

        // Update last activity
        const messageTime = new Date(item.created_at || new Date()).getTime();
        if (messageTime > group.lastActivity) {
          group.lastActivity = messageTime;
        }
        // Kumpulkan pesan untuk lastMessage
        if (item.content && item.created_at) {
          group.messages.push({
            content: item.content,
            created_at: item.created_at,
          });
        }
      });

      console.log("[useConversationStore] Human Grouping summary:", {
        totalItems: rawData?.length,
        processedKeys: processedKeys.size,
        duplicateKeys: duplicateKeys.size,
        uniqueGroups: conversationMap.size,
        duplicateKeyList: Array.from(duplicateKeys),
      });

      // Convert map to array and format result
      const result = Array.from(conversationMap.values()).map((group) => {
        // Ambil pesan terakhir (created_at terbaru)
        let lastMessage = "";
        if (group.messages && group.messages.length > 0) {
          group.messages.sort(
            (a, b) =>
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime()
          );
          lastMessage = group.messages[0].content;
        }
        return {
          agent: group.agent,
          contact: group.contact,
          chanel: group.chanel,
          messages: [],
          totalMessages: group.messageCount,
          unreadCount: 0, // TODO: Implement unread count
          lastActivity: group.lastActivity,
          lastMessage,
        };
      });

      // Sort by last activity (newest first)
      result.sort((a, b) => b.lastActivity - a.lastActivity);

      console.log("[useConversationStore] Human conversations grouped:", {
        rawDataCount: rawData?.length,
        uniqueGroups: result.length,
        groups: result.map((r) => ({
          agent_name: r.agent?.name,
          contact_name: r.contact?.name || r.contact?.phone_number,
          chanel_name: r.chanel?.name,
          totalMessages: r.totalMessages,
          lastActivity: new Date(r.lastActivity).toISOString(),
        })),
      });

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
        .eq("agent_type", "manusia") // filter by agent_type di tabel messages
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

          console.log("Sending message to WAHA first:", wahaMessageData);

          // Send to WAHA API first
          const wahaResponse = await $fetch(`/api/waha-send-message`, {
            method: "POST",
            body: wahaMessageData,
          });

          if (!wahaResponse || (wahaResponse as any).error) {
            console.error("WAHA API error:", wahaResponse);
            throw new Error(
              (wahaResponse as any)?.message || "Gagal mengirim pesan ke WAHA"
            );
          }

          console.log("Message sent to WAHA successfully:", wahaResponse);
        } catch (wahaError) {
          console.error("Error sending message to WAHA:", wahaError);
          throw new Error(
            wahaError instanceof Error
              ? wahaError.message
              : "Gagal mengirim pesan ke WAHA"
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
