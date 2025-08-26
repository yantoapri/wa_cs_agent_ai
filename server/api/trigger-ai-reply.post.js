import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { chanel_id, contact_id, message_id } = body;
  if (!chanel_id || !contact_id || !message_id) {
    return {
      status: "error",
      message: "chanel_id, contact_id, and message_id are required",
    };
  }

  const runtimeConfig = useRuntimeConfig();
  const client = createClient(
    runtimeConfig.public.supabaseUrl,
    runtimeConfig.supabaseServiceRoleKey
  );

  // Ambil pesan user terakhir
  const { data: userMsg, error: userMsgErr } = await client
    .from("messages")
    .select("*")
    .eq("id", message_id)
    .maybeSingle();
  if (userMsgErr || !userMsg) {
    return { status: "error", message: "User message not found" };
  }

  // Ambil agent AI aktif di chanel
  const { data: conn, error: connErr } = await client
    .from("chanel_agent_connections")
    .select("agent_id")
    .eq("chanel_id", chanel_id)
    .eq("is_active", true)
    .maybeSingle();
  if (connErr || !conn || !conn.agent_id) {
    return { status: "error", message: "No active agent AI found in chanel" };
  }

  // Ambil config agent_ai_configs
  const { data: config, error: configErr } = await client
    .from("agent_ai_configs")
    .select("*")
    .eq("agent_id", conn.agent_id)
    .maybeSingle();
  if (configErr || !config) {
    return { status: "error", message: "Config agent tidak ditemukan" };
  }

  // Ambil session_name chanel
  const { data: chanelData } = await client
    .from("chanels")
    .select("session_name")
    .eq("id", chanel_id)
    .maybeSingle();
  const sessionNameForPresence = chanelData?.session_name;

  // Call AI (openrouter)
  let aiText, images;
  try {
    const aiRes = await $fetch("/api/openrouter", {
      method: "POST",
      body: {
        prompt: userMsg.content,
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
    return { status: "ok", message: "Tidak ada hasil dari AI" };
  }

  // Simpan prompt user ke database sebelum proses AI (opsional, jika ingin tracking)
  // --- Kirim balasan AI ke user ---
  const payloadFrom = userMsg.from;
  const meId = userMsg.to;
  const WAHA_BASE_URL = runtimeConfig.wahaBaseUrl;
  const WAHA_API_KEY = runtimeConfig.wahaApiKey;

  // Kirim text saja ke /api/sendText jika tidak ada gambar
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
    // Simpan pesan AI ke database
    const saveData = {
      agent_id: conn.agent_id,
      chanel_id,
      contact_id,
      message_type: "text",
      agent_type: "ai",
      from: meId,
      to: payloadFrom,
      media_url: null,
      content: aiText,
    };
    await $fetch("/api/message", {
      method: "POST",
      body: saveData,
    });
    return { status: "ok", message: "AI reply sent and saved" };
  } catch (err) {
    return {
      status: "error",
      message: "Gagal kirim/simpan pesan AI",
      detail: err?.message,
    };
  }
});
