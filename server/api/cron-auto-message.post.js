import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig();
    const client = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceRoleKey
    );

    // Call the auto message scheduler API
    const response = await $fetch("/api/auto-message-scheduler", {
      method: "POST",
    });

    // Log the result for monitoring
    if (response.error) {
    } else {
    }

    return {
      error: false,
      message: "Cron job completed successfully",
      schedulerResponse: response,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error("[Cron Auto Message] Error:", error);
    return {
      error: true,
      message: error.message || "Terjadi kesalahan pada cron job",
    };
  }
});