import { OpenAI } from "openai";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { prompt, knowledge } = body;
  const apiKey = process.env.OPEN_AI_KEY;
  if (!apiKey) {
    return { error: "OPEN_AI_KEY not set in env" };
  }
  if (!prompt) {
    return { error: "Prompt is required" };
  }
  const openai = new OpenAI({ apiKey });
  const systemPrompt = knowledge
    ? `Gunakan pengetahuan berikut untuk menjawab pertanyaan user:\n${knowledge}\n\nPertanyaan: ${prompt}`
    : prompt;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: knowledge || "" },
        { role: "user", content: prompt },
      ],
      max_tokens: 512,
      temperature: 0.7,
    });
    return { result: completion.choices[0].message.content };
  } catch (e) {
    return { error: e.message };
  }
});