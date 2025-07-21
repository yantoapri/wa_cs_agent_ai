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
  const isBroadcastChatId =
    /^(status|broadcast|system|announcement|newsletter|bulletin|update|maintenance)/i.test(
      chatId.replace("@c.us", "").replace("@g.us", "")
    );

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

export default defineEventHandler(async (event) => {
  console.log("[WAHA Webhook] === START PROCESS ===");
  const body = await readBody(event);
  console.log("[WAHA Webhook] Received body:", JSON.stringify(body, null, 2));

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

  const meId = body?.me?.id?.replace("@c.us", "") || null;
  const payloadBody = body?.payload?.body || null;
  const payloadFrom = body?.payload?.from?.replace("@c.us", "") || null;

  const fromMe = body?.payload?.fromMe || false;
  const isOutgoingFromChanel = fromMe && payloadFrom === meId;

  if (isOutgoingFromChanel) {
    // Handler pesan keluar (sent)
    return await handleSentMessage({
      body,
      client,
      context: event.context,
      runtimeConfig,
      meId,
      payloadFrom,
    });
  } else {
    // Handler pesan masuk (received)
    const takeoverResult = await handleReceivedMessage({
      body,
      client,
      context: event.context,
      runtimeConfig,
      meId,
      payloadFrom,
    });
    if (takeoverResult && takeoverResult.proceed === false) {
      // Masih dalam waktu takeover, abaikan auto-reply
      console.log(
        "[WAHA Webhook] Takeover active, skip auto-reply:",
        takeoverResult
      );
      return takeoverResult;
    }
    // Lanjutkan proses auto-reply seperti biasa (logic AI, dsb)
    // --- PROSES AUTO-REPLY AI ---
    // 1. Cari agentai yang aktif di chanel_agent_connections
    const chanelIdToUse = body?.metadata?.chanel_id || null;
    const { data: conn, error: connErr } = await client
      .from("chanel_agent_connections")
      .select("agent_id")
      .eq("chanel_id", chanelIdToUse)
      .eq("is_active", true)
      .maybeSingle();
    if (connErr || !conn || !conn.agent_id) {
      return {
        status: "ok",
        results: [{ message: "Tidak ada agent aktif di chanel" }],
      };
    }
    // 2. Ambil config agent_ai_configs
    const { data: config, error: configErr } = await client
      .from("agent_ai_configs")
      .select("*")
      .eq("agent_id", conn.agent_id)
      .maybeSingle();
    if (configErr || !config) {
      return {
        status: "ok",
        results: [{ message: "Config agent tidak ditemukan" }],
      };
    }
    // 3. Fetch session name
    const { data: chanelDataPresence } = await client
      .from("chanels")
      .select("session_name")
      .eq("id", chanelIdToUse)
      .maybeSingle();
    const sessionNameForPresence = chanelDataPresence?.session_name;
    // 4. Call AI (openrouter)
    let aiText, images;
    try {
      const aiRes = await $fetch("/api/openrouter", {
        method: "POST",
        body: {
          prompt: payloadBody,
          knowledge: JSON.stringify(config),
        },
      });
      aiText = aiRes?.result;
      images = aiRes?.images;
    } catch (err) {
      return {
        status: "error",
        message: "Gagal memanggil AI",
        detail: err?.message,
      };
    }
    if (!aiText) {
      return {
        status: "ok",
        results: [{ message: "Tidak ada hasil dari AI" }],
      };
    }
    // 5. Kirim ke WhatsApp (WAHA)
    try {
      const messageBody = {
        session: sessionNameForPresence,
        chatId: payloadFrom + "@c.us",
        text: aiText,
        metadata: {
          sender_type: "ai",
          agent_id: conn.agent_id,
          is_auto_reply: true,
        },
      };
      await $fetch(`${WAHA_BASE_URL}/api/sendText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": WAHA_API_KEY,
        },
        body: messageBody,
      });
    } catch (err) {
      return {
        status: "error",
        message: "Gagal kirim pesan ke WAHA",
        detail: err?.message,
      };
    }
    // 6. Simpan pesan AI ke database
    try {
      await $fetch("/api/message", {
        method: "POST",
        body: {
          agent_id: conn.agent_id,
          chanel_id: chanelIdToUse,
          contact_id: null, // Isi sesuai kebutuhan jika ada
          message_type: "text",
          chat_replay: "ai",
          from: payloadFrom,
          to: meId,
          media_url: null,
          content: aiText,
        },
      });
    } catch (err) {
      return {
        status: "error",
        message: "Gagal simpan pesan AI ke database",
        detail: err?.message,
      };
    }
    return {
      status: "ok",
      takeover: takeoverResult.takeover,
      proceed: true,
      message: "Auto-reply AI sent and saved",
    };
  }
});
