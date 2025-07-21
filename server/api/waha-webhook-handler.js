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

  // Cek message terakhir dari chanel ini by chat_replay='manusia'
  const { data: lastHumanMsg } = await client
    .from("messages")
    .select("created_at")
    .eq("chanel_id", chanelId)
    .eq("chat_replay", "manusia")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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
  // Simpan ke tabel messages
  try {
    const { data, error } = await client
      .from("messages")
      .insert({
        agent_id: agentId,
        chanel_id: chanelId,
        contact_id: null, // Isi jika ada
        message_type: "text",
        chat_replay: "manusia",
        from,
        to,
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
