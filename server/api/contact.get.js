import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  try {
    const phone_number = getQuery(event).phone_number;
    if (!phone_number) {
      return {
        error: true,
        message: "phone_number wajib diisi pada query",
      };
    }
    const client = serverSupabaseClient(event);
    const { data, error } = await client
      .from("contacts")
      .select("*")
      .eq("phone_number", phone_number)
      .single();
    if (error && error.code === "PGRST116") {
      // Not found
      return {
        found: false,
        data: null,
      };
    }
    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }
    return {
      found: true,
      data,
    };
  } catch (err) {
    return {
      error: true,
      message: err.message,
    };
  }
});
