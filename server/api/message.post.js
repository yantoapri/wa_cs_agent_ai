import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      agent_id,
      chanel_id,
      contact_id,
      message_type,
      media_url,
      content,
      from,
      to,
    } = body;
    if (
      !agent_id ||
      !chanel_id ||
      !contact_id ||
      !message_type ||
      !content ||
      !from ||
      !to
    ) {
      return {
        error: true,
        message:
          "agent_id, chanel_id, contact_id, message_type, content, from, dan to wajib diisi",
      };
    }
    const runtimeConfig = useRuntimeConfig();
    const client = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceRoleKey
    );
    // Ambil tipe agent dari tabel agents
    let agent_type = null;
    try {
      const { data: agentData, error: agentErr } = await client
        .from("agents")
        .select("type")
        .eq("id", agent_id)
        .maybeSingle();
      if (agentData && agentData.type) {
        agent_type = agentData.type; // 'ai' atau 'manusia'
      }
    } catch (e) {
      // Biarkan agent_type null jika gagal
    }
    if (!agent_type) {
      return {
        error: true,
        message: "agent_type tidak ditemukan untuk agent_id: " + agent_id,
      };
    }
    const { data, error } = await client
      .from("messages")
      .insert({
        agent_id,
        chanel_id,
        contact_id,
        message_type,
        media_url: media_url || null,
        content,
        from,
        to,
        agent_type, // gunakan agent_type untuk filter/grouping
      })
      .select()
      .single();
    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }
    return {
      error: false,
      data,
    };
  } catch (err) {
    return {
      error: true,
      message: err.message,
    };
  }
});
