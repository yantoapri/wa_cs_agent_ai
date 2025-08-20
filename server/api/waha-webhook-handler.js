// server/api/waha-webhook-handler.js
// Handler terpisah untuk event pesan masuk (received) dan pesan keluar (sent)

/**
 * Handler untuk pesan masuk dari user (received message)
 * @param {object} params - { body, client, context, ... }
 * @returns {Promise<object>} hasil proses
 */
export async function handleReceivedMessage({
  body,
  client,
  context,
  runtimeConfig,
  meId,
  payloadFrom,
  contactId, // Tambah contactId
  ...rest
}) {
  // Ambil chanel_id dari metadata/body
  const chanelId = body?.metadata?.chanel_id || body?.chanel_id || null;
  if (!chanelId) {
    return { status: "error", message: "chanel_id tidak ditemukan" };
  }

  // Ambil data takeover_ai dan waktu_takeover dari tabel chanels
  const { data: chanelData, error: chanelErr } = await client
    .from("chanels")
    .select("takeover_ai, waktu_takeover")
    .eq("id", chanelId)
    .maybeSingle();
  if (chanelErr || !chanelData) {
    return { status: "error", message: "Gagal ambil data chanel" };
  }
  const takeoverAI = chanelData.takeover_ai;
  const waktuTakeover = chanelData.waktu_takeover || 0;

  if (!takeoverAI) {
    // Tidak ada takeover, lanjutkan auto-reply
    return { status: "ok", takeover: false, proceed: true };
  }

  // === LOGIKA SESSION KONSISTEN ===
  // Cek pesan terakhir dari chanel & contact ini (baik AI atau manusia)
  let lastMessage = null;
  if (contactId) {
    const res = await client
      .from("messages")
      .select("created_at, agent_type, from")
      .eq("chanel_id", chanelId)
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    lastMessage = res.data;
  }

  console.log("[WAHA Handler] Last message analysis:", {
    lastMessage,
    contactId,
    chanelId,
    takeoverAI,
    waktuTakeover,
  });

  if (!lastMessage) {
    // Tidak ada pesan sama sekali, mulai dengan AI
    console.log("[WAHA Handler] No previous messages, starting with AI");
    return { status: "ok", takeover: true, proceed: true, sessionType: "ai" };
  }

  const now = new Date();
  const lastMsgTime = new Date(lastMessage.created_at);
  const diffMinutes = (now - lastMsgTime) / (1000 * 60);

  // Jika pesan terakhir adalah dari AI
  if (lastMessage.agent_type === "ai") {
    console.log("[WAHA Handler] Last message was from AI");
    // Lanjutkan session AI
    return { status: "ok", takeover: true, proceed: true, sessionType: "ai" };
  }

  // Jika pesan terakhir adalah dari manusia
  if (lastMessage.agent_type === "manusia") {
    console.log(
      "[WAHA Handler] Last message was from human, checking takeover time"
    );

    if (diffMinutes > waktuTakeover) {
      // Sudah lewat waktu takeover, switch ke AI
      console.log("[WAHA Handler] Takeover time passed, switching to AI");
      return { status: "ok", takeover: true, proceed: true, sessionType: "ai" };
    } else {
      // Masih dalam waktu takeover, lanjutkan session manusia
      console.log(
        "[WAHA Handler] Still within takeover time, continuing human session"
      );
      return {
        status: "ok",
        takeover: true,
        proceed: false,
        sessionType: "manusia",
        reason: "Masih dalam waktu takeover",
        diffMinutes,
        waktuTakeover,
      };
    }
  }

  // Fallback: jika agent_type tidak jelas, default ke AI
  console.log("[WAHA Handler] Unclear agent_type, defaulting to AI");
  return { status: "ok", takeover: true, proceed: true, sessionType: "ai" };
}

/**
 * Handler untuk pesan keluar dari chanel (sent message)
 * @param {object} params - { body, client, context, ... }
 * @returns {Promise<object>} hasil proses
 */
