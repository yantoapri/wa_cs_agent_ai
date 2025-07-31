import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { agent_id, chanel_id, contact_id, limit = 50, offset = 0 } = query;

  const runtimeConfig = useRuntimeConfig();
  const client = createClient(
    runtimeConfig.public.supabaseUrl,
    runtimeConfig.supabaseServiceRoleKey
  );

  try {
    let queryBuilder = client
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    // Filter by agent_id if provided
    if (agent_id) {
      queryBuilder = queryBuilder.eq("agent_id", agent_id);
    }

    // Filter by chanel_id if provided
    if (chanel_id) {
      queryBuilder = queryBuilder.eq("chanel_id", chanel_id);
    }

    // Filter by contact_id if provided
    if (contact_id) {
      queryBuilder = queryBuilder.eq("contact_id", contact_id);
    }

    // Apply limit and offset
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Error fetching messages:", error);
      return {
        status: "error",
        message: "Gagal mengambil data pesan",
        detail: error.message,
      };
    }

    return {
      status: "ok",
      data: data || [],
      count: data?.length || 0,
    };
  } catch (err) {
    console.error("Error in message.get.js:", err);
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil data pesan",
      detail: err.message,
    };
  }
});
