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
          <div class="mt-6 text-sm text-gray-500">Tidak perlu kartu kredit</div>
        </div>
        <div class="md:justify-self-end">
          <div class="relative">
            <div class="absolute -inset-4 bg-blue-100 rounded-3xl rotate-2"></div>
            <div class="relative bg-white border border-gray-200 shadow-xl rounded-3xl p-6">
              <div class="flex items-center gap-3">
                <img src="/assets/img/nutra.png" class="h-10 w-10" alt="Nutra" />
                <div>
                  <div class="font-semibold">Dashboard Nutra</div>
                  <div class="text-sm text-gray-500">Omnichannel chat & AI agent</div>
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
              <div class="mt-6 text-sm text-gray-500">Terintegrasi dengan WhatsApp & channel lain.</div>
            </div>
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

        <div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Pro -->
          <div class="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            <div class="text-sm font-semibold text-blue-600">Pro</div>
            <div class="mt-2 text-3xl font-extrabold">Rp 149.000<span class="text-base font-medium text-gray-500">/bulan</span></div>
            <ul class="mt-4 space-y-2 text-gray-600 text-sm">
              <li>1 Channel WhatsApp</li>
              <li>Agent AI dasar</li>
              <li>Riwayat chat 30 hari</li>
              <li>Dukungan email</li>
            </ul>
            <button @click="handleSelectPlan('pro')" class="mt-6 inline-block w-full text-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Coba Pro</button>
          </div>

          <!-- Business -->
          <div class="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition relative">
            <div class="absolute -top-3 right-4 px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white">Terpopuler</div>
            <div class="text-sm font-semibold text-blue-600">Business</div>
            <div class="mt-2 text-3xl font-extrabold">Rp 500.000<span class="text-base font-medium text-gray-500">/bulan</span></div>
            <ul class="mt-4 space-y-2 text-gray-600 text-sm">
              <li>3 Channel WhatsApp</li>
              <li>Agent AI lanjutan</li>
              <li>Broadcast & Auto Message</li>
              <li>Dukungan chat</li>
            </ul>
            <button @click="handleSelectPlan('business')" class="mt-6 inline-block w-full text-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Pilih Business</button>
          </div>

          <!-- Corporate -->
          <div class="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            <div class="text-sm font-semibold text-blue-600">Corporate</div>
            <div class="mt-2 text-3xl font-extrabold">Rp 1.500.000<span class="text-base font-medium text-gray-500">/bulan</span></div>
            <ul class="mt-4 space-y-2 text-gray-600 text-sm">
              <li>Tak terbatas Channel</li>
              <li>Agent AI kustom</li>
              <li>Integrasi & SLA</li>
              <li>Dedicated support</li>
            </ul>
            <button @click="handleSelectPlan('corporate')" class="mt-6 inline-block w-full text-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Hubungi Sales</button>
          </div>
        </div>

        <div class="mt-6 text-center text-sm text-gray-500">
          Catatan: Free trial 3 hari untuk semua paket. Harga setara Pro 149rb, Business 500rb, Corporate 1,5jt per bulan.
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
import { useHead } from '#imports'
useHead({
  title: 'Nutra AI Chat - Public',
  meta: [
    { name: 'description', content: 'Halaman publik Nutra AI Chat: Home, Pricing, Document, Login' }
  ]
})

const user = useSupabaseUser()
const router = useRouter()
function handleSelectPlan(plan) {
  if (!user?.value) {
    router.push(`/register?plan=${plan}`)
  } else {
    router.push(`/pricing/payment?plan=${plan}`)
  }
}
</script>
