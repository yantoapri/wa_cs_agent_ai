import { serverSupabaseClient } from "#supabase/server";

const WAHA_BASE_URL = process.env.VITE_BASE_URL_WAHA || "http://localhost:3000";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const client = serverSupabaseClient(event);

  const logs = body.logs || [];
  const results = [];

  for (const log of logs) {
    const messages = log.message;
    if (Array.isArray(messages)) {
      const idx = messages.findIndex((m) => m === "WAHA WEBHOOK EVENT:");
      if (idx !== -1 && typeof messages[idx + 1] === "object") {
        const eventObj = messages[idx + 1];
        const meId = eventObj?.me?.id?.replace("@c.us", "") || null;
        const payloadBody = eventObj?.payload?.body || null;
        const payloadFrom =
          eventObj?.payload?.from?.replace("@c.us", "") || null;
        if (!meId || !payloadBody || !payloadFrom) continue;

        // 1. Cari agentai yang aktif di channel_agent_connections
        const { data: conn, error: connErr } = await client
          .from("channel_agent_connections")
          .select("agent_id")
          .eq("channel_id", meId)
          .eq("is_active", true)
          .maybeSingle();
        if (connErr || !conn || !conn.agent_id) continue;

        // 2. Ambil config agent_ai_configs
        const { data: config, error: configErr } = await client
          .from("agent_ai_configs")
          .select("*")
          .eq("agent_id", conn.agent_id)
          .maybeSingle();
        if (configErr || !config) continue;

        // 3. Fetch ke /api/openrouter
        const aiRes = await $fetch("/api/openrouter", {
          method: "POST",
          body: {
            prompt: payloadBody,
            knowledge: JSON.stringify(config),
          },
        });
        const aiText = aiRes?.result;
        if (!aiText) continue;

        // 4. Kirim ke WhatsApp (WAHA)
        try {
          await $fetch(`${WAHA_BASE_URL}/api/send-message`, {
            method: "POST",
            body: {
              to: payloadFrom + "@c.us",
              from: meId + "@c.us",
              text: aiText,
            },
          });
        } catch (err) {
          results.push({
            meId,
            payloadFrom,
            error: "Failed to send WAHA message",
            detail: err?.message,
          });
          continue;
        }
        results.push({ meId, payloadFrom, aiText });
      }
    }
  }

  return { status: "ok", results };
});
