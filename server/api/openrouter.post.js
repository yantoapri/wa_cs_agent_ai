export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { prompt, knowledge } = body;
  const apiKey = useRuntimeConfig().openAiKey;
  if (!apiKey) {
    return { error: "OPEN_AI_KEY not set in env" };
  }
  if (!prompt) {
    return { error: "Prompt is required" };
  }
  // Compose system prompt agar AI memahami struktur knowledge
  let systemPrompt = `
Kamu adalah AI customer service. Berikut adalah konfigurasi agent dalam bentuk JSON:
- gayaBicara: gunakan gaya bicara ini dalam setiap balasan.
- pengetahuan: gunakan sebagai referensi pengetahuan untuk menjawab pertanyaan user.
- handoverList: jika pesan user mengandung salah satu keyword di list ini, AI harus berhenti membalas dan lakukan handover ke manusia.
- followupDelay: jika pesan user tidak membalas setelah waktu ini, AI harus berhenti membalas dan lakukan followup.
- followupList: jika pesan user sama dengan keyword di list ini, cek mode:
  - Jika mode 'manual', balas dengan reply yang sudah disediakan.
  - Jika mode 'generate', buat balasan AI sendiri untuk mengakhiri chat dengan user.
- kirimGambarList: jika pesan user mengandung salah satu keyword di list ini, balas dengan gambar (tampilkan URL gambar) sesuai keyword.
- kepintaran: semakin tinggi, semakin kreatif dan variatif balasan AI.

Selalu gunakan gaya bicara, pengetahuan, dan patuhi semua aturan di atas saat membalas user.

Berikut knowledge agent:
`;
  systemPrompt += knowledge || "";
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // Ganti dengan domain Anda jika sudah live
          "X-Title": "OsmoChat", // Optional, branding
        },
        body: JSON.stringify({
          model: "openai/gpt-4o", // atau model lain yang tersedia di akun OpenRouter Anda
          messages,
          max_tokens: 512,
          temperature: 0.7,
        }),
      }
    );
    const data = await response.json();
    if (data.choices && data.choices[0]) {
      const resultText = data.choices[0].message.content;
      // Cari semua URL gambar dalam text
      const imageUrls = Array.from(
        resultText.matchAll(/https?:\/\/(\S+\.(?:jpg|jpeg|png|gif|webp))/gi),
        (m) => m[0]
      );
      // Hapus URL gambar dari teks
      let cleanText = resultText;
      if (imageUrls.length > 0) {
        imageUrls.forEach((url) => {
          cleanText = cleanText
            .replace(url, "")
            .replace(/\s{2,}/g, " ")
            .trim();
        });
        return { result: cleanText, images: imageUrls };
      }
      return { result: cleanText };
    }
    return { error: data.error?.message || "No response from OpenRouter" };
  } catch (e) {
    return { error: e.message };
  }
});