export async function handleSentMessage({
  body,
  client,
  context,
  runtimeConfig,
  meId,
  payloadFrom,
  ...rest
}) {
  // Ambil metadata dari WAHA payload
  const metadata = body?.payload?.metadata || {};
  const messageContent = body?.payload?.body || body?.payload?.text || null;
  const messageTo =
    body?.payload?.to?.replace("@c.us", "") ||
    body?.payload?.chatId?.replace("@c.us", "") ||
    payloadFrom;

  console.log("[WAHA Handler] Sent message check:", {
    metadata,
    messageContent,
    messageTo,
    meId,
    payloadFrom,
  });

  if (metadata.sender_type === "ai") {
    console.log("[WAHA Handler] AI reply detected, not saved as manual");
    return { status: "ok", message: "AI reply detected, not saved as manual" };
  }

  // First check in-memory cache for duplicates
  const cacheKey = `${messageTo}|${messageContent}`;
  if (globalThis.__aiOutgoingCache?.has(cacheKey)) {
    console.log("[WAHA Handler] Duplicate AI message detected in cache");
    return { status: "ok", message: "Duplicate AI message detected in cache" };
  }

  // Cek apakah pesan ini sudah disimpan sebagai AI di database (1 minute window)
  try {
    const { data: existingMessage } = await client
      .from("messages")
      .select("id, agent_type, content, created_at")
      .eq("from", meId)
      .eq("to", messageTo)
      .eq("content", messageContent)
      .eq("agent_type", "ai")
      .gte("created_at", new Date(Date.now() - 1 * 60 * 1000).toISOString())
      .maybeSingle();

    if (existingMessage) {
      console.log(
        "[WAHA Handler] Message already saved as AI (skip manual save)",
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
      .eq("content", messageContent)
      .gte("created_at", new Date(Date.now() - 1 * 60 * 1000).toISOString()) // 1 menit terakhir
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentMessages && recentMessages.length > 0) {
      console.log(
        "[WAHA Handler] Found recent messages with same content:",
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
          "[WAHA Handler] Recent AI message with same content found (skip manual save)"
        );
        return {
          status: "ok",
          message:
            "Recent AI message with same content found (skip manual save)",
        };
      }
    }
  } catch (err) {
    console.log("[WAHA Handler] Error checking existing AI message:", err);
  }
  // Simpan pesan outgoing ke database sebagai manual reply
  // Ambil data yang diperlukan
  const chanelId = body?.metadata?.chanel_id || body?.chanel_id || null;
  const from = body?.payload?.from?.replace("@c.us", "") || null;

  // Cari agent_id manusia berdasarkan phone = meId
  const { data: agentData, error: agentErr } = await client
    .from("agents")
    .select("id")
    .eq("type", "manusia")
    .eq("phone", meId)
    .maybeSingle();
    console.log("[WAHA Handler] Agent data:", agentData, agentErr);
  if (agentErr || !agentData) {
    return {
      status: "error",
      message: "Agent manusia tidak ditemukan untuk phone: " + meId,
    };
  }
  const agentId = agentData.id;

  // Cari contact_id berdasarkan phone_number = payloadFrom
  let contactId = null;
  try {
    const { data: contactData, error: contactErr } = await client
      .from("contacts")
      .select("id")
      .eq("phone_number", payloadFrom)
      .maybeSingle();
    if (contactData && contactData.id) {
      contactId = contactData.id;
    } else {
      console.log(
        "[WAHA Webhook] Contact tidak ditemukan untuk phone_number:",
        payloadFrom
      );
    }
  } catch (e) {
    console.log("[WAHA Webhook] Error mencari contact:", e.message);
  }

  // Simpan ke tabel messages
  try {
    const { data, error } = await client
      .from("messages")
      .insert({
        agent_id: agentId,
        chanel_id: chanelId,
        contact_id: contactId,
        message_type: "text",
        agent_type: "manusia",
        from: meId,
        to: payloadFrom,
        media_url: null,
        content: messageContent,
        created_by:body?.metadata.i
      })
      .select()
      .single();
    if (error) {
      return { status: "error", message: error.message };
    }
    return { status: "ok", message: "Manual reply saved to database", data };
  } catch (err) {
    return {
      status: "error",
      message: "Gagal simpan manual reply",
      detail: err.message,
    };
  }
}
