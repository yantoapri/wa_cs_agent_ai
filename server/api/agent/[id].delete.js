import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const runtimeConfig = useRuntimeConfig();
  const client = createClient(
    runtimeConfig.public.supabaseUrl,
    runtimeConfig.supabaseServiceRoleKey
  );

  // Hapus dari tabel agent_ai_configs
  await client.from("agent_ai_configs").delete().eq("agent_id", id);

  // Hapus dari tabel channel_agent_connections
  await client.from("channel_agent_connections").delete().eq("agent_id", id);

  // Hapus dari tabel messages
  await client.from("messages").delete().eq("agent_id", id);

  // Hapus dari tabel agents
  const { error } = await client.from("agents").delete().eq("id", id);

  if (error) {
    return { error: true, message: error.message };
  }
  return { error: false, message: "Agent and all related data deleted" };
});
