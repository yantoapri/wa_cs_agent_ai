import { createClient } from "@supabase/supabase-js";
import {
  handleReceivedMessage,
  handleSentMessage,
} from "./waha-webhook-handler";

// Function to check if the event is a broadcast event from WAHA
function checkBroadcastEvent(body) {
  // Check for broadcast message patterns
  const payloadBody = body?.payload?.body || "";
  const payloadFrom = body?.payload?.from || "";
  const eventType = body?.event || "";
  const chatId = body?.payload?.chatId || "";
  const isGroup = body?.payload?.isGroup || false;
  const isBroadcast = body?.payload?.isBroadcast || false;

  // Common broadcast patterns in message body
  const broadcastPatterns = [
    /^broadcast/i,
    /^siaran/i,
    /^announcement/i,
    /^pengumuman/i,
    /^notifikasi/i,
    /^notification/i,
    /^system message/i,
    /^pesan sistem/i,
    /^status broadcast/i,
    /^broadcast status/i,
    /^newsletter/i,
    /^news letter/i,
    /^bulletin/i,
    /^update sistem/i,
    /^system update/i,
    /^maintenance/i,
    /^pemeliharaan/i,
  ];

  // Check if message body contains broadcast patterns
  const isBroadcastMessage = broadcastPatterns.some((pattern) =>
    pattern.test(payloadBody)
  );

  // Check for broadcast-specific event types
  const isBroadcastEventType = [
    "broadcast",
    "broadcast_message",
    "system_broadcast",
    "announcement",
    "newsletter",
    "bulletin",
    "system_update",
    "maintenance",
  ].includes(eventType);

  // Check for broadcast-specific from patterns (system numbers, broadcast numbers)
  const isBroadcastFrom =
    /^(status|broadcast|system|announcement|newsletter|bulletin|update|maintenance)/i.test(
      payloadFrom
    );

  // Check for broadcast-specific chatId patterns
  const isBroadcastChatId = chatId ?
    /^(status|broadcast|system|announcement|newsletter|bulletin|update|maintenance)/i.test(
      chatId.replace("@c.us", "").replace("@g.us", "")
    ) : false;

  // Check for empty or system-like content
  const isSystemContent =
    !payloadBody ||
    payloadBody.trim().length === 0 ||
    /^(status|broadcast|system|announcement|newsletter|bulletin|update|maintenance)/i.test(
      payloadBody
    );

  // Check for group messages that might be broadcasts
  const isGroupBroadcast =
    isGroup &&
    (isBroadcastMessage ||
      isBroadcastEventType ||
      isBroadcastFrom ||
      chatId.includes("broadcast") ||
      chatId.includes("newsletter") ||
      chatId.includes("announcement"));

  // Check for explicit broadcast flag
  const isExplicitBroadcast =
    isBroadcast ||
    chatId.includes("broadcast") ||
    chatId.includes("newsletter") ||
    chatId.includes("announcement");

  console.log("[WAHA Webhook] Enhanced broadcast check:", {
    payloadBody: payloadBody.substring(0, 50) + "...",
    payloadFrom,
    chatId,
    eventType,
    isGroup,
    isBroadcast,
    isBroadcastMessage,
    isBroadcastEventType,
    isBroadcastFrom,
    isBroadcastChatId,
    isSystemContent,
    isGroupBroadcast,
    isExplicitBroadcast,
  });

  return (
    isBroadcastMessage ||
    isBroadcastEventType ||
    isBroadcastFrom ||
    isBroadcastChatId ||
    isSystemContent ||
    isGroupBroadcast ||
    isExplicitBroadcast
  );
}

// Function to check if the message is from our broadcast system
function isFromBroadcastSystem(body) {
  const metadata = body?.payload?.metadata || body?.metadata || {};
  const isBroadcast = metadata.is_broadcast === true;
  const senderType = metadata.sender_type;
  const messageType = metadata.message_type;
  const isManualBroadcast = metadata.is_manual_broadcast === "1";
  const isAutoMessage = metadata.is_auto_message === "1";
  const isScheduledMessage = metadata.is_scheduled_message === "1";

  const result =
    isBroadcast ||
    senderType === "broadcast" ||
    messageType === "broadcast" ||
    isManualBroadcast ||
    senderType === "auto_message" ||
    isAutoMessage ||
    messageType === "scheduled" ||
    isScheduledMessage;

  console.log("[WAHA Webhook] Broadcast system check:", {
    metadata,
    isBroadcast,
    senderType,
    messageType,
    isManualBroadcast,
    isAutoMessage,
    isScheduledMessage,
    isFromBroadcast: result,
    bodyKeys: Object.keys(body || {}),
    payloadKeys: Object.keys(body?.payload || {}),
    metadataKeys: Object.keys(metadata),
  });

  return result;
}

