import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const client = createClient(
    runtimeConfig.public.supabaseUrl,
    runtimeConfig.supabaseServiceRoleKey
  );

  // 1. Ambil semua channel dengan takeover_ai = true
  const { data: channels } = await client
    .from("chanels")
    .select("id, session_name, takeover_ai, waktu_takeover")
    .eq("takeover_ai", true);

  let triggered = [];
  for (const chanel of channels) {
    // 2. Cari semua pesan user terakhir (from != session_name) di channel ini
    const { data: userMsgs } = await client
      .from("messages")
      .select("id, contact_id, chanel_id, created_at, from, to")
      .eq("chanel_id", chanel.id)
      .order("created_at", { ascending: false });

    // Group by contact_id, ambil pesan user terakhir per contact
    const lastUserMsgs = {};
    for (const msg of userMsgs) {
      if (!lastUserMsgs[msg.contact_id] && msg.from !== chanel.session_name) {
        lastUserMsgs[msg.contact_id] = msg;
      }
    }

    for (const contactId in lastUserMsgs) {
      const userMsg = lastUserMsgs[contactId];
      const now = new Date();
      const lastMsgTime = new Date(userMsg.created_at);
      const diffMinutes = (now - lastMsgTime) / (1000 * 60);
      if (diffMinutes > chanel.waktu_takeover) {
        // 3. Cek apakah sudah ada balasan manusia setelah pesan user terakhir
        const { data: humanReply } = await client
          .from("messages")
          .select("id")
          .eq("chanel_id", chanel.id)
          .eq("contact_id", contactId)
          .eq("from", chanel.session_name)
          .gt("created_at", userMsg.created_at)
          .limit(1)
          .maybeSingle();
        // 4. Cek apakah sudah ada balasan AI setelah pesan user terakhir
        const { data: aiReply } = await client
          .from("messages")
          .select("id")
          .eq("chanel_id", chanel.id)
          .eq("contact_id", contactId)
          .eq("agent_type", "ai")
          .gt("created_at", userMsg.created_at)
          .limit(1)
          .maybeSingle();
        if (!humanReply && !aiReply) {
          // 5. Trigger AI auto-reply
          await $fetch("/api/trigger-ai-reply", {
            method: "POST",
            body: {
              chanel_id: chanel.id,
              contact_id: contactId,
              message_id: userMsg.id,
            },
          });
          triggered.push({
            chanel_id: chanel.id,
            contact_id: contactId,
            message_id: userMsg.id,
          });
        }
      }
    }
  }
  return { status: "ok", triggered };
});
