import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      agent_id,
      channel_id,
      contact_id,
      message_type,
      media_url,
      content,
    } = body;
    if (!agent_id || !channel_id || !contact_id || !message_type || !content) {
      return {
        error: true,
        message:
          "agent_id, channel_id, contact_id, message_type, dan content wajib diisi",
      };
    }
    const client = serverSupabaseClient(event);
    const { data, error } = await client
      .from("messages")
      .insert({
        agent_id,
        channel_id,
        contact_id,
        message_type,
        media_url: media_url || null,
        content,
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
