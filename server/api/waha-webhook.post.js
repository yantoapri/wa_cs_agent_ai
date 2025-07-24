import { createClient } from "@supabase/supabase-js";
import {
  handleReceivedMessage,
  handleSentMessage,
} from "./waha-webhook-handler";

// Function to check if the event is a broadcast event from WAHA
function checkBroadcastEvent(body) {
  // Check for broadcast message patterns
  const payloadBody = body?.payload?.body || "";
  const payloadFrom = body?.payload?.from || "";
  const eventType = body?.event || "";
  const chatId = body?.payload?.chatId || "";
  const isGroup = body?.payload?.isGroup || false;
  const isBroadcast = body?.payload?.isBroadcast || false;

  // Common broadcast patterns in message body
  const broadcastPatterns = [
    /^broadcast/i,
    /^siaran/i,
    /^announcement/i,
    /^pengumuman/i,
    /^notifikasi/i,
    /^notification/i,
    /^system message/i,
    /^pesan sistem/i,
    /^status broadcast/i,
    /^broadcast status/i,
    /^newsletter/i,
    /^news letter/i,
    /^bulletin/i,
    /^update sistem/i,
    /^system update/i,
    /^maintenance/i,
    /^pemeliharaan/i,
  ];

  // Check if message body contains broadcast patterns
  const isBroadcastMessage = broadcastPatterns.some((pattern) =>
    pattern.test(payloadBody)
  );

  // Check for broadcast-specific event types
  const isBroadcastEventType = [
    "broadcast",
    "broadcast_message",
    "system_broadcast",
    "announcement",
    "newsletter",
    "bulletin",
    "system_update",
    "maintenance",
  ].includes(eventType);

  // Check for broadcast-specific from patterns (system numbers, broadcast numbers)
  const isBroadcastFrom =
    /^(status|broadcast|system|announcement|newsletter|bulletin|update|maintenance)/i.test(
      payloadFrom
    );

  // Check for broadcast-specific chatId patterns
  const isBroadcastChatId =
    /^(status|broadcast|system|announcement|newsletter|bulletin|update|maintenance)/i.test(
      chatId.replace("@c.us", "").replace("@g.us", "")
    );

  // Check for empty or system-like content
  const isSystemContent =
    !payloadBody ||
    payloadBody.trim().length === 0 ||
    /^(status|broadcast|system|announcement|newsletter|bulletin|update|maintenance)/i.test(
      payloadBody
    );

  // Check for group messages that might be broadcasts
  const isGroupBroadcast =
    isGroup &&
    (isBroadcastMessage ||
      isBroadcastEventType ||
      isBroadcastFrom ||
      chatId.includes("broadcast") ||
      chatId.includes("newsletter") ||
      chatId.includes("announcement"));

  // Check for explicit broadcast flag
  const isExplicitBroadcast =
    isBroadcast ||
    chatId.includes("broadcast") ||
    chatId.includes("newsletter") ||
    chatId.includes("announcement");

  console.log("[WAHA Webhook] Enhanced broadcast check:", {
    payloadBody: payloadBody.substring(0, 50) + "...",
    payloadFrom,
    chatId,
    eventType,
    isGroup,
    isBroadcast,
    isBroadcastMessage,
    isBroadcastEventType,
    isBroadcastFrom,
    isBroadcastChatId,
    isSystemContent,
    isGroupBroadcast,
    isExplicitBroadcast,
  });

  return (
    isBroadcastMessage ||
    isBroadcastEventType ||
    isBroadcastFrom ||
    isBroadcastChatId ||
    isSystemContent ||
    isGroupBroadcast ||
    isExplicitBroadcast
  );
}

// === AI Outgoing Message Cache ===
const aiOutgoingCache = globalThis.__aiOutgoingCache || new Map();
globalThis.__aiOutgoingCache = aiOutgoingCache;
const AI_CACHE_TTL = 2 * 60 * 1000; // 2 menit

