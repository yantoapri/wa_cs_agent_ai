import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const runtimeConfig = useRuntimeConfig();
  const WAHA_BASE_URL = runtimeConfig.wahaBaseUrl;
  const WAHA_API_KEY = runtimeConfig.wahaApiKey;

  // Buat Supabase client dengan service role key
  const client = createClient(
    runtimeConfig.public.supabaseUrl,
    runtimeConfig.supabaseServiceRoleKey
  );

  // Ambil channel_id dari metadata jika ada
  const metaChannelId = body?.metadata?.channel_id || null;
  // Ambil channel_id dari param URL jika ada
  const urlChannelId =
    event.context?.params?.channel_id || event.context?.params?.id || null;
  // Format baru: body langsung berisi event object
  const meId = body?.me?.id?.replace("@c.us", "") || null;
  const payloadBody = body?.payload?.body || null;
  const payloadFrom = body?.payload?.from?.replace("@c.us", "") || null;
  // Gunakan channel_id dari metadata, lalu URL param, lalu meId
  const channelIdToUse = metaChannelId;
  console.log("channelIdToUse:", channelIdToUse);
  // Error handling jika channel_id dan meId tidak ada
  if (!channelIdToUse) {
    return {
      status: "error",
      error: "channel_id tidak ditemukan di URL maupun body event (me.id)",
    };
  }

  if (!payloadBody || !payloadFrom) {
    return { status: "ok", results: [] };
  }

  const results = [];

  // 1. Cari agentai yang aktif di channel_agent_connections
  const { data: conn, error: connErr } = await client
    .from("channel_agent_connections")
    .select("agent_id")
    .eq("channel_id", channelIdToUse)
    .eq("is_active", true)
    .maybeSingle();
  if (connErr || !conn || !conn.agent_id) {
    console.log("[WAHA Webhook] Tidak ada agent aktif di channel", {
      meId,
      channel_id: channelIdToUse,
      agent_id: conn?.agent_id,
    });
    return { status: "ok", results: [] };
  }
  // console.log("[WAHA Webhook] Agent aktif ditemukan", {
  //   agent_id: conn.agent_id,
  // });

  // 2. Ambil config agent_ai_configs
  const { data: config, error: configErr } = await client
    .from("agent_ai_configs")
    .select("*")
    .eq("agent_id", conn.agent_id)
    .maybeSingle();
  if (configErr || !config) {
    console.log("[WAHA Webhook] Config agent tidak ditemukan", {
      agent_id: conn.agent_id,
    });
    return { status: "ok", results: [] };
  }
  // console.log("[WAHA Webhook] Config agent ditemukan", { config });

  // 3. Fetch ke /api/openrouter
  try {
    // console.log("[WAHA Webhook] Memanggil /api/openrouter", {
    //   prompt: payloadBody,
    // });
    const aiRes = await $fetch("/api/openrouter", {
      method: "POST",
      body: {
        prompt: payloadBody,
        knowledge: JSON.stringify(config),
      },
    });
    const aiText = aiRes?.result;
    if (!aiText) {
      console.log("[WAHA Webhook] Tidak ada hasil dari AI", { aiRes });
      return { status: "ok", results: [] };
    }

    // 4. Kirim ke WhatsApp (WAHA)
    try {
      // console.log("[WAHA Webhook] Mengirim pesan ke WAHA", {
      //   to: payloadFrom,
      //   from: meId,
      //   aiText,
      // });
      await $fetch(`${WAHA_BASE_URL}/api/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": WAHA_API_KEY,
        },
        body: {
          to: payloadFrom + "@c.us",
          from: meId + "@c.us",
          text: aiText,
        },
      });
    } catch (err) {
      console.log("[WAHA Webhook] Gagal mengirim pesan ke WAHA", err);
      results.push({
        meId,
        payloadFrom,
        error: "Failed to send WAHA message",
        detail: err?.message,
      });
      return { status: "ok", results };
    }
    results.push({ meId, payloadFrom, aiText });
  } catch (err) {
    console.log("[WAHA Webhook] Error saat memanggil /api/openrouter", err);
    results.push({
      meId,
      payloadFrom,
      error: "Failed to get AI response",
      detail: err?.message,
    });
    return { status: "ok", results };
  }
  console.log("[WAHA Webhook] Hasil", { results });
  return { status: "ok", results };
});
