import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { phone_number } = body;
    if (!phone_number) {
      return {
        error: true,
        message: "phone_number wajib diisi",
      };
    }
    const client = serverSupabaseClient(event);
    const { data, error } = await client
      .from("contacts")
      .insert({ name, phone_number })
      .select("id")
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
