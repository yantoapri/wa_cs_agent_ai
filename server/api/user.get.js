import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  try {
    const id= getQuery(event).id;

    const runtimeConfig = useRuntimeConfig();
    const client = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceRoleKey
    );
    const { data, error } = await client
      .from("users")
      .select("package(*)")
      .eq("id", id)
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
