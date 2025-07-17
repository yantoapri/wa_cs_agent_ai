import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  console.log("[WAHA Webhook] === START PROCESS ===");
  const body = await readBody(event);
  console.log("[WAHA Webhook] Received body:", JSON.stringify(body, null, 2));

  const runtimeConfig = useRuntimeConfig();
  const WAHA_BASE_URL = runtimeConfig.wahaBaseUrl;
  const WAHA_API_KEY = runtimeConfig.wahaApiKey;
  console.log("[WAHA Webhook] Config loaded - WAHA_BASE_URL:", WAHA_BASE_URL);

  // Buat Supabase client dengan service role key
  const client = createClient(
    runtimeConfig.public.supabaseUrl,
    runtimeConfig.supabaseServiceRoleKey
  );
  console.log("[WAHA Webhook] Supabase client created");

  // Ambil chanel_id dari metadata jika ada
  const metachanelId = body?.metadata?.chanel_id || null;
  // Ambil chanel_id dari param URL jika ada
  const urlchanelId =
    event.context?.params?.chanel_id || event.context?.params?.id || null;
  // Format baru: body langsung berisi event object
  const meId = body?.me?.id?.replace("@c.us", "") || null;
  const payloadBody = body?.payload?.body || null;
  const payloadFrom = body?.payload?.from?.replace("@c.us", "") || null;

  console.log("[WAHA Webhook] Extracted data:", {
    metachanelId,
    urlchanelId,
    meId,
    payloadBody,
    payloadFrom,
  });

  // Gunakan chanel_id dari metadata, lalu URL param, lalu meId
  const chanelIdToUse = metachanelId;
  console.log("[WAHA Webhook] Using chanel_id:", chanelIdToUse);

  // Error handling jika chanel_id dan meId tidak ada
  if (!chanelIdToUse) {
    console.log("[WAHA Webhook] ERROR: No chanel_id found");
    return {
      status: "error",
      error: "chanel_id tidak ditemukan di URL maupun body event (me.id)",
    };
  }

  if (!payloadBody || !payloadFrom) {
    console.log("[WAHA Webhook] No payload body or from, skipping");
    return { status: "ok", results: [] };
  }

  console.log("[WAHA Webhook] === CONTACT PROCESS ===");
  // --- PROSES CEK DAN SIMPAN CONTACT ---
  let contact_id = null;
  try {
    console.log("[WAHA Webhook] Checking existing contact for:", payloadFrom);
    // 1. Cek apakah sudah ada di contact
    const contactRes = await $fetch("/api/contact", {
      method: "GET",
      query: { phone_number: payloadFrom },
    });
    console.log("[WAHA Webhook] Contact Response:", contactRes);
    if (
      contactRes &&
      contactRes.found &&
      contactRes.data &&
      contactRes.data.id
    ) {
      contact_id = contactRes.data.id;
      console.log("[WAHA Webhook] Existing contact found, ID:", contact_id);
    } else {
      console.log("[WAHA Webhook] Creating new contact for:", payloadFrom);
      // 2. Jika tidak ada, tambahkan ke contact
      const createRes = await $fetch("/api/contact", {
        method: "POST",
        body: {
          name: payloadFrom, // default name pakai nomor jika tidak ada nama
          phone_number: payloadFrom,
        },
      });
      console.log("[WAHA Webhook] Create Contact Response:", createRes);
      if (createRes && createRes.data && createRes.data.id) {
        contact_id = createRes.data.id;
        console.log("[WAHA Webhook] New contact created, ID:", contact_id);
      }
    }
  } catch (err) {
    console.log("[WAHA Webhook] Error cek/tambah contact", err);
  }
  console.log(
    "[WAHA Webhook] Contact process result - contact_id:",
    contact_id
  );
  // --- END PROSES CEK DAN SIMPAN CONTACT ---

  console.log("[WAHA Webhook] === AGENT CONNECTION PROCESS ===");
  // Ambil agent_id dari conn (nanti di bawah), tapi pastikan proses limit balasan AI dilakukan setelah dapat contact_id dan agent_id
  // 1. Cari agentai yang aktif di chanel_agent_connections
  console.log(
    "[WAHA Webhook] Looking for active agent in chanel:",
    chanelIdToUse
  );
  const { data: conn, error: connErr } = await client
    .from("chanel_agent_connections")
    .select("agent_id")
    .eq("chanel_id", chanelIdToUse)
    .eq("is_active", true)
    .maybeSingle();

  console.log("[WAHA Webhook] Agent connection query result:", {
    conn,
    connErr,
  });

  if (connErr || !conn || !conn.agent_id) {
    console.log("[WAHA Webhook] Tidak ada agent aktif di chanel", {
      meId,
      chanel_id: chanelIdToUse,
      agent_id: conn?.agent_id,
    });
    return { status: "ok", results: [] };
  }

  console.log("[WAHA Webhook] Active agent found, ID:", conn.agent_id);

  console.log("[WAHA Webhook] === LIMIT CHECK PROCESS ===");
  // --- PROSES LIMIT BALASAN AI ---
  // Ambil data chanel (maksimum_balasan_ai, limit_balasan_ai)
  console.log("[WAHA Webhook] Fetching chanel data for limit check");
  const { data: chanelDataLimit, error: chanelErr } = await client
    .from("chanels")
    .select("maksimum_balasan_ai, limit_balasan_ai")
    .eq("id", chanelIdToUse)
    .maybeSingle();

  console.log("[WAHA Webhook] Chanel data for limit:", {
    chanelDataLimit,
    chanelErr,
  });

  if (chanelErr) {
    console.log(
      "[WAHA Webhook] Gagal ambil data chanel untuk limit balasan",
      chanelErr
    );
  }
  if (chanelDataLimit && chanelDataLimit.limit_balasan_ai) {
    console.log("[WAHA Webhook] Limit check enabled, counting messages");
    // Hitung jumlah message untuk contact_id dan agent_id
    const { count, error: countErr } = await client
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("contact_id", contact_id)
      .eq("agent_id", conn.agent_id);

    console.log("[WAHA Webhook] Message count result:", { count, countErr });

    if (countErr) {
      console.log(
        "[WAHA Webhook] Gagal hitung message untuk limit balasan",
        countErr
      );
    }
    if (
      typeof count === "number" &&
      count >= chanelDataLimit.maksimum_balasan_ai
    ) {
      console.log("[WAHA Webhook] LIMIT REACHED! Sending warning");
      // Sudah mencapai limit, kirim peringatan ke WAHA
      try {
        const { data: chanelData } = await client
          .from("chanels")
          .select("session_name")
          .eq("id", chanelIdToUse)
          .maybeSingle();
        const sessionName = chanelData?.session_name;
        console.log("[WAHA Webhook] Session name for warning:", sessionName);

        const warningText =
          "Limit balasan AI untuk nomor ini telah tercapai. Silakan hubungi admin untuk membuka limit.";
        await $fetch(`${WAHA_BASE_URL}/api/sendText`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": WAHA_API_KEY,
          },
          body: {
            session: sessionName,
            chatId: payloadFrom + "@c.us",
            text: warningText,
          },
        });
        console.log("[WAHA Webhook] Warning message sent successfully");
      } catch (err) {
        console.log("[WAHA Webhook] Gagal kirim peringatan limit ke WAHA", err);
      }
      // Hentikan proses
      return {
        status: "ok",
        results: [
          {
            contact_id,
            agent_id: conn.agent_id,
            message: `Limit balasan AI (${chanelDataLimit.maksimum_balasan_ai}) sudah tercapai untuk contact ini.`,
          },
        ],
      };
    }
  }
  console.log("[WAHA Webhook] Limit check passed");
  // --- END PROSES LIMIT BALASAN AI ---

  console.log("[WAHA Webhook] === AI CONFIG PROCESS ===");
  const results = [];

  // 2. Ambil config agent_ai_configs
  console.log("[WAHA Webhook] Fetching AI config for agent:", conn.agent_id);
  const { data: config, error: configErr } = await client
    .from("agent_ai_configs")
    .select("*")
    .eq("agent_id", conn.agent_id)
    .maybeSingle();

  console.log("[WAHA Webhook] AI config result:", {
    config: !!config,
    configErr,
  });

  if (configErr || !config) {
    console.log("[WAHA Webhook] Config agent tidak ditemukan", {
      agent_id: conn.agent_id,
    });
    return { status: "ok", results: [] };
  }
  console.log("[WAHA Webhook] AI config found, proceeding to AI processing");

  console.log("[WAHA Webhook] === AI PROCESSING ===");
  // 3. Fetch ke /api/openrouter
  let sessionNameForPresence = null;

  try {
    // Pastikan sessionNameForPresence sudah terisi
    if (!sessionNameForPresence) {
      console.log("[WAHA Webhook] Fetching session name for presence");
      const { data: chanelDataPresence } = await client
        .from("chanels")
        .select("session_name")
        .eq("id", chanelIdToUse)
        .maybeSingle();
      sessionNameForPresence = chanelDataPresence?.session_name;
      console.log(
        "[WAHA Webhook] Session name for presence:",
        sessionNameForPresence
      );
    }

    // Kirim efek mengetik (presence: typing) sebelum proses AI
    if (sessionNameForPresence) {
      console.log("[WAHA Webhook] Sending typing presence");
      try {
        await $fetch(
          `${WAHA_BASE_URL}/api/${sessionNameForPresence}/presence`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": WAHA_API_KEY,
            },
            body: {
              chatId: payloadFrom + "@c.us",
              presence: "typing",
            },
          }
        );
        console.log("[WAHA Webhook] Typing presence sent successfully");
      } catch (err) {
        console.log("[WAHA Webhook] Gagal kirim presence typing", err);
      }
    }

    let aiText, images;
    console.log("[WAHA Webhook] Calling AI service with prompt:", payloadBody);
    try {
      const aiRes = await $fetch("/api/openrouter", {
        method: "POST",
        body: {
          prompt: payloadBody,
          knowledge: JSON.stringify(config),
        },
      });
      aiText = aiRes?.result;
      images = aiRes?.images;
      console.log("[WAHA Webhook] AI response received:", {
        hasText: !!aiText,
        textLength: aiText?.length,
        hasImages: !!images,
        imageCount: images?.length,
      });

      if (!aiText) {
        console.log("[WAHA Webhook] Tidak ada hasil dari AI", { aiRes });
        return { status: "ok", results: [] };
      }
    } finally {
      // Setelah proses AI selesai, kembalikan presence ke online
      if (sessionNameForPresence) {
        console.log("[WAHA Webhook] Sending available presence");
        try {
          await $fetch(
            `${WAHA_BASE_URL}/api/${sessionNameForPresence}/presence`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Api-Key": WAHA_API_KEY,
              },
              body: {
                chatId: payloadFrom + "@c.us",
                presence: "available",
              },
            }
          );
          console.log("[WAHA Webhook] Available presence sent successfully");
        } catch (err) {
          console.log("[WAHA Webhook] Gagal kirim presence available", err);
        }
      }
    }

    console.log("[WAHA Webhook] === MESSAGE SENDING PROCESS ===");
    // 4. Kirim ke WhatsApp (WAHA)
    let message_type = "text";
    let media_url = null;
    if (images && images.length > 0) {
      console.log("[WAHA Webhook] Sending image message(s)");
      message_type = "image";
      for (const imgUrl of images) {
        console.log("[WAHA Webhook] Processing image:", imgUrl);
        // Ambil mimetype dan filename dari url
        let mimetype = "image/jpeg";
        let filename = "filename.jpg";
        const extMatch = imgUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        if (extMatch) {
          const ext = extMatch[1].toLowerCase();
          if (ext === "png") mimetype = "image/png";
          else if (ext === "webp") mimetype = "image/webp";
          else if (ext === "gif") mimetype = "image/gif";
          else if (ext === "jpg" || ext === "jpeg") mimetype = "image/jpeg";
          filename = `filename.${ext}`;
        }
        const messageBody = {
          session: sessionNameForPresence,
          chatId: payloadFrom + "@c.us",
          file: {
            mimetype,
            url: imgUrl,
            filename,
          },
          caption: aiText,
        };
        console.log("[WAHA Webhook] Image message body:", messageBody);
        await $fetch(`${WAHA_BASE_URL}/api/sendImage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": WAHA_API_KEY,
          },
          body: messageBody,
        });
        console.log("[WAHA Webhook] Image sent successfully via WAHA");

        // Simpan message untuk setiap gambar
        console.log("[WAHA Webhook] Saving image message to database");
        try {
          await $fetch("/api/message", {
            method: "POST",
            body: {
              agent_id: conn.agent_id,
              chanel_id: chanelIdToUse,
              contact_id,
              message_type: "image",
              media_url: imgUrl,
              content: aiText,
            },
          });
          console.log(
            "[WAHA Webhook] Image message saved to database successfully"
          );
          console.log("[WAHA Webhook] Save Image Message Response:", {
            agent_id: conn.agent_id,
            chanel_id: chanelIdToUse,
            contact_id,
            message_type: "image",
            media_url: imgUrl,
            content: aiText,
          });
        } catch (err) {
          console.log("[WAHA Webhook] Gagal simpan message image", err);
        }
      }
    } else {
      console.log("[WAHA Webhook] Sending text message");
      // Kirim text saja ke /api/sendText jika tidak ada gambar
      const messageBody = {
        session: sessionNameForPresence,
        chatId: payloadFrom + "@c.us",
        text: aiText,
      };
      console.log("[WAHA Webhook] Text message body:", messageBody);
      await $fetch(`${WAHA_BASE_URL}/api/sendText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": WAHA_API_KEY,
        },
        body: messageBody,
      });
      console.log("[WAHA Webhook] Text sent successfully via WAHA");

      // Simpan message text
      console.log("[WAHA Webhook] Saving text message to database");
      try {
        const messageRes = await $fetch("/api/message", {
          method: "POST",
          body: {
            agent_id: conn.agent_id,
            chanel_id: chanelIdToUse,
            contact_id,
            message_type: "text",
            media_url: null,
            content: aiText,
          },
        });
        console.log(
          "[WAHA Webhook] Text message saved to database successfully"
        );
        console.log("[WAHA Webhook] Save Text Message Response:", messageRes);
        if (messageRes && messageRes.error === false) {
          console.log("[WAHA Webhook] Save Text Message Response:", {
            agent_id: conn.agent_id,
            chanel_id: chanelIdToUse,
            contact_id,
            message_type: "text",
            media_url: null,
            content: aiText,
          });
        }
      } catch (err) {
        console.log("[WAHA Webhook] Gagal simpan message text", err);
      }
    }
  } catch (err) {
    console.log("[WAHA Webhook] Error saat memanggil /api/openrouter", err);
    results.push({
      meId,
      payloadFrom,
      error: "Failed to get AI response",
      detail: err?.message,
    });
    return { status: "ok", results };
  }
  console.log("[WAHA Webhook] === PROCESS COMPLETED ===");
  console.log("[WAHA Webhook] Final results:", { results });
  return { status: "ok", results };
});
