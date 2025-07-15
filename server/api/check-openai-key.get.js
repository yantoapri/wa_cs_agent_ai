export default defineEventHandler(async (event) => {
  const openAiKey = process.env.OPEN_AI_KEY;
  if (openAiKey) {
    return {
      status: "ok",
      message: "OPEN_AI_KEY is set",
      keyPreview: openAiKey.slice(0, 8) + "...",
    };
  } else {
    return { status: "error", message: "OPEN_AI_KEY is NOT set in env" };
  }
});
