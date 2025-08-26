import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const body = await readBody(event);
  const { prompt, knowledge, media, from, to, agentConfig } = body;
  const apiKey = useRuntimeConfig().openAiKey;

  // Log untuk debugging
  console.log("[OpenRouter] Request body keys:", Object.keys(body));
  console.log("[OpenRouter] agentConfig provided:", !!agentConfig);
  if (agentConfig?.ongkir_config) {
    console.log("[OpenRouter] ongkir_config found:", Object.keys(agentConfig.ongkir_config));
  }

  if (!apiKey) {
    return { error: "OPEN_AI_KEY not set in env" };
  }
  if (!prompt) {
    return { error: "Prompt is required" };
  }

  // Fetch conversation history from DB
  let conversationHistory = [];
  if (from && to) {
    const { data: dbMessages, error } = await supabase
      .from('messages')
      .select('content, from') // Select 'from' to determine role
      .or(`and(from.eq.${from},to.eq.${to}),and(from.eq.${to},to.eq.${from})`)
      .order('created_at', { ascending: false })
      .limit(10); // Increased from 4 to 10 for better context

    if (error) {
      console.error('Error fetching conversation history:', error.message);
      return { error: 'Failed to fetch conversation history.' };
    }

    if (dbMessages) {
      // 'from' in the request body is the user's ID.
      // We map db messages to the {role, content} format.
      conversationHistory = dbMessages
        .reverse() // Chronological order
        .map(msg => ({
          role: msg.from === from ? 'user' : 'assistant',
          content: msg.content
        }));
      
      // Log conversation history for debugging
      console.log("[OpenRouter] Conversation history loaded:", conversationHistory.length, "messages");
      console.log("[OpenRouter] Last 3 messages:", conversationHistory.slice(-3));
    }
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
Kamu adalah AI customer service yang sangat patuh pada aturan. Aturan paling penting adalah **JANGAN PERNAH MENANYAKAN INFORMASI YANG SUDAH DIBERIKAN USER**. Selalu periksa riwayat percakapan sebelum bertanya.

**ATURAN WAJIB SEBELUM MEMBALAS:**
1. **CEK RIWAYAT**: Apa saja yang sudah ditanyakan AI? Apa saja yang sudah dijawab oleh User?
2. **IDENTIFIKASI INFORMASI**: Informasi apa yang sudah ada? (Contoh: nama produk, jumlah, alamat, jasa pengiriman).
3. **JANGAN MENGULANG**: Jika informasi sudah ada, JANGAN tanya lagi. Langsung gunakan informasi itu untuk melanjutkan ke tahap berikutnya.

**CONTOH ALUR YANG SALAH (DILARANG KERAS):**
1. User memilih jasa pengiriman "JNE".
2. AI meminta alamat.
3. User memberikan alamat.
4. AI bertanya lagi: "Mau pakai jasa pengiriman apa?" -> **INI FATAL! AI MENGULANG PERTANYAAN YANG SUDAH TERJAWAB.**

**CONTOH ALUR YANG BENAR:**
- **Situasi 1: User sudah sebut jasa pengiriman.**
  - User: "Saya mau kirim pakai JNE."
  - AI: "Baik, untuk pengiriman dengan JNE, boleh minta alamat lengkapnya?"
  - User: "Jalan Mawar no 10, Jakarta."
  - AI: "Oke, pengiriman dengan JNE ke Jalan Mawar no 10. Berikut rinciannya..." (LANGSUNG hitung total).

- **Situasi 2: User belum sebut jasa pengiriman.**
  - AI: "Boleh minta alamat lengkapnya?"
  - User: "Jalan Mawar no 10, Jakarta."
  - AI: "Terima kasih. Ini pilihan jasa pengirimannya..." (Tawarkan JNE, J&T, dll).
  - User: "Pilih JNE."
  - AI: "Baik, pakai JNE ya. Berikut rinciannya..." (LANGSUNG hitung total).

Patuhi aturan di atas dengan ketat.

Berikut adalah konfigurasi agent dalam bentuk JSON:
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
  - alamat pengiriman: alamat pengiriman barang
  - jasaPengiriman: array jasa pengiriman yang tersedia
  - tarifPerKg: object dengan key jasa pengiriman dan value tarif per kg
- kepintaran: semakin tinggi, semakin kreatif dan variatif balasan AI.

FLOW PEMBELIAN DENGAN KONTEKS:
1. User menyebutkan produk → konfirmasi produk → tanya jumlah
2. User kasih jumlah → minta alamat
3. User kasih alamat → tawarkan SEMUA jasa pengiriman + tarif → tanya pilihan
4. User pilih jasa (misal "JNE saja") → LANGSUNG hitung ongkir → detail pembelian → konfirmasi

PENTING UNTUK PERHITUNGAN ONGKIR:
1. Ketika user menyebutkan nama produk, konfirmasi produk dan tanyakan jumlah pemesanan.
2. Setelah user memberikan jumlah, minta alamat pengiriman.
3. Setelah user memberikan alamat (biasanya berupa nama jalan, desa, kecamatan, kabupaten), JANGAN langsung hitung ongkir.
4. Tampilkan SEMUA jasa pengiriman yang tersedia dari ${agentConfig?.ongkir_config?.jasaPengiriman ? JSON.stringify(agentConfig.ongkir_config.jasaPengiriman) : '["JNE", "J&T", "SiCepat"]'} beserta tarifnya dari ${agentConfig?.ongkir_config?.tarifPerKg ? JSON.stringify(agentConfig.ongkir_config.tarifPerKg) : '{"JNE": 9000, "J&T": 9500, "SiCepat": 8500}'}. Sampaikan juga bahwa tarif ini berlaku untuk berat hingga 1 kg (pesanan di bawah 1 kg akan dihitung sebagai 1 kg).
5. Tanyakan ke user, "Mau pakai jasa pengiriman apa?".
6. SETELAH USER PILIH JASA (misal: "JNE saja", "pake J&T", "SiCepat aja"), LANGSUNG hitung ongkir dengan rumus:
   - Hitung berat total = jumlah_pemesanan x berat_produk.
   - Konversi berat total ke kg: jika weight_unit adalah "gram", bagi berat total dengan 1000. Sebut hasilnya berat_total_kg.
   - PENTING: Jika berat_total_kg kurang dari 1, maka bulatkan menjadi 1 kg. Sebut hasilnya berat_final_ongkir.
   - Ongkir = tarif_ongkir_per_kg_dipilih × berat_final_ongkir.
   - Total = (harga_produk × jumlah_pemesanan) + ongkir.
7. Berikan detail perhitungan: harga produk, ongkir (sebutkan jasa pengiriman yang dipilih dan berat_final_ongkir), dan total.
8. **Setelah memberikan rincian total, LANGSUNG sampaikan metode pembayaran yang tersedia berdasarkan informasi dari 'knowledge' (misal: "Silakan lakukan pembayaran ke rekening BCA 1234567890 a/n PT. Sejahtera"). Minta user untuk melakukan transfer dan mengirim bukti pembayaran untuk proses selanjutnya.**
9. Untuk alamat, perhatikan pola:
   - Jika mengandung kata seperti "jalan", "desa", "rt/rw", "kelurahan", "kecamatan", "kabupaten", "kota" - itu adalah alamat.
   - Jika mengandung nama tempat yang jelas (contoh: "tanjunggunung,tanjungharjo,kulon progo,yogyakarta") - itu adalah alamat.
   - JANGAN minta konfirmasi ulang untuk alamat yang sudah jelas.

CONTOH ALUR DENGAN KONTEKS YANG BENAR:
- Produk: Baju (harga: Rp 150.000, berat: 300 gram)
CONTOH ALUR DENGAN KONTEKS YANG BENAR:
- Produk: Baju (harga: Rp 150.000, berat: 300 gram)
- Jumlah: 2 unit (total berat 600 gram = 0.6 kg)
- User: "Saya mau pesan Baju 2 unit"
- AI: "Baik, kak. Untuk pengiriman, boleh minta alamat lengkapnya?"
- User: "kirim ke jalan merdeka no 5, jakarta"
- AI: "Terima kasih. Berikut pilihan jasa pengiriman yang tersedia. Tarif ini berlaku untuk berat hingga 1 kg ya kak, jadi pesanan di bawah 1 kg akan dihitung 1 kg.
  - JNE: Rp 9.000/kg
  - J&T: Rp 9.500/kg
  - SiCepat: Rp 8.500/kg
Mau pakai jasa pengiriman apa, kak?"
- User: "JNE saja kak" [KONTEKS: User memilih JNE dari pilihan yang baru ditawarkan]
- AI: "Oke, pakai JNE ya. Total berat pesanan kakak 0.6 kg, untuk ongkir kami bulatkan menjadi 1 kg. Berikut detail pembeliannya:
  - Produk: Baju (2 unit)
  - Harga: Rp 300.000 (2 x Rp 150.000)
  - Ongkir ke jalan merdeka no 5, jakarta: Rp 9.000 (JNE, berat dihitung 1 kg)
  - Total: Rp 309.000
Silakan lakukan pembayaran ke rekening BCA 1234567890 a/n PT. Sejahtera. Mohon kirim bukti transfer setelah pembayaran ya, kak."

CONTOH SALAH (YANG HARUS DIHINDARI):
- AI baru tawarkan pilihan JNE/J&T/SiCepat
- User: "JNE saja kak"
- AI: "Mau beli berapa kak?" ❌ SALAH! Ini mengabaikan konteks bahwa user baru memilih jasa pengiriman
- AI: "Oke, pakai JNE ya. Totalnya Rp 309.000. Mau diproses?" ❌ KURANG LENGKAP! Tidak ada info pembayaran.

SELALU INGAT: Baca konteks → Pahami tahap → Lanjutkan flow yang tepat

Selalu gunakan gaya bicara, pengetahuan, dan patuhi semua aturan di atas saat membalas user.

Berikut knowledge agent:
`;
  systemPrompt += knowledge || "";
  // Build message history with context
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory, // Use the fetched and formatted history
    { 
      role: "system", 
      content: `ANALISIS KONTEKS SEBELUM MEMBALAS:
1. Periksa pesan-pesan sebelumnya untuk memahami tahap percakapan saat ini
2. Jika AI baru saja menanyakan sesuatu, dan user memberikan jawaban, lanjutkan sesuai jawaban tersebut
3. Jangan mengulang pertanyaan yang sudah dijawab
4. Khusus untuk jasa pengiriman: jika user memilih dari pilihan yang baru ditawarkan (JNE/J&T/SiCepat), langsung hitung ongkir dan berikan detail pembelian
5. Pastikan respons sesuai dengan konteks percakapan yang sedang berlangsung`
    },
    { role: "user", content: prompt }
  ];
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.VITE_PUBLIC_BASE_URL, // Ganti dengan domain Anda jika sudah live
          "X-Title": "NUTRA CS", // Optional, branding
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini", // atau model lain yang tersedia di akun OpenRouter Anda
          messages: messages.filter(m => m.content), // Filter out empty messages
          max_tokens: 512,
          temperature: 0.3, // Reduced temperature for more consistent context following
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