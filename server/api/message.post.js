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
      created_by,
      wa_message_id,
      agent_type: providedAgentType,
    } = body;
    if (
      !agent_id ||
      !chanel_id ||
      !contact_id ||
      !message_type ||
      !from ||
      !to||
      !created_by||
      !wa_message_id
    ) {
      return {
        error: true,
        message:
          "agent_id, chanel_id, contact_id, message_type, content, from, dan to,created_by,wa_message_id wajib diisi",
      };
    }
    const runtimeConfig = useRuntimeConfig();
    const client = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceRoleKey
    );
    // Ambil tipe agent dari tabel agents atau gunakan yang diberikan
    let agent_type = providedAgentType || null;
    
    if (!agent_type) {
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
    }
    if (!agent_type) {
      return {
        error: true,
        message: "agent_type tidak ditemukan untuk agent_id: " + agent_id,
      };
    }
    // Cek duplikat pesan
    const { data: existing, error: dupError } = await client
      .from("messages")
      .select("id")
      .match({
        agent_id,
        chanel_id,
        contact_id,
        message_type,
        media_url: media_url || null,
        content,
        from,
        to,
        created_by: created_by || null,
        wa_message_id: wa_message_id || null,
        agent_type
      })
      .order("created_at", { ascending: asc })
      .maybeSingle();
    if (dupError) {
      return {
        error: true,
        message: dupError.message,
      };
    }
    if (existing && existing.length > 0) {
      return {
        error: true,
        message: "Pesan duplikat: data dengan field yang sama sudah ada.",
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
        created_by: created_by || null,
        wa_message_id: wa_message_id || null,
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
