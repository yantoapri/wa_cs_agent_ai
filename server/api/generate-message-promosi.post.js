export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { product } = body;
  const apiKey = useRuntimeConfig().openAiKey;
  
  if (!apiKey) {
    return { error: "OPEN_AI_KEY not set in env" };
  }
  
  if (!product) {
    return { error: "Product details are required" };
  }

  // Compose system prompt for promotional message generation
  const systemPrompt = `
Kamu adalah AI marketing specialist yang ahli dalam membuat pesan promosi yang menarik dan persuasif untuk WhatsApp.

Tugas kamu adalah membuat pesan promosi berdasarkan detail produk yang diberikan. Pesan harus:
1. Menarik dan eye-catching
2. Menyebutkan keunggulan produk
3. Menyertakan harga dan diskon (jika ada)
4. Menggunakan emoji yang relevan
5. Memiliki call-to-action yang jelas
6. Panjang pesan maksimal 500 karakter
7. Menggunakan bahasa Indonesia yang sopan dan profesional

Format pesan yang diharapkan:
- Pembuka yang menarik
- Detail produk (nama, deskripsi singkat, harga)
- Keunggulan/benefit produk
- Call-to-action untuk membeli
- Informasi kontak atau cara pemesanan

Berikut detail produk yang akan dipromosikan:
`;

  const userPrompt = `
Nama Produk: ${product.name}
Deskripsi: ${product.description || 'Tidak ada deskripsi'}
Harga: Rp ${product.price?.toLocaleString('id-ID') || '0'}
Stok: ${product.stock || 0} unit
Berat: ${product.weight || 0} ${product.weight_unit || 'gram'}
Diskon: ${product.discount ? product.discount + '%' : 'Tidak ada diskon'}
Gambar: ${product.image || 'Tidak ada gambar'}

Buat pesan promosi yang menarik berdasarkan informasi produk di atas.
`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "NUTRA CS",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages,
          max_tokens: 300,
          temperature: 0.8,
        }),
      }
    );
    
    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      const resultText = data.choices[0].message.content;
      return { result: resultText.trim() };
    }
    
    return { error: data.error?.message || "No response from OpenRouter" };
  } catch (e) {
    return { error: e.message };
  }
}); 