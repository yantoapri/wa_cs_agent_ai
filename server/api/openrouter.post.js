export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { prompt, knowledge, media } = body;
  const apiKey = useRuntimeConfig().openAiKey;
  if (!apiKey) {
    return { error: "OPEN_AI_KEY not set in env" };
  }
  if (!prompt) {
    return { error: "Prompt is required" };
  }
  // Jika ada media dari user, hanya proses jika image
  if (media) {
    if (media.mimetype && media.mimetype.includes("image")) {
      console.log("[OpenRouter] User sent image media:", media);
      // Di sini bisa tambahkan logic jika ingin memproses image lebih lanjut
    } else {
      console.log("[OpenRouter] User sent non-image media, ignored:", media);
      // Media bukan image, diabaikan
    }
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
- products: daftar produk yang tersedia (JSON array). Setiap produk memiliki: id, name, description, price, stock, weight, weight_unit, discount, image.
- ongkir_config: konfigurasi ongkir yang berisi:
  - provinsiPengirim, kotaPengirim, kecamatanPengirim: alamat pengirim
  - jasaPengiriman: array jasa pengiriman yang tersedia
  - tarifPerKg: object dengan key jasa pengiriman dan value tarif per kg
- kepintaran: semakin tinggi, semakin kreatif dan variatif balasan AI.

PENTING UNTUK PERHITUNGAN ONGKIR:
Ketika user ingin membeli produk dan menanyakan total pembayaran:
1. JANGAN langsung berikan total pembayaran
2. TANYAKAN dulu alamat pengiriman user (provinsi, kota, kecamatan)
3. Setelah user memberikan alamat, baru hitung ongkir dengan rumus:
   - Konversi berat produk ke kg: jika weight_unit = "gram", bagi dengan 1000
   - Ongkir = jumlah_pemesanan × (tarif_ongkir_per_kg × berat_produk_dalam_kg)
   - Total = (harga_produk × jumlah_pemesanan) + ongkir
4. Berikan detail perhitungan: harga produk, ongkir, dan total

CONTOH PERHITUNGAN:
- Produk: Laptop (harga: Rp 15.000.000, berat: 2500 gram = 2.5 kg)
- Jumlah: 1 unit
- Tarif JNE: Rp 8.000/kg
- Ongkir = 1 × (Rp 8.000 × 2.5 kg) = Rp 20.000
- Total = (Rp 15.000.000 × 1) + Rp 20.000 = Rp 15.020.000

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
          "X-Title": "NUTRA CS", // Optional, branding
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
