import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { phone_number,created_by } = body;
    if (!phone_number) {
      return {
        error: true,
        message: "phone_number wajib diisi",
      };
    }
    const runtimeConfig = useRuntimeConfig();
    const client = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceRoleKey
    );
    const { data:checkContact, error:errorCheck } = await client
      .from("contacts")
      .select("*")
      .eq("phone_number", phone_number)
      .eq("created_by", created_by)
      .eq("is_active", true);

    if (errorCheck) {
      return {
        error: true,
        message: errorCheck.message,
      };
    }

    if (checkContact) {
      return {
        error: true,
        message: "Kontak sudah ada",
      };
    }

    const { data, error } = await client
      .from("contacts")
      .insert({ name: phone_number, phone_number,created_by })
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
