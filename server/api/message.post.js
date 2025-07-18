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
      sender,
    } = body;
    if (
      !agent_id ||
      !chanel_id ||
      !contact_id ||
      !message_type ||
      !content ||
      !sender
    ) {
      return {
        error: true,
        message:
          "agent_id, chanel_id, contact_id, message_type, content, dan sender wajib diisi",
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
        sender,
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