// Function to check if the event is message-related (send/receive)
function isMessageEvent(body) {
  const eventType = body?.event || "";
  const payload = body?.payload || {};

  // Message-related event types
  const messageEventTypes = [
    "message",
    "message_create",
    "message_received",
    "message_sent",
    "text",
    "image",
    "video",
    "audio",
    "document",
    "location",
    "contact",
    "sticker",
  ];

  // Check if event type is message-related
  if (messageEventTypes.includes(eventType)) {
    return true;
  }

  // Check if payload has message-related fields
  const hasMessageFields = payload.body || payload.text || payload.content;
  const hasFromField = payload.from;
  const hasToField = payload.to || payload.chatId;

  // Check if this is a message event by presence of message fields
  if (hasMessageFields && (hasFromField || hasToField)) {
    return true;
  }

  // Check for specific non-message events to ignore
  const nonMessageEvents = [
    "chat_clear",
    "chat_clear_messages",
    "chat_delete",
    "chat_archive",
    "chat_unarchive",
    "chat_pin",
    "chat_unpin",
    "chat_mute",
    "chat_unmute",
    "chat_read",
    "chat_unread",
    "presence",
    "typing",
    "recording",
    "paused",
    "resumed",
    "stopped",
    "connection",
    "disconnection",
    "session",
    "session_create",
    "session_delete",
    "session_update",
    "qr",
    "qr_received",
    "qr_refresh",
    "ready",
    "loading",
    "authenticated",
    "auth_failure",
    "logout",
    "logout_success",
    "logout_failure",
    "media_upload",
    "media_download",
    "webhook",
    "webhook_received",
    "webhook_sent",
  ];

  if (nonMessageEvents.includes(eventType)) {
    return false;
  }

  // Default: if we can't determine, assume it's not message-related
  return false;
}

// === AI Outgoing Message Cache ===
const aiOutgoingCache = globalThis.__aiOutgoingCache || new Map();
globalThis.__aiOutgoingCache = aiOutgoingCache;
const AI_CACHE_TTL = 2 * 60 * 1000; // 2 menit

function cacheAIMsg(to, content) {
  if (!to || !content) return;
  aiOutgoingCache.set(`${to}|${content}`, Date.now());
}
function isRecentAIMsg(to, content) {
  if (!to || !content) return false;
  const key = `${to}|${content}`;
  const ts = aiOutgoingCache.get(key);
  if (ts && Date.now() - ts < AI_CACHE_TTL) return true;
  return false;
}
function cleanupAICache() {
  const now = Date.now();
  for (const [key, ts] of aiOutgoingCache.entries()) {
    if (now - ts > AI_CACHE_TTL) aiOutgoingCache.delete(key);
  }
}

