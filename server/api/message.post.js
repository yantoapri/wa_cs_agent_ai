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
      chat_replay, // ganti dari sender
      from,
      to,
    } = body;
    if (
      !agent_id ||
      !chanel_id ||
      !contact_id ||
      !message_type ||
      !content ||
      !chat_replay ||
      !from ||
      !to
    ) {
      return {
        error: true,
        message:
          "agent_id, chanel_id, contact_id, message_type, content, chat_type, from, dan to wajib diisi",
      };
    }
    const runtimeConfig = useRuntimeConfig();
    const client = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceRoleKey
    );
    const { data, error } = await client
      .from("messages")
      .insert({
        agent_id,
        chanel_id,
        contact_id,
        message_type,
        media_url: media_url || null,
        content,
        chat_type,
        from,
        to,
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
