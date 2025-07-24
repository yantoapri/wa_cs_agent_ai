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

  // Cek message terakhir dari chanel & contact ini by agent_type='manusia'
  let lastHumanMsg = null;
  if (contactId) {
    const res = await client
      .from("messages")
      .select("created_at")
      .eq("chanel_id", chanelId)
      .eq("contact_id", contactId)
      .eq("agent_type", "manusia")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    lastHumanMsg = res.data;
  } else {
    // fallback lama: hanya berdasarkan chanel
    const res = await client
      .from("messages")
      .select("created_at")
      .eq("chanel_id", chanelId)
      .eq("agent_type", "manusia")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    lastHumanMsg = res.data;
  }

  if (!lastHumanMsg) {
    // Tidak ada pesan manusia, lanjutkan auto-reply
    return { status: "ok", takeover: true, proceed: true };
  }

  const now = new Date();
  const lastMsgTime = new Date(lastHumanMsg.created_at);
  const diffMinutes = (now - lastMsgTime) / (1000 * 60);

  if (diffMinutes > waktuTakeover) {
    // Sudah lewat waktu takeover, lanjutkan auto-reply
    return { status: "ok", takeover: true, proceed: true };
  } else {
    // Masih dalam waktu takeover, abaikan auto-reply
    // Tambahan: cek jika sudah lewat waktu takeover sejak pesan user terakhir dan belum dibalas agent manusia
    // Ambil pesan user terakhir (from=payloadFrom) untuk contact & chanel
    let lastUserMsg = null;
    if (contactId) {
      const res = await client
        .from("messages")
        .select("id, created_at")
        .eq("chanel_id", chanelId)
        .eq("contact_id", contactId)
        .eq("from", payloadFrom)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      lastUserMsg = res.data;
    }
    let shouldForceAI = false;
    if (lastUserMsg) {
      // Cek apakah ada balasan manusia (from=meId) setelah pesan user terakhir
      const res = await client
        .from("messages")
        .select("id, created_at")
        .eq("chanel_id", chanelId)
        .eq("contact_id", contactId)
        .eq("from", meId)
        .gt("created_at", lastUserMsg.created_at)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      const lastHumanReply = res.data;
      const nowMinutesSinceUserMsg =
        (now - new Date(lastUserMsg.created_at)) / (1000 * 60);
      if (!lastHumanReply && nowMinutesSinceUserMsg > waktuTakeover) {
        // Tidak ada balasan manusia setelah pesan user terakhir dan sudah lewat waktu takeover
        shouldForceAI = true;
      }
    }
    if (shouldForceAI) {
      return {
        status: "ok",
        takeover: true,
        proceed: true,
        reason: "AI takeover forced after no human reply",
      };
    }
    return {
      status: "ok",
      takeover: true,
      proceed: false,
      reason: "Masih dalam waktu takeover",
      diffMinutes,
      waktuTakeover,
    };
  }
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
  if (metadata.sender_type === "ai") {
    return { status: "ok", message: "AI reply detected, not saved as manual" };
  }
  // Simpan pesan outgoing ke database sebagai manual reply
  // Ambil data yang diperlukan
  const chanelId = body?.metadata?.chanel_id || body?.chanel_id || null;
  const content = body?.payload?.body || null;
  const from = body?.payload?.from?.replace("@c.us", "") || null;
  const to = body?.payload?.to?.replace("@c.us", "") || null;

  // Cari agent_id manusia berdasarkan phone = meId
  const { data: agentData, error: agentErr } = await client
    .from("agents")
    .select("id")
    .eq("type", "manusia")
    .eq("phone", meId)
    .maybeSingle();
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
        content,
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