function cacheAIMsg(to, content) {
  if (!to || !content) return;
  aiOutgoingCache.set(`${to}|${content}`, Date.now());
}
function isRecentAIMsg(to, content) {
  if (!to || !content) return false;
  const key = `${to}|${content}`;
  const ts = aiOutgoingCache.get(key);
  if (ts && Date.now() - ts < AI_CACHE_TTL) return true;
  return false;
}
function cleanupAICache() {
  const now = Date.now();
  for (const [key, ts] of aiOutgoingCache.entries()) {
    if (now - ts > AI_CACHE_TTL) aiOutgoingCache.delete(key);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default defineEventHandler(async (event) => {
  cleanupAICache();
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

  // Normalisasi nomor WA (hilangkan +, 0 di depan, dsb)
  function normalizePhone(num) {
    if (!num) return "";
    return num.replace(/^\+?0?/, "").replace(/[^0-9]/g, "");
  }
  const rawMeId = body?.me?.id || "";
  const rawPayloadFrom = body?.payload?.from || "";
  const meId = normalizePhone(rawMeId.replace("@c.us", ""));
  const payloadFrom = normalizePhone(rawPayloadFrom.replace("@c.us", ""));
  const payloadBody = body?.payload?.body || null;
  const fromMe = body?.payload?.fromMe || false;

  const isOutgoing = fromMe; // ubah: outgoing cukup cek fromMe
  const isIncomingUserMessage = !fromMe && payloadFrom !== meId;

  console.log("[WAHA Webhook] Branch check", {
    fromMe,
    rawMeId,
    rawPayloadFrom,
    meId,
    payloadFrom,
    isOutgoing,
    isIncomingUserMessage,
    metadata: body?.payload?.metadata,
  });

  if (isOutgoing) {
    // Cek apakah pesan outgoing ini baru saja dikirim oleh AI
    const outgoingContent = body?.payload?.body || body?.payload?.text || null;
    const outgoingTo = normalizePhone(
      (body?.payload?.to || body?.payload?.chatId || rawPayloadFrom).replace(
        "@c.us",
        ""
      )
    );
    // Cek metadata sender_type: ai
    const metaSenderType =
      body?.payload?.metadata?.sender_type || body?.metadata?.sender_type;
    if (metaSenderType === "ai" || isRecentAIMsg(outgoingTo, outgoingContent)) {
      console.log(
        "[WAHA Webhook] Outgoing message detected as AI (skip manual save)",
        { outgoingTo, outgoingContent }
      );
      return {
        status: "ok",
        message: "AI outgoing message detected (not saved as manual)",
      };
    }
    // Jika ini outgoing AI (dari proses auto-reply), cache pesan
    if (metaSenderType === "ai") {
      cacheAIMsg(outgoingTo, outgoingContent);
    }
    // Lanjutkan ke handler manual jika bukan AI
    console.log("[WAHA Webhook] Detected outgoing message (fromMe true)");
    const sentResult = await handleSentMessage({
      body,
      client,
      context: event.context,
      runtimeConfig,
      meId,
      payloadFrom,
    });
    console.log("[WAHA Webhook] Sent message handler result:", sentResult);
    return sentResult;
  } else if (isIncomingUserMessage) {
    console.log("[WAHA Webhook] Detected incoming message (user to chanel)");
    // --- Pindahkan blok pencarian/insert contact ke sini ---
    let contact_id = null;
    try {
      console.log("[WAHA Webhook] Checking/creating contact for:", payloadFrom);
      const contactRes = await $fetch("/api/contact", {
        method: "GET",
        query: { phone_number: payloadFrom },
      });
      if (
        contactRes &&
        contactRes.found &&
        contactRes.data &&
        contactRes.data.id
      ) {
        contact_id = contactRes.data.id;
        console.log("[WAHA Webhook] Existing contact found, ID:", contact_id);
      } else {
        const createRes = await $fetch("/api/contact", {
          method: "POST",
          body: {
            name: payloadFrom,
            phone_number: payloadFrom,
          },
        });
        if (createRes && createRes.data && createRes.data.id) {
          contact_id = createRes.data.id;
          console.log("[WAHA Webhook] New contact created, ID:", contact_id);
        } else {
          console.log("[WAHA Webhook] Failed to create contact");
        }
      }
    } catch (err) {
      console.log("[WAHA Webhook] Error cek/tambah contact", err);
    }
    // --- Setelah dapat contact_id, baru cek takeover ---
    const takeoverResult = await handleReceivedMessage({
      body,
      client,
      context: event.context,
      runtimeConfig,
      meId,
      payloadFrom,
      contactId: contact_id,
    });
    console.log("[WAHA Webhook] Takeover handler result:", takeoverResult);

    // === Selalu simpan pesan masuk ke database ===
    let saveAgentType = "manusia";
    if (takeoverResult && takeoverResult.takeover === false) {
      // takeover_ai = false, selalu manusia
      saveAgentType = "manusia";
    } else if (takeoverResult && takeoverResult.takeover === true) {
      if (takeoverResult.proceed === false) {
        // Masih dalam waktu takeover, manusia
        saveAgentType = "manusia";
      } else {
        // Sudah lewat waktu takeover, AI
        saveAgentType = "ai";
      }
    }
    // Simpan pesan masuk ke database
    try {
      const saveData = {
        agent_id: null, // agent_id bisa diisi jika ingin, atau null
        chanel_id: body?.metadata?.chanel_id || null,
        contact_id: contact_id,
        message_type: "text",
        agent_type: saveAgentType,
        chat_type: saveAgentType, // biar konsisten
        from: payloadFrom,
        to: meId,
        media_url: null,
        content: payloadBody,
      };
      console.log(
        "[WAHA Webhook] Saving incoming message to database:",
        saveData
      );
      const saveResult = await $fetch("/api/message", {
        method: "POST",
        body: saveData,
      });
      console.log(
        "[WAHA Webhook] Incoming message saved to database",
        saveResult
      );
    } catch (err) {
      console.log(
        "[WAHA Webhook] Error saving incoming message to database:",
        err
      );
    }

    // === Jika agent_type=ai dan proceed=true, lanjutkan auto-reply AI ===
    if (!(takeoverResult && takeoverResult.proceed === true)) {
      // Tidak perlu auto-reply AI
      return takeoverResult;
    }
    // 1. Cari agentai yang aktif di chanel_agent_connections
    const chanelIdToUse = body?.metadata?.chanel_id || null;
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
      console.log("[WAHA Webhook] No active agent found in chanel");
      return {
        status: "ok",
        results: [{ message: "Tidak ada agent aktif di chanel" }],
      };
    }
    // 2. Ambil config agent_ai_configs
    console.log("[WAHA Webhook] Fetching AI config for agent:", conn.agent_id);
    const { data: config, error: configErr } = await client
      .from("agent_ai_configs")
      .select("*")
      .eq("agent_id", conn.agent_id)
      .maybeSingle();
    console.log("[WAHA Webhook] AI config result:", { config, configErr });
    if (configErr || !config) {
      console.log("[WAHA Webhook] Config agent tidak ditemukan");
      return {
        status: "ok",
        results: [{ message: "Config agent tidak ditemukan" }],
      };
    }
    // 3. Fetch session name
    console.log("[WAHA Webhook] Fetching session name for presence");
    const { data: chanelDataPresence } = await client
      .from("chanels")
      .select("session_name")
      .eq("id", chanelIdToUse)
      .maybeSingle();
    const sessionNameForPresence = chanelDataPresence?.session_name;
    console.log(
      "[WAHA Webhook] Session name for presence:",
      sessionNameForPresence
    );
    // 4. Call AI (openrouter)
    let aiText, images;
    try {
      console.log(
        "[WAHA Webhook] Calling AI service with prompt:",
        payloadBody
      );
      const aiRes = await $fetch("/api/openrouter", {
        method: "POST",
        body: {
          prompt: payloadBody,
          knowledge: JSON.stringify(config),
        },
      });
      aiText = aiRes?.result;
      images = aiRes?.images;
      console.log("[WAHA Webhook] AI response received:", { aiText, images });
    } catch (err) {
      console.log("[WAHA Webhook] Error calling AI:", err);
      return {
        status: "error",
        message: "Gagal memanggil AI",
        detail: err?.message,
      };
    }
    if (!aiText) {
      console.log("[WAHA Webhook] No AI result");
      return {
        status: "ok",
        results: [{ message: "Tidak ada hasil dari AI" }],
      };
    }
    // Simpan prompt user ke database sebelum proses AI
    try {
      const userPromptData = {
        agent_id: conn.agent_id,
        chanel_id: chanelIdToUse,
        contact_id,
        message_type: "text",
        agent_type: "ai",
        chat_type: "ai",
        from: payloadFrom,
        to: meId,
        media_url: null,
        content: payloadBody,
      };
      console.log(
        "[WAHA Webhook] Saving user prompt to database:",
        userPromptData
      );
      const userPromptResult = await $fetch("/api/message", {
        method: "POST",
        body: userPromptData,
      });
      console.log(
        "[WAHA Webhook] User prompt saved to database",
        userPromptResult
      );
    } catch (err) {
      console.log("[WAHA Webhook] Error saving user prompt to database:", err);
    }
    // --- Efek typing sebelum kirim pesan ---
    try {
      if (sessionNameForPresence) {
        const typingBody = {
          chatId: payloadFrom + "@c.us",
          presence: "typing",
        };
        console.log("[WAHA Webhook] Sending typing presence:", typingBody);
        await $fetch(
          `${WAHA_BASE_URL}/api/${sessionNameForPresence}/presence`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": WAHA_API_KEY,
            },
            body: typingBody,
          }
        );
        console.log("[WAHA Webhook] Typing presence sent successfully");
        // Hitung durasi efek typing
        let typingMs = 0;
        if (aiText) {
          typingMs += Math.min(aiText.length * 50, 10000); // 50ms per karakter, max 10 detik
        }
        if (images && images.length > 0) {
          typingMs += 2000; // Tambah 2 detik jika ada media
        }
        if (typingMs > 0) {
          console.log(`[WAHA Webhook] Typing effect sleep for ${typingMs} ms`);
          await sleep(typingMs);
        }
      }
    } catch (err) {
      console.log("[WAHA Webhook] Error sending typing presence:", err);
    }
    // --- Baru setelah ini lakukan if (images && images.length > 0) { ... } else { ... } ---
    if (images && images.length > 0) {
      console.log("[WAHA Webhook] Sending image message(s)");
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
          metadata: {
            sender_type: "ai",
            agent_id: conn.agent_id,
            is_auto_reply: true,
          },
        };
        console.log("[WAHA Webhook] Image message body:", messageBody);
        try {
          await $fetch(`${WAHA_BASE_URL}/api/sendImage`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": WAHA_API_KEY,
            },
            body: messageBody,
          });
          console.log("[WAHA Webhook] Image sent successfully via WAHA");
          // Simpan pesan AI (image) ke database
          const saveData = {
            agent_id: conn.agent_id,
            chanel_id: chanelIdToUse,
            contact_id,
            message_type: "image",
            agent_type: "ai",
            chat_type: "ai", // tambahkan ini
            from: meId,
            to: payloadFrom,
            media_url: imgUrl,
            content: aiText, // caption dari AI
          };
          console.log(
            "[WAHA Webhook] Saving AI image message to database:",
            saveData
          );
          const saveResult = await $fetch("/api/message", {
            method: "POST",
            body: saveData,
          });
          console.log(
            "[WAHA Webhook] AI image message saved to database",
            saveResult
          );
        } catch (err) {
          console.log("[WAHA Webhook] Error sending/saving image:", err);
          return {
            status: "error",
            message: "Gagal kirim/simpan image AI",
            detail: err?.message,
          };
        }
      }
    } else {
      // Kirim text saja ke /api/sendText jika tidak ada gambar
      try {
        const messageBody = {
          session: sessionNameForPresence,
          chatId: payloadFrom + "@c.us",
          text: aiText,
          metadata: {
            sender_type: "ai",
            agent_id: conn.agent_id,
            is_auto_reply: true,
          },
        };
        console.log("[WAHA Webhook] Sending text to WAHA:", messageBody);
        await $fetch(`${WAHA_BASE_URL}/api/sendText`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": WAHA_API_KEY,
          },
          body: messageBody,
        });
        console.log("[WAHA Webhook] Text sent successfully via WAHA");
        // Simpan pesan AI ke database
        const saveData = {
          agent_id: conn.agent_id,
          chanel_id: chanelIdToUse,
          contact_id,
          message_type: "text",
          agent_type: "ai",
          chat_type: "ai", // tambahkan ini
          from: meId,
          to: payloadFrom,
          media_url: null,
          content: aiText,
        };
        console.log("[WAHA Webhook] Saving AI message to database:", saveData);
        const saveResult = await $fetch("/api/message", {
          method: "POST",
          body: saveData,
        });
        console.log("[WAHA Webhook] AI message saved to database", saveResult);
      } catch (err) {
        console.log("[WAHA Webhook] Error sending/saving text:", err);
        return {
          status: "error",
          message: "Gagal kirim/simpan pesan AI",
          detail: err?.message,
        };
      }
    }
    console.log("[WAHA Webhook] === AUTO-REPLY AI PROCESS END ===");
    const result = {
      status: "ok",
      takeover: takeoverResult.takeover,
      proceed: true,
      message: "Auto-reply AI sent and saved",
    };
    console.log("[WAHA Webhook] Final return:", result);
    return result;
  } else {
    console.log(
      "[WAHA Webhook] Message ignored (not incoming user message, not outgoing)",
      {
        fromMe,
        payloadFrom,
        meId,
      }
    );
    return {
      status: "ok",
      message: "Message ignored (not incoming user message, not outgoing)",
    };
  }
});
