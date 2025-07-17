import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const runtimeConfig = useRuntimeConfig();
  const WAHA_BASE_URL = runtimeConfig.wahaBaseUrl;
  const WAHA_API_KEY = runtimeConfig.wahaApiKey;

  // Buat Supabase client dengan service role key
  const client = createClient(
    runtimeConfig.public.supabaseUrl,
    runtimeConfig.supabaseServiceRoleKey
  );

  // Ambil channel_id dari metadata jika ada
  const metaChannelId = body?.metadata?.channel_id || null;
  // Ambil channel_id dari param URL jika ada
  const urlChannelId =
    event.context?.params?.channel_id || event.context?.params?.id || null;
  // Format baru: body langsung berisi event object
  const meId = body?.me?.id?.replace("@c.us", "") || null;
  const payloadBody = body?.payload?.body || null;
  const payloadFrom = body?.payload?.from?.replace("@c.us", "") || null;
  // Gunakan channel_id dari metadata, lalu URL param, lalu meId
  const channelIdToUse = metaChannelId;
  // Error handling jika channel_id dan meId tidak ada
  if (!channelIdToUse) {
    return {
      status: "error",
      error: "channel_id tidak ditemukan di URL maupun body event (me.id)",
    };
  }

  if (!payloadBody || !payloadFrom) {
    return { status: "ok", results: [] };
  }

  // --- PROSES CEK DAN SIMPAN CONTACT ---
  let contact_id = null;
  try {
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
    } else {
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
      }
    }
  } catch (err) {
    console.log("[WAHA Webhook] Error cek/tambah contact", err);
  }
  // --- END PROSES CEK DAN SIMPAN CONTACT ---

  // Ambil agent_id dari conn (nanti di bawah), tapi pastikan proses limit balasan AI dilakukan setelah dapat contact_id dan agent_id
  // 1. Cari agentai yang aktif di channel_agent_connections
  const { data: conn, error: connErr } = await client
    .from("channel_agent_connections")
    .select("agent_id")
    .eq("channel_id", channelIdToUse)
    .eq("is_active", true)
    .maybeSingle();
  if (connErr || !conn || !conn.agent_id) {
    console.log("[WAHA Webhook] Tidak ada agent aktif di channel", {
      meId,
      channel_id: channelIdToUse,
      agent_id: conn?.agent_id,
    });
    return { status: "ok", results: [] };
  }

  // --- PROSES LIMIT BALASAN AI ---
  // Ambil data channel (maksimum_balasan_ai, limit_balasan_ai)
  const { data: channelDataLimit, error: channelErr } = await client
    .from("channels")
    .select("maksimum_balasan_ai, limit_balasan_ai")
    .eq("id", channelIdToUse)
    .maybeSingle();
  if (channelErr) {
    console.log(
      "[WAHA Webhook] Gagal ambil data channel untuk limit balasan",
      channelErr
    );
  }
  if (channelDataLimit && channelDataLimit.limit_balasan_ai) {
    // Hitung jumlah message untuk contact_id dan agent_id
    const { count, error: countErr } = await client
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("contact_id", contact_id)
      .eq("agent_id", conn.agent_id);
    if (countErr) {
      console.log(
        "[WAHA Webhook] Gagal hitung message untuk limit balasan",
        countErr
      );
    }
    if (
      typeof count === "number" &&
      count >= channelDataLimit.maksimum_balasan_ai
    ) {
      // Sudah mencapai limit, kirim peringatan ke WAHA
      try {
        const { data: channelData } = await client
          .from("channels")
          .select("session_name")
          .eq("id", channelIdToUse)
          .maybeSingle();
        const sessionName = channelData?.session_name;
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
            message: `Limit balasan AI (${channelDataLimit.maksimum_balasan_ai}) sudah tercapai untuk contact ini.`,
          },
        ],
      };
    }
  }
  // --- END PROSES LIMIT BALASAN AI ---

  const results = [];

  // 2. Ambil config agent_ai_configs
  const { data: config, error: configErr } = await client
    .from("agent_ai_configs")
    .select("*")
    .eq("agent_id", conn.agent_id)
    .maybeSingle();
  if (configErr || !config) {
    console.log("[WAHA Webhook] Config agent tidak ditemukan", {
      agent_id: conn.agent_id,
    });
    return { status: "ok", results: [] };
  }
  // console.log("[WAHA Webhook] Config agent ditemukan", { config });

  // 3. Fetch ke /api/openrouter
  let sessionNameForPresence = null;

  try {
    // Pastikan sessionNameForPresence sudah terisi
    if (!sessionNameForPresence) {
      const { data: channelDataPresence } = await client
        .from("channels")
        .select("session_name")
        .eq("id", channelIdToUse)
        .maybeSingle();
      sessionNameForPresence = channelDataPresence?.session_name;
    }

    // Kirim efek mengetik (presence: typing) sebelum proses AI
    if (sessionNameForPresence) {
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
      } catch (err) {
        console.log("[WAHA Webhook] Gagal kirim presence typing", err);
      }
    }

    let aiText, images;
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
      if (!aiText) {
        console.log("[WAHA Webhook] Tidak ada hasil dari AI", { aiRes });
        return { status: "ok", results: [] };
      }
    } finally {
      // Setelah proses AI selesai, kembalikan presence ke online
      if (sessionNameForPresence) {
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
        } catch (err) {
          console.log("[WAHA Webhook] Gagal kirim presence available", err);
        }
      }
    }

    // 4. Kirim ke WhatsApp (WAHA)
    let message_type = "text";
    let media_url = null;
    if (images && images.length > 0) {
      message_type = "image";
      for (const imgUrl of images) {
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
        console.log("messageBody:", messageBody);
        await $fetch(`${WAHA_BASE_URL}/api/sendImage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": WAHA_API_KEY,
          },
          body: messageBody,
        });
        // Simpan message untuk setiap gambar
        try {
          await $fetch("/api/message", {
            method: "POST",
            body: {
              agent_id: conn.agent_id,
              chanel_id: channelIdToUse,
              contact_id,
              message_type: "image",
              media_url: imgUrl,
              content: aiText,
            },
          });
          console.log("[WAHA Webhook] Save Image Message Response:", {
            agent_id: conn.agent_id,
            channel_id: channelIdToUse,
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
      // Kirim text saja ke /api/sendText jika tidak ada gambar
      const messageBody = {
        session: sessionNameForPresence,
        chatId: payloadFrom + "@c.us",
        text: aiText,
      };
      console.log("messageBody:", messageBody);
      await $fetch(`${WAHA_BASE_URL}/api/sendText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": WAHA_API_KEY,
        },
        body: messageBody,
      });
      // Simpan message text
      try {
        const messageRes = await $fetch("/api/message", {
          method: "POST",
          body: {
            agent_id: conn.agent_id,
            channel_id: channelIdToUse,
            contact_id,
            message_type: "text",
            media_url: null,
            content: aiText,
          },
        });
        console.log("[WAHA Webhook] Save Text Message Response:", messageRes);
        if (messageRes && messageRes.error === false) {
          console.log("[WAHA Webhook] Save Text Message Response:", {
            agent_id: conn.agent_id,
            channel_id: channelIdToUse,
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
  console.log("[WAHA Webhook] Hasil", { results });
  return { status: "ok", results };
});
