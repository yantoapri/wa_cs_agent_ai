<template>
  <div class="min-h-screen flex flex-col bg-white text-gray-800">
    <!-- Navbar -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/assets/img/nutra.png" alt="Nutra" class="h-8 w-8" />
          <span class="font-semibold">Nutra AI Chat</span>
        </div>
        <nav class="hidden md:flex items-center gap-6">
          <a href="#home" class="hover:text-blue-600">Home</a>
          <a href="#features" class="hover:text-blue-600">Features</a>
          <a href="#pricing" class="hover:text-blue-600">Pricing</a>
          <NuxtLink to="/doc" class="hover:text-blue-600">Document</NuxtLink>
          <NuxtLink to="/login" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Login</NuxtLink>
        </nav>
        <!-- Mobile: simple links -->
        <div class="md:hidden">
          <NuxtLink to="/login" class="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm">Login</NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero / Home -->
    <section id="home" class="bg-gradient-to-b from-blue-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 class="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900">
            Pusat Percakapan Pelanggan dengan Agent AI & Manusia
          </h1>
          <p class="mt-4 text-gray-600 text-lg">
            Kelola WhatsApp dan channel lainnya dalam satu dashboard. Tingkatkan respons, skala layanan, dan efisiensi tim.
          </p>
          <div class="mt-8 flex items-center gap-3">
            <NuxtLink to="/login" class="px-5 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Mulai Sekarang</NuxtLink>
            <NuxtLink to="/doc" class="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Lihat Dokumentasi</NuxtLink>
          </div>
        </div>
        <div class="md:justify-self-end">
          <div class="relative">
            <div class="absolute -inset-4 bg-blue-100 rounded-3xl rotate-2"></div>
            <div class="relative bg-white border border-gray-200 shadow-xl rounded-3xl p-6">
              <div class="flex items-center gap-3">
                <img src="/assets/img/nutra.png" class="h-10 w-10" alt="Nutra" />
                <div>
                  <div class="font-semibold">Nutra Ai Agent</div>
                  <div class="text-sm text-gray-500">Wa Channel chat & AI agent</div>
                </div>
              </div>
              <div class="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div class="text-2xl font-bold">99.9%</div>
                  <div class="text-xs text-gray-500">Uptime</div>
                </div>
                <div>
                  <div class="text-2xl font-bold">24/7</div>
                  <div class="text-xs text-gray-500">Dukungan</div>
                </div>
                <div>
                  <div class="text-2xl font-bold">#1</div>
                  <div class="text-xs text-gray-500">Kemudahan</div>
                </div>
              </div>
              <div class="mt-6 text-sm text-gray-500">Terintegrasi dengan WhatsApp.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features / Services Section -->
    <section id="features" class="py-16 md:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Fitur Unggulan Kami
          </h2>
          <p class="text-lg text-gray-600 max-w-3xl mx-auto">
            Tingkatkan efisiensi bisnis Anda dengan berbagai fitur canggih yang dirancang khusus untuk kebutuhan modern
          </p>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Custom AI Agent Auto Reply -->
          <div class="group relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="absolute top-4 right-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="mb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-2">Custom AI Agent</h3>
              <h4 class="text-sm font-semibold text-blue-600 mb-3">Auto Reply Cerdas</h4>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              AI yang dapat dipersonalisasi sesuai karakter bisnis Anda. Otomatis membalas pelanggan dengan respon yang relevan dan natural 24/7.
            </p>
            <div class="mt-4 flex items-center text-blue-600 text-sm font-medium">
              <span>Pelajari Lebih Lanjut</span>
              <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <!-- Multi Channels -->
          <div class="group relative bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="absolute top-4 right-4 w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <div class="mb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-2">Multi Channels</h3>
              <h4 class="text-sm font-semibold text-indigo-600 mb-3">Kelola Semua Platform</h4>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              Kelola WhatsApp, Telegram, Instagram, dan platform chat lainnya dalam satu dashboard terpusat. Efisiensi maksimal untuk tim Anda.
            </p>
            <div class="mt-4 flex items-center text-indigo-600 text-sm font-medium">
              <span>Hubungkan Channel</span>
              <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <!-- Broadcast Pesan -->
          <div class="group relative bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="absolute top-4 right-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
              </svg>
            </div>
            <div class="mb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-2">Broadcast Pesan</h3>
              <h4 class="text-sm font-semibold text-green-600 mb-3">Jangkau Ribuan Pelanggan</h4>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              Kirim pesan promosi, pengumuman, atau update ke ribuan kontak sekaligus. Dengan fitur personalisasi untuk tingkat keterbacaan yang tinggi.
            </p>
            <div class="mt-4 flex items-center text-green-600 text-sm font-medium">
              <span>Mulai Broadcast</span>
              <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <!-- Inbox Message History -->
          <div class="group relative bg-gradient-to-br from-cyan-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="absolute top-4 right-4 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
            </div>
            <div class="mb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-2">Inbox & History</h3>
              <h4 class="text-sm font-semibold text-cyan-600 mb-3">Riwayat Percakapan</h4>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              Kelola inbox terpusat dan akses riwayat percakapan lengkap. Pencarian advanced dan backup otomatis untuk semua chat history.
            </p>
            <div class="mt-4 flex items-center text-cyan-600 text-sm font-medium">
              <span>Lihat Inbox</span>
              <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <!-- Schedule Pesan -->
          <div class="group relative bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="absolute top-4 right-4 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="mb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-2">Schedule Pesan</h3>
              <h4 class="text-sm font-semibold text-purple-600 mb-3">Atur Waktu Otomatis</h4>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              Jadwalkan pesan untuk dikirim di waktu yang tepat. Perfect untuk reminder, follow-up, atau kampanye marketing yang terencana.
            </p>
            <div class="mt-4 flex items-center text-purple-600 text-sm font-medium">
              <span>Atur Jadwal</span>
              <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <!-- Multi Promotion Produk -->
          <div class="group relative bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="absolute top-4 right-4 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <div class="mb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-2">Multi Promotion</h3>
              <h4 class="text-sm font-semibold text-orange-600 mb-3">Kelola Katalog Produk</h4>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              Kelola dan promosikan berbagai produk sekaligus dengan fitur katalog terintegrasi. Dilengkapi dengan gambar, deskripsi, dan harga.
            </p>
            <div class="mt-4 flex items-center text-orange-600 text-sm font-medium">
              <span>Kelola Produk</span>
              <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <!-- Import Kontak -->
          <div class="group relative bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="absolute top-4 right-4 w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <div class="mb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-2">Import Kontak</h3>
              <h4 class="text-sm font-semibold text-teal-600 mb-3">Mudah & Massal</h4>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              Import ribuan kontak sekaligus dari file CSV atau Excel. Kelompokkan kontak berdasarkan kategori untuk targeting yang lebih efektif.
            </p>
            <div class="mt-4 flex items-center text-teal-600 text-sm font-medium">
              <span>Import Sekarang</span>
              <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <!-- Agent Manusia -->
          <div class="group relative bg-gradient-to-br from-rose-50 to-pink-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="absolute top-4 right-4 w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="mb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-2">Agent Manusia</h3>
              <h4 class="text-sm font-semibold text-rose-600 mb-3">Take Over Chat</h4>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              Handoff seamless dari AI ke agent manusia ketika diperlukan percakapan personal atau AI tidak dapat memberikan jawaban yang memuaskan.
            </p>
            <div class="mt-4 flex items-center text-rose-600 text-sm font-medium">
              <span>Kelola Agent</span>
              <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Call to Action for Features -->
        <div class="mt-16 text-center">
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 class="text-2xl md:text-3xl font-bold mb-4">
              Siap Merasakan Semua Fitur Canggih Ini?
            </h3>
            <p class="text-blue-100 mb-6 max-w-2xl mx-auto">
              Dapatkan akses ke semua fitur premium dengan free trial 3 hari. Tidak perlu kartu kredit!
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <NuxtLink to="/login" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Mulai Free Trial
              </NuxtLink>
              <NuxtLink to="/doc" class="border border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Pelajari Lebih Lanjut
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-16 md:py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Cara Kerja Platform
          </h2>
          <p class="text-lg text-gray-600 max-w-3xl mx-auto">
            Hanya 3 langkah mudah untuk mulai menggunakan Nutra AI Chat
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="text-center">
            <div class="relative mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <span class="text-2xl font-bold text-blue-600">1</span>
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Daftar & Setup</h3>
            <p class="text-gray-600">
              Buat akun gratis dan hubungkan WhatsApp Business API Anda. Proses setup hanya 5 menit!
            </p>
          </div>

          <!-- Step 2 -->
          <div class="text-center">
            <div class="relative mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <span class="text-2xl font-bold text-green-600">2</span>
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Konfigurasi AI</h3>
            <p class="text-gray-600">
              Latih AI Agent sesuai dengan karakteristik bisnis Anda. Upload katalog produk dan atur auto-reply.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="text-center">
            <div class="relative mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <span class="text-2xl font-bold text-purple-600">3</span>
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Mulai Beroperasi</h3>
            <p class="text-gray-600">
              Platform siap digunakan! AI akan menangani chat 24/7 dan Anda bisa monitor semuanya dari dashboard.
            </p>
          </div>
        </div>

        <!-- Connection Arrows for Desktop -->
        <div class="hidden md:block relative mt-8">
          <div class="absolute top-1/2 left-1/4 transform -translate-y-1/2 text-gray-300">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </div>
          <div class="absolute top-1/2 right-1/4 transform -translate-y-1/2 text-gray-300">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials / Stats Section -->
    <section class="py-16 md:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Dipercaya Oleh Ribuan Bisnis
          </h2>
          <p class="text-lg text-gray-600">
            Bergabunglah dengan komunitas bisnis yang sudah merasakan manfaatnya
          </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1000+</div>
            <div class="text-gray-600 text-sm">Bisnis Aktif</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-green-600 mb-2">50K+</div>
            <div class="text-gray-600 text-sm">Pesan Terkirim</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-purple-600 mb-2">95%</div>
            <div class="text-gray-600 text-sm">Tingkat Kepuasan</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-orange-600 mb-2">24/7</div>
            <div class="text-gray-600 text-sm">Support Available</div>
          </div>
        </div>

        <!-- Simple Testimonials -->
        <div class="grid md:grid-cols-4 gap-6">
          <div class="bg-gray-50 rounded-xl p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span class="text-blue-600 font-semibold">AB</span>
              </div>
              <div>
                <div class="font-semibold text-gray-900">Ahmad Budi</div>
                <div class="text-sm text-gray-500">Toko Online Fashion</div>
              </div>
            </div>
            <p class="text-gray-600 text-sm italic">
              "Response time pelanggan meningkat 300%. AI Agent sangat membantu melayani customer 24/7 tanpa henti."
            </p>
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span class="text-green-600 font-semibold">SM</span>
              </div>
              <div>
                <div class="font-semibold text-gray-900">Sari Melati</div>
                <div class="text-sm text-gray-500">Restoran Franchise</div>
              </div>
            </div>
            <p class="text-gray-600 text-sm italic">
              "Broadcast feature sangat powerful! Bisa promosi ke ribuan customer sekaligus. Sales naik 150%!"
            </p>
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <span class="text-indigo-600 font-semibold">DN</span>
              </div>
              <div>
                <div class="font-semibold text-gray-900">Dini Novita</div>
                <div class="text-sm text-gray-500">Agency Marketing</div>
              </div>
            </div>
            <p class="text-gray-600 text-sm italic">
              "Multi-channel integration membuat kami bisa kelola WhatsApp, Instagram, dan Telegram dalam satu dashboard!"
            </p>
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <span class="text-purple-600 font-semibold">RH</span>
              </div>
              <div>
                <div class="font-semibold text-gray-900">Rio Hartanto</div>
                <div class="text-sm text-gray-500">Startup E-commerce</div>
              </div>
            </div>
            <p class="text-gray-600 text-sm italic">
              "Inbox history sangat membantu! Tim bisa lihat riwayat chat lengkap dan handoff ke agent manusia dengan smooth."
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="py-16 md:py-24 border-t border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl md:text-4xl font-extrabold">Pilih Paket</h2>
          <p class="mt-3 text-gray-600">Harga terjangkau, fitur lengkap untuk semua skala bisnis.</p>
        </div>

        <div v-if="loading" class="text-center mt-10">Loading...</div>
        <div v-else-if="error" class="text-center mt-10 text-red-500">{{ error }}</div>
        
        <div v-else class="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="pkg in packages" :key="pkg.id" class="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col">
            <div class="text-sm font-semibold text-blue-600">{{ pkg.name }}</div>
            <div class="mt-2 text-3xl font-extrabold">
              {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.harga) }}
              <span class="text-base font-medium text-gray-500">/bulan</span>
            </div>
            <p class="mt-3 text-sm text-gray-500 flex-grow">{{ pkg.deskripsi }}</p>
            <ul class="mt-4 space-y-2 text-gray-600 text-sm">
              <li>{{ pkg.limit_chanel }} Channel WhatsApp</li>
              <li>{{ pkg.limit_agent }} Agent</li>
              <li>{{ pkg.limit_ai }} AI Limit</li>
              <li>{{ pkg.limit_broadcast }} Broadcast</li>
              <li>{{ pkg.limit_produk }} Produk</li>
            </ul>
            <button @click="handleSelectPlan(pkg.name.toLowerCase())" class="mt-6 inline-block w-full text-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">
              Pilih {{ pkg.name }}
            </button>
          </div>
        </div>

        <div class="mt-6 text-center text-sm text-gray-500">
          Catatan: Free trial 3 hari untuk semua paket.
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-14 bg-blue-50 border-t border-blue-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 class="text-2xl md:text-3xl font-bold">Siap meningkatkan layanan pelanggan Anda?</h3>
        <p class="mt-2 text-gray-600">Daftar dan mulai gunakan Nutra AI Chat sekarang.</p>
        <NuxtLink to="/login" class="mt-6 inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Masuk / Daftar</NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 border-t border-gray-200 text-sm text-gray-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <img src="/assets/img/nutra.png" class="h-5 w-5" alt="Nutra" />
          <span>Nutra AI Chat</span>
        </div>
        <div class="flex items-center gap-4">
          <a href="#home" class="hover:text-blue-600">Home</a>
          <a href="#features" class="hover:text-blue-600">Features</a>
          <a href="#pricing" class="hover:text-blue-600">Pricing</a>
          <NuxtLink to="/doc" class="hover:text-blue-600">Document</NuxtLink>
          <NuxtLink to="/login" class="hover:text-blue-600">Login</NuxtLink>
        </div>
        <div class="text-xs text-gray-400">© {{ new Date().getFullYear() }} Nutra. All rights reserved.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHead } from '#imports'
import { usePackages } from '~/composables/usePackages'

useHead({
  title: 'Nutra AI Chat - Public',
  meta: [
    { name: 'description', content: 'Halaman publik Nutra AI Chat: Home, Pricing, Document, Login' }
  ]
})

const user = useSupabaseUser()
const router = useRouter()
const { packages, loading, error, fetchPackages } = usePackages()

onMounted(fetchPackages)

function handleSelectPlan(plan) {
  const selectedPackage = packages.value.find(p => p.name.toLowerCase() === plan)
  const planName = selectedPackage ? selectedPackage.name.toLowerCase() : plan
  
  if (!user?.value) {
    router.push(`/register?plan=${planName}`)
  } else {
    router.push(`/pricing/payment?plan=${planName}`)
  }
}
</script>
