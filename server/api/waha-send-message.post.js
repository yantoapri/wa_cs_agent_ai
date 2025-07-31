import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { session, to, text, media } = body;

    // Validate required fields
    if (!session || !to) {
      return {
        error: true,
        message: "session dan to wajib diisi",
      };
    }

    // Validate that either text or media is provided
    if (!text && !media) {
      return {
        error: true,
        message: "text atau media wajib diisi",
      };
    }

    const runtimeConfig = useRuntimeConfig();
    const client = createClient(
      runtimeConfig.public.supabaseUrl,
      runtimeConfig.supabaseServiceRoleKey
    );

    // Get WAHA configuration from environment
    const baseUrl = runtimeConfig.wahaBaseUrl;
    const wahaApiKey = runtimeConfig.wahaApiKey;

    if (!baseUrl || !wahaApiKey) {
      return {
        error: true,
        message: "WAHA configuration tidak ditemukan",
      };
    }

    // Prepare WAHA message payload
    const wahaPayload = {
      session: session,
      chatId: to + "@c.us",
    };

    // Add text if present
    if (text) {
      wahaPayload.text = text;
    }

    // Add media if present
    if (media) {
      // Extract file extension and determine mimetype
      let mimetype = "image/jpeg";
      let filename = "filename.jpg";
      const extMatch = media.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
      if (extMatch) {
        const ext = extMatch[1].toLowerCase();
        if (ext === "png") mimetype = "image/png";
        else if (ext === "webp") mimetype = "image/webp";
        else if (ext === "gif") mimetype = "image/gif";
        else if (ext === "jpg" || ext === "jpeg") mimetype = "image/jpeg";
        filename = `filename.${ext}`;
      }

      // Add file object for images (like in the working webhook)
      wahaPayload.file = {
        mimetype,
        url: media,
        filename,
      };

      // Add caption if text is provided
      if (text) {
        wahaPayload.caption = text;
      }
    }

    console.log("Sending message to WAHA:", {
      url: media ? `${baseUrl}/api/sendImage` : `${baseUrl}/api/sendText`,
      session: session,
      to: to,
      hasText: !!text,
      hasMedia: !!media,
      hasFile: !!wahaPayload.file,
      hasCaption: !!wahaPayload.caption,
      baseUrl: baseUrl,
      wahaApiKey: wahaApiKey ? "***" : "NOT_SET",
    });

    // Determine which WAHA endpoint to use based on content type
    const endpoint = media ? "/api/sendImage" : "/api/sendText";
    const fullUrl = `${baseUrl}${endpoint}`;

    console.log("Full WAHA URL:", fullUrl);
    console.log("WAHA Payload:", JSON.stringify(wahaPayload, null, 2));

    // Send message to WAHA
    const wahaResponse = await $fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": wahaApiKey,
      },
      body: wahaPayload,
      timeout: 30000, // 30 second timeout
    });

    console.log("WAHA response:", wahaResponse);

    // Check if WAHA request was successful
    if (wahaResponse && !wahaResponse.error) {
      return {
        error: false,
        message: media
          ? "Gambar berhasil dikirim ke WAHA"
          : "Pesan berhasil dikirim ke WAHA",
        data: wahaResponse,
      };
    } else {
      console.error("WAHA API error:", wahaResponse);
      return {
        error: true,
        message: wahaResponse?.message || "Gagal mengirim pesan ke WAHA",
        data: wahaResponse,
      };
    }
  } catch (err) {
    console.error("Error in waha-send-message API:", err);
    return {
      error: true,
      message: err.message || "Terjadi kesalahan saat mengirim pesan ke WAHA",
    };
  }
});