function logAICache() {
  console.log("[WAHA Webhook] AI Cache contents:");
  for (const [key, ts] of aiOutgoingCache.entries()) {
    console.log(`  ${key}: ${new Date(ts).toISOString()}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default defineEventHandler(async (event) => {
  cleanupAICache();
  console.log("[WAHA Webhook] === START PROCESS ===");
  const body = await readBody(event);
  console.log("[WAHA Webhook] Received body:", body);

  // Skip processing if not a message event
  if (!isMessageEvent(body)) {
    console.log("[WAHA Webhook] Skipping non-message event");
    return { status: "skipped", message: "Non-message event" };
  }

  let usersData = null;
  const userId = body?.metadata?.i;
  console.log("[WAHA Webhook] User ID from metadata:", userId);
  
  if (userId && typeof userId === 'string' && userId.length > 0) {
    try {
      const res= await $fetch("/api/user", {
        method: "GET",
        query: { id: userId },
      });
      usersData =res.data
    } catch (err) {
      console.log("[WAHA Webhook] Error fetching user data:", err);
    }
  } else {
    console.log("[WAHA Webhook] No valid user ID found, skipping user data fetch");
  }
  console.log("[WAHA Webhook] User data:", usersData);
  
  // Check subscription expiry - if expired, skip processing
  if (usersData && usersData.package && usersData.package.end_at) {
    const now = new Date();
    const endDate = new Date(usersData.package.end_at);
    
    if (now >= endDate) {
      console.log("[WAHA Webhook] Subscription expired, skipping processing:", {
        userId,
        endDate: usersData.package.end_at,
        currentDate: now.toISOString(),
        packageName: usersData.package.name || 'Unknown'
      });
      return {
        status: "subscription_expired",
        message: "Masa berlangganan sudah habis",
        end_date: usersData.package.end_at,
        current_date: now.toISOString()
      };
    }
    
    console.log("[WAHA Webhook] Subscription is active:", {
      userId,
      endDate: usersData.package.end_at,
      packageName: usersData.package.name || 'Unknown'
    });
  }
  
  // Check if this is a group message and ignore it
  const isGroup = body?.payload?.isGroup || false;
  const chatId = body?.payload?.chatId || "";
  const isGroupMessage = isGroup || chatId.includes("@g.us");
  
  if (isGroupMessage) {
    console.log(
      "[WAHA Webhook] Ignoring group message:",
      {
        chatId,
        isGroup,
        from: body?.payload?.from,
        body: body?.payload?.body?.substring(0, 50) + "..."
      }
    );
    return {
      status: "ok",
      message: "Event ignored - group message",
      event_type: body?.event || "unknown",
      chat_id: chatId
    };
  }
  
  // Check if this is a broadcast event
  // Check broadcast events after confirming it's a message event
  if (checkBroadcastEvent(body)) {
    console.log(
      "[WAHA Webhook] Ignoring broadcast event:",
      body?.event || "unknown"
    );
    return {
      status: "ok",
      message: "Event ignored - broadcast event",
      event_type: body?.event || "unknown",
    };
  }

  // Check if this is a message-related event
  if (!isMessageEvent(body)) {
    console.log(
      "[WAHA Webhook] Ignoring non-message event:",
      body?.event || "unknown"
    );
    return {
      status: "ok",
      message: "Event ignored - not a message event",
      event_type: body?.event || "unknown",
    };
  }

  // Check if the message is from our broadcast system
  const isBroadcastSystem = isFromBroadcastSystem(body);
  console.log(
    "[WAHA Webhook] Broadcast system check result:",
    isBroadcastSystem
  );

  if (isBroadcastSystem) {
    console.log(
      "[WAHA Webhook] Ignoring message from broadcast system:",
      body?.payload?.body || "unknown"
    );
    return {
      status: "ok",
      message: "Event ignored - message from broadcast system",
      event_type: body?.event || "unknown",
    };
  }

  const runtimeConfig = useRuntimeConfig();
  const WAHA_BASE_URL = runtimeConfig.wahaBaseUrl;
  const WAHA_API_KEY = runtimeConfig.wahaApiKey;
  console.log("[WAHA Webhook] Config loaded - WAHA_BASE_URL:", WAHA_BASE_URL);

  // Buat Supabase client dengan service role key
  const client = createClient(
    runtimeConfig.public.supabaseUrl,
    runtimeConfig.supabaseServiceRoleKey
  );
  console.log("[WAHA Webhook] Supabase client created");

  // Normalisasi nomor WA (hilangkan +, 0 di depan, dsb)
  function normalizePhone(num) {
    if (!num) return "";
    return num.replace(/^\+?0?/, "").replace(/[^0-9]/g, "");
  }
  const rawMeId = body?.me?.id || "";
  const rawPayloadFrom = body?.payload?.from || "";
  const meId = rawMeId ? normalizePhone(rawMeId.replace("@c.us", "")) : "";
  const payloadFrom = rawPayloadFrom ? normalizePhone(rawPayloadFrom.replace("@c.us", "")) : "";
  const payloadBody = body?.payload?.body || null;
  const fromMe = body?.payload?.fromMe || false;

  const isOutgoing = fromMe; // ubah: outgoing cukup cek fromMe
  const isIncomingUserMessage = !fromMe && payloadFrom !== meId;

  console.log("[WAHA Webhook] Branch check", {
    fromMe,
    rawMeId,
    rawPayloadFrom,
    meId,
    payloadFrom,
    isOutgoing,
    isIncomingUserMessage,
    metadata: body?.payload?.metadata,
    event: body?.event,
    payload: {
      body: body?.payload?.body,
      text: body?.payload?.text,
      from: body?.payload?.from,
      to: body?.payload?.to,
      chatId: body?.payload?.chatId,
    },
  });

  if (isOutgoing) {
    // Cek apakah pesan outgoing ini baru saja dikirim oleh AI
    const outgoingContent = body?.payload?.body || body?.payload?.text || null;
    const outgoingTo = body?.payload?.to ? 
      normalizePhone(body.payload.to.replace("@c.us", "")) : 
      "";
    // Cek metadata sender_type: ai
    const metaSenderType =
      body?.metadata?.sender_type || body?.metadata?.sender_type;

    console.log("[WAHA Webhook] Outgoing AI detection:", {
      outgoingTo,
      outgoingContent,
      metaSenderType,
      isRecentAI: isRecentAIMsg(outgoingTo, outgoingContent),
    });
    logAICache();

    // Cek apakah ini adalah pesan broadcast dari sistem kita
    if (isFromBroadcastSystem(body)) {
      console.log(
        "[WAHA Webhook] Outgoing message detected as broadcast (skip processing)",
        { outgoingTo, outgoingContent }
      );
      return {
        status: "ok",
        message: "Broadcast outgoing message detected (skip processing)",
      };
    }

    // Cek apakah ini adalah pesan AI yang baru saja dikirim
    if (metaSenderType === "ai" || isRecentAIMsg(outgoingTo, outgoingContent)) {
      console.log(
        "[WAHA Webhook] Outgoing message detected as AI (skip manual save)",
        { outgoingTo, outgoingContent }
      );
      // Cache pesan AI untuk mencegah deteksi sebagai pesan manual
      if (metaSenderType === "ai") {
        cacheAIMsg(outgoingTo, outgoingContent);
      }
      return {
        status: "ok",
        message: "AI outgoing message detected (not saved as manual)",
      };
    }

    // Cek apakah pesan ini sudah disimpan sebagai AI di database
    // Jika ya, skip penyimpanan manual
    try {
      const { data: existingMessage } = await client
        .from("messages")
        .select("id, agent_type, content, created_at")
        .eq("from", meId)
        .eq("to", outgoingTo)
        .eq("content", outgoingContent)
        .eq("agent_type", "ai")
        .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5 menit terakhir
        .maybeSingle();

      if (existingMessage) {
        console.log(
          "[WAHA Webhook] Outgoing message already saved as AI (skip manual save)",
          {
            messageId: existingMessage.id,
            content: existingMessage.content,
            created_at: existingMessage.created_at,
          }
        );
        return {
          status: "ok",
          message: "Message already saved as AI (skip manual save)",
        };
      }

      // Cek juga apakah ada pesan dengan content yang sama dalam 1 menit terakhir
      const { data: recentMessages } = await client
        .from("messages")
        .select("id, agent_type, content, created_at")
        .eq("content", outgoingContent)
        .gte("created_at", new Date(Date.now() - 1 * 60 * 1000).toISOString()) // 1 menit terakhir
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentMessages && recentMessages.length > 0) {
        console.log(
          "[WAHA Webhook] Found recent messages with same content:",
          recentMessages.map((m) => ({
            id: m.id,
            agent_type: m.agent_type,
            content: m.content,
            created_at: m.created_at,
          }))
        );

        // Jika ada pesan AI dengan content yang sama, skip penyimpanan manual
        const hasAIMessage = recentMessages.some((m) => m.agent_type === "ai");
        if (hasAIMessage) {
          console.log(
            "[WAHA Webhook] Recent AI message with same content found (skip manual save)"
          );
          return {
            status: "ok",
            message:
              "Recent AI message with same content found (skip manual save)",
          };
        }
      }
    } catch (err) {
      console.log("[WAHA Webhook] Error checking existing AI message:", err);
    }

    // Jika ini outgoing AI (dari proses auto-reply), cache pesan
    if (metaSenderType === "ai") {
      cacheAIMsg(outgoingTo, outgoingContent);
    }
    // Lanjutkan ke handler manual jika bukan AI
    console.log("[WAHA Webhook] Detected outgoing message (fromMe true)");
    const sentResult = await handleSentMessage({
      body,
      client,
      context: event.context,
      runtimeConfig,
      meId,
      payloadFrom,
    });
    console.log("[WAHA Webhook] Sent message handler result:", sentResult);
    return sentResult;
  } else if (isIncomingUserMessage) {
    console.log("[WAHA Webhook] Detected incoming message (user to chanel)");

    // Cek apakah ini adalah pesan yang baru saja dikirim oleh AI
    const incomingContent = body?.payload?.body || body?.payload?.text || null;
    const incomingFrom = payloadFrom;
    const incomingTo = meId;

    // Cek metadata untuk sender_type: ai
    const metaSenderType =
      body?.metadata?.sender_type || body?.metadata?.sender_type;

    console.log("[WAHA Webhook] AI detection check:", {
      incomingFrom,
      incomingContent,
      metaSenderType,
      isRecentAI: isRecentAIMsg(incomingFrom, incomingContent),
      metadata: body?.payload?.metadata,
      cacheKey: `${incomingFrom}|${incomingContent}`,
      cacheSize: aiOutgoingCache.size,
    });
    logAICache();

    // Cek apakah ini adalah pesan broadcast dari sistem kita
    if (isFromBroadcastSystem(body)) {
      console.log(
        "[WAHA Webhook] Incoming message detected as broadcast (skip processing)",
        { incomingFrom, incomingContent }
      );
      return {
        status: "ok",
        message: "Broadcast incoming message detected (skip processing)",
      };
    }

    // Cek apakah pesan ini adalah hasil dari AI yang baru saja mengirim
    if (
      metaSenderType === "ai" ||
      isRecentAIMsg(incomingFrom, incomingContent)
    ) {
      console.log(
        "[WAHA Webhook] Incoming message detected as AI response (skip processing)",
        { incomingFrom, incomingContent, metaSenderType }
      );
      return {
        status: "ok",
        message: "AI response message detected (skip processing)",
      };
    }

    // Cek apakah ada pesan AI dengan content yang sama dalam 1 menit terakhir
    try {
      const { data: recentAIMessages } = await client
        .from("messages")
        .select("id, agent_type, content, created_at")
        .eq("content", incomingContent)
        .eq("agent_type", "ai")
        .gte("created_at", new Date(Date.now() - 1 * 60 * 1000).toISOString()) // 1 menit terakhir
        .order("created_at", { ascending: false })
        .limit(3);

      if (recentAIMessages && recentAIMessages.length > 0) {
        console.log(
          "[WAHA Webhook] Found recent AI messages with same content:",
          recentAIMessages.map((m) => ({
            id: m.id,
            content: m.content,
            created_at: m.created_at,
          }))
        );

        // Jika ada pesan AI dengan content yang sama dalam 1 menit terakhir, skip processing
        console.log(
          "[WAHA Webhook] Recent AI message with same content found (skip processing)"
        );
        return {
          status: "ok",
          message:
            "Recent AI message with same content found (skip processing)",
        };
      }
    } catch (err) {
      console.log("[WAHA Webhook] Error checking recent AI messages:", err);
    }

    // --- Pindahkan blok pencarian/insert contact ke sini ---
    let contact_id = null;
    try {
      console.log("[WAHA Webhook] Checking/creating contact for:", payloadFrom);
      const contactRes = await $fetch("/api/contact", {
        method: "GET",
        query: { phone_number: payloadFrom,created_by: body?.metadata?.i },
      });
      console.log("[WAHA Webhook] Contact search result:", contactRes);
      if (contactRes.found) {
        contact_id = contactRes.data.id;
        console.log("[WAHA Webhook] Existing contact found, ID:", contact_id);
      } else {
        const createRes = await $fetch("/api/contact", {
          method: "POST",
          body: {
            name: payloadFrom,
            phone_number: payloadFrom,
            created_by: body?.metadata?.i,
          },
        });
        if (createRes && createRes.data && createRes.data.id) {
          contact_id = createRes.data.id;
          console.log("[WAHA Webhook] New contact created, ID:", contact_id);
        } else {
          console.log("[WAHA Webhook] Failed to create contact");
        }
      }
    } catch (err) {
      console.log("[WAHA Webhook] Error cek/tambah contact", err);
    }
    // --- Setelah dapat contact_id, baru cek takeover ---
    // Cari agent manusia yang sesuai dengan channel (meId)
    let agentManusiaId = null;
    try {
      const { data: agentData, error: agentErr } = await client
        .from("agents")
        .select("id")
        .eq("type", "manusia")
        .eq("phone", meId)
        .eq("created_by", userId)
        .maybeSingle();
      if (agentData && agentData.id) {
        agentManusiaId = agentData.id;
      } else {
        console.log(
          "[WAHA Webhook] Agent manusia tidak ditemukan untuk phone:",
          meId
        );
      }
    } catch (e) {
      console.log("[WAHA Webhook] Error mencari agent manusia:", e.message);
    }

    const takeoverResult = await handleReceivedMessage({
      body,
      client,
      context: event.context,
      runtimeConfig,
      meId,
      payloadFrom,
      contactId: contact_id,
    });
    console.log("[WAHA Webhook] Takeover handler result:", takeoverResult);
    
    // Use contact_id from takeover result if available
    if (takeoverResult && takeoverResult.contact_id) {
      contact_id = takeoverResult.contact_id;
    }
    
    // === Tentukan agent_type dan agent_id yang sesuai berdasarkan sessionType ===
    let saveAgentType = "manusia";
    let saveAgentId = agentManusiaId; // default ke agent manusia
    const chanelIdToUse = body?.metadata?.chanel_id || null; // Definisikan di awal

    if (takeoverResult && takeoverResult.takeover === false) {
      // takeover_ai = false, selalu manusia
      saveAgentType = "manusia";
      saveAgentId = agentManusiaId;
    } else if (takeoverResult && takeoverResult.takeover === true) {
      // Gunakan sessionType dari handler untuk konsistensi
      const sessionType = takeoverResult.sessionType || "manusia";

      if (sessionType === "ai") {
        // Session AI - cari agent AI yang aktif
        saveAgentType = "ai";
        if (chanelIdToUse) {
          const { data: conn, error: connErr } = await client
            .from("chanel_agent_connections")
            .select("agent_id")
            .eq("chanel_id", chanelIdToUse)
            .eq("is_active", true)
            .maybeSingle();
          if (!connErr && conn && conn.agent_id) {
            saveAgentId = conn.agent_id;
            console.log("[WAHA Webhook] Using AI agent ID:", saveAgentId);
          } else {
            console.log(
              "[WAHA Webhook] No active AI agent found, using human agent"
            );
            saveAgentType = "manusia";
            saveAgentId = agentManusiaId;
          }
        }
      } else {
        // Session manusia
        saveAgentType = "manusia";
        saveAgentId = agentManusiaId;
      }
    }

    console.log("[WAHA Webhook] Agent decision:", {
      saveAgentType,
      saveAgentId,
      takeover: takeoverResult?.takeover,
      proceed: takeoverResult?.proceed,
    });

    // Simpan pesan masuk ke database, CEGAH DUPLIKASI BERDASARKAN wa_message_id
    try {
      const waMessageId = body?.payload?.id || body?.payload?.key?.id || null;
      if (!waMessageId) {
        console.warn("[WAHA Webhook] Tidak ada wa_message_id pada payload, tetap lanjut simpan.");
      } else {
        // Cek duplikasi
        const { data: existingMsg } = await client
          .from("messages")
          .select("id, wa_message_id")
          .eq("wa_message_id", waMessageId)
          .maybeSingle();
        if (existingMsg && existingMsg.id) {
          console.log("[WAHA Webhook] Pesan sudah ada di database, skip simpan.", existingMsg);
          return { status: "ok", message: "Pesan sudah ada di database, skip simpan." };
        }
      }
      const saveData = {
        agent_id: saveAgentId,
        chanel_id: body?.metadata?.chanel_id || null,
        contact_id: contact_id,
        message_type: "text",
        agent_type: saveAgentType,
        from: payloadFrom,
        to: meId,
        media_url:body?.payload?.mediaUrl || null,
        content: payloadBody,
        created_by: body?.metadata?.i,
        wa_message_id: body?.payload?.id || body?.payload?.key?.id || null,
      };
      console.log(
        "[WAHA Webhook] Saving incoming message to database:",
        saveData
      );
      const saveResult = await $fetch("/api/message", {
        method: "POST",
        body: saveData,
      });
      console.log(
        "[WAHA Webhook] Incoming message saved to database",
        saveResult
      );
    } catch (err) {
      console.log(
        "[WAHA Webhook] Error saving incoming message to database:",
        err
      );
    }

    // === Jika sessionType=ai dan proceed=true, lanjutkan auto-reply AI ===
    if (
      !takeoverResult ||
      takeoverResult.takeover === false ||
      takeoverResult.proceed !== true ||
      takeoverResult.sessionType !== "ai"
    ) {
      // Tidak perlu auto-reply AI jika:
      // - takeover_ai = false
      // - masih dalam waktu takeover (proceed = false)
      // - sessionType bukan "ai"
      console.log("[WAHA Webhook] Not proceeding with AI reply:", {
        takeover: takeoverResult?.takeover,
        proceed: takeoverResult?.proceed,
        sessionType: takeoverResult?.sessionType,
      });
      return takeoverResult;
    }

    // Gunakan saveAgentId yang sudah ditentukan sebelumnya
    if (saveAgentType !== "ai" || !saveAgentId) {
      console.log(
        "[WAHA Webhook] Not proceeding with AI reply - agent type:",
        saveAgentType
      );
      return takeoverResult;
    }

    // 2. Ambil config agent_ai_configs
    console.log("[WAHA Webhook] Fetching AI config for agent:", saveAgentId);
    const { data: config, error: configErr } = await client
      .from("agent_ai_configs")
      .select("*")
      .eq("agent_id", saveAgentId)
      .maybeSingle();
    console.log("[WAHA Webhook] AI config result:", { config, configErr });
    if (configErr || !config) {
      console.log("[WAHA Webhook] Config agent tidak ditemukan");
      return {
        status: "ok",
        results: [{ message: "Config agent tidak ditemukan" }],
      };
    }
    // 3. Fetch session name
    console.log("[WAHA Webhook] Fetching session name for presence");
    const { data: chanelDataPresence } = await client
      .from("chanels")
      .select("session_name,whatsapp_number,created_by")
      .eq("id", chanelIdToUse)
      .maybeSingle();
    const sessionNameForPresence = chanelDataPresence?.session_name;
    console.log(
      "[WAHA Webhook] Session name for presence:",
      sessionNameForPresence
    );

    const { data: countData, error: countError } = await client.from("messages")
      .select('*', { count: 'exact', head: true })
      .eq("chanel_id", chanelIdToUse)
      .eq("agent_type", "ai")
      .eq("from", chanelDataPresence.whatsapp_number);
    const countMessages = countData?.length || 0;
    if(usersData&&usersData.package.limit_ai<=countMessages){
      console.log("[WAHA Webhook] Limit AI reached, not proceeding with AI reply");
      return;
    }
    // 4. Call AI (openrouter)
    let aiText, images;
    try {
      console.log(
        "[WAHA Webhook] Calling AI service with prompt:",
        payloadBody
      );
      const aiRes = await $fetch("/api/openrouter", {
        method: "POST",
        body: {
          prompt: payloadBody,
          knowledge: JSON.stringify(config),
          from:payloadFrom,
          to:meId
        },
      });
      aiText = aiRes?.result;
      images = aiRes?.images;
      console.log("[WAHA Webhook] AI response received:", { aiText, images });
    } catch (err) {
      console.log("[WAHA Webhook] Error calling AI:", err);
      return {
        status: "error",
        message: "Gagal memanggil AI",
        detail: err?.message,
      };
    }
    if (!aiText) {
      console.log("[WAHA Webhook] No AI result");
      return {
        status: "ok",
        results: [{ message: "Tidak ada hasil dari AI" }],
      };
    }
    // Simpan prompt user ke database sebelum proses AI
    try {
      const userPromptData = {
        agent_id: saveAgentId,
        chanel_id: body?.metadata?.chanel_id || null,
        contact_id,
        message_type: "text",
        agent_type: "ai",
        from: payloadFrom,
        to: meId,
        media_url: null,
        content: payloadBody,
        created_by: body?.metadata?.i,
      };
      console.log(
        "[WAHA Webhook] Saving user prompt to database:",
        userPromptData
      );
      const userPromptResult = await $fetch("/api/message", {
        method: "POST",
        body: userPromptData,
      });
      console.log(
        "[WAHA Webhook] User prompt saved to database",
        userPromptResult
      );
    } catch (err) {
      console.log("[WAHA Webhook] Error saving user prompt to database:", err);
    }
    // --- Efek typing sebelum kirim pesan ---
    try {
      if (sessionNameForPresence) {
        const typingBody = {
          chatId: payloadFrom + "@c.us",
          presence: "typing",
        };
        console.log("[WAHA Webhook] Sending typing presence:", typingBody);
        await $fetch(
          `${WAHA_BASE_URL}/api/${sessionNameForPresence}/presence`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": WAHA_API_KEY,
            },
            body: typingBody,
          }
        );
        console.log("[WAHA Webhook] Typing presence sent successfully");
        // Hitung durasi efek typing
        let typingMs = 0;
        if (aiText) {
          typingMs += Math.min(aiText.length * 50, 10000); // 50ms per karakter, max 10 detik
        }
        if (images && images.length > 0) {
          typingMs += 2000; // Tambah 2 detik jika ada media
        }
        if (typingMs > 0) {
          console.log(`[WAHA Webhook] Typing effect sleep for ${typingMs} ms`);
          await sleep(typingMs);
        }
      }
    } catch (err) {
      console.log("[WAHA Webhook] Error sending typing presence:", err);
    }
    // --- Baru setelah ini lakukan if (images && images.length > 0) { ... } else { ... } ---
    if (images && images.length > 0) {
      console.log("[WAHA Webhook] Sending image message(s)");
      for (const imgUrl of images) {
        console.log("[WAHA Webhook] Processing image:", imgUrl);
        // Ambil mimetype dan filename dari url
        let mimetype = "image/jpeg";
        let filename = "filename.jpg";
        const extMatch = imgUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        if (extMatch) {
          const ext = extMatch[1].toLowerCase();
          if (ext === "png") mimetype = "image/png";
          else if (ext === "webp") mimetype = "image/webp";
          else if (ext === "gif") mimetype = "image/gif";
          else if (ext === "jpg" || ext === "jpeg") mimetype = "image/jpeg";
          filename = `filename.${ext}`;
        }
        const messageBody = {
          session: sessionNameForPresence,
          chatId: payloadFrom + "@c.us",
          file: {
            mimetype,
            url: imgUrl,
            filename,
          },
          caption: aiText,
          metadata: {
            sender_type: "ai",
            agent_id: saveAgentId,
            is_auto_reply: true,
          },
        };
        console.log("[WAHA Webhook] Image message body:", messageBody);
        try {
          await $fetch(`${WAHA_BASE_URL}/api/sendImage`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": WAHA_API_KEY,
            },
            body: messageBody,
          });
          console.log("[WAHA Webhook] Image sent successfully via WAHA");

          // Cache pesan AI untuk mencegah deteksi sebagai pesan manual
          // Cache dengan format: dari AI ke user
          cacheAIMsg(payloadFrom, aiText);
          console.log("[WAHA Webhook] AI image message cached:", {
            to: payloadFrom,
            content: aiText,
            cacheKey: `${payloadFrom}|${aiText}`,
          });

          // Simpan pesan AI (image) ke database
          const saveData = {
            agent_id: saveAgentId,
            chanel_id: body?.metadata?.chanel_id || null,
            contact_id,
            message_type: "image",
            agent_type: "ai",
            from: meId,
            to: payloadFrom,
            media_url: imgUrl,
            content: aiText, // caption dari AI
            created_by: body?.metadata?.i,
          };
          console.log(
            "[WAHA Webhook] Saving AI image message to database:",
            saveData
          );
          const saveResult = await $fetch("/api/message", {
            method: "POST",
            body: saveData,
          });
          console.log(
            "[WAHA Webhook] AI image message saved to database",
            saveResult
          );
        } catch (err) {
          console.log("[WAHA Webhook] Error sending/saving image:", err);
          return {
            status: "error",
            message: "Gagal kirim/simpan image AI",
            detail: err?.message,
          };
        }
      }
    } else {
      // Kirim text saja ke /api/sendText jika tidak ada gambar
      try {
        const messageBody = {
          session: sessionNameForPresence,
          chatId: payloadFrom + "@c.us",
          text: aiText,
          metadata: {
            sender_type: "ai",
            agent_id: saveAgentId,
            is_auto_reply: true,
          },
        };
        console.log("[WAHA Webhook] Sending text to WAHA:", messageBody);
        await $fetch(`${WAHA_BASE_URL}/api/sendText`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": WAHA_API_KEY,
          },
          body: messageBody,
        });
        console.log("[WAHA Webhook] Text sent successfully via WAHA");

        // Cache pesan AI untuk mencegah deteksi sebagai pesan manual
        // Cache dengan format: dari AI ke user
        cacheAIMsg(payloadFrom, aiText);
        console.log("[WAHA Webhook] AI message cached:", {
          to: payloadFrom,
          content: aiText,
          cacheKey: `${payloadFrom}|${aiText}`,
        });

        // Simpan pesan AI ke database
        const saveData = {
          agent_id: saveAgentId,
          chanel_id: body?.metadata?.chanel_id || null,
          contact_id,
          message_type: "text",
          agent_type: "ai",
          from: meId,
          to: payloadFrom,
          media_url: null,
          content: aiText,
          created_by: body?.metadata?.i,
        };
        console.log("[WAHA Webhook] Saving AI message to database:", saveData);
        const saveResult = await $fetch("/api/message", {
          method: "POST",
          body: saveData,
        });
        console.log("[WAHA Webhook] AI message saved to database", saveResult);
      } catch (err) {
        console.log("[WAHA Webhook] Error sending/saving text:", err);
        return {
          status: "error",
          message: "Gagal kirim/simpan pesan AI",
          detail: err?.message,
        };
      }
    }
    console.log("[WAHA Webhook] === AUTO-REPLY AI PROCESS END ===");
    const result = {
      status: "ok",
      takeover: takeoverResult.takeover,
      proceed: true,
      message: "Auto-reply AI sent and saved",
    };
    console.log("[WAHA Webhook] Final return:", result);
    return result;
  } else {
    console.log(
      "[WAHA Webhook] Message ignored (not incoming user message, not outgoing)",
      {
        fromMe,
        payloadFrom,
        meId,
      }
    );
    return {
      status: "ok",
      message: "Message ignored (not incoming user message, not outgoing)",
    };
  }
});
