import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("WAHA WEBHOOK EVENT:", body);

  // Simpan ke database Supabase
  try {
    const client = serverSupabaseClient(event);
    const { error } = await client.from("waha_webhook_events").insert([
      {
        event_type: body?.event || null, // jika ada field event, simpan, jika tidak null
        payload: body,
      },
    ]);
    if (error) {
      console.error("Gagal insert ke waha_webhook_events:", error);
    }
  } catch (err) {
    console.error("Error Supabase:", err);
  }

  // TODO: Tambahkan logika penanganan event sesuai kebutuhan
  return { status: "ok", received: body };
});
