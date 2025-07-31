import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig();
    const client = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceRoleKey
    );

    console.log("[Cron Auto Message] Starting cron job for auto message scheduler...");

    // Call the auto message scheduler API
    const response = await $fetch("/api/auto-message-scheduler", {
      method: "POST",
    });

    console.log("[Cron Auto Message] Scheduler response:", response);

    // Log the result for monitoring
    if (response.error) {
      console.error("[Cron Auto Message] Scheduler failed:", response.message);
    } else {
      console.log(`[Cron Auto Message] Scheduler completed successfully. Processed: ${response.processed}, Success: ${response.success}, Failed: ${response.failed}`);
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