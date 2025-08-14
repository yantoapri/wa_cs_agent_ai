<template>
  <!-- Konten dibungkus oleh layout authenticated (sidebar/menu user) -->
  <div class="p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold">Pembayaran - Transfer Manual</h1>
        <p class="text-gray-600 mt-1">Selesaikan pembayaran untuk mengaktifkan paket Anda.</p>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Left: Konfigurasi Paket & Bank -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Paket dipilih & siklus -->
          <div class="border border-gray-200 rounded-xl p-5 bg-white">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-sm text-gray-500">Paket dipilih</div>
                <div class="mt-1 text-2xl font-bold">{{ planLabel }}</div>
                <div v-if="monthlyPrice" class="text-gray-600 mt-1">Rp {{ toIDR(monthlyPrice) }} / bulan</div>
                <div v-else class="text-gray-600 mt-1">Gratis 3 hari (trial)</div>
              </div>
              <NuxtLink to="/#pricing" class="text-sm text-blue-600 hover:underline">Ubah paket</NuxtLink>
            </div>

            <div v-if="plan.value !== 'free'" class="mt-5">
              <div class="text-sm font-medium text-gray-700 mb-2">Siklus Pembayaran</div>
              <div class="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  :class="billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                  class="px-4 py-2 text-sm font-medium border-r"
                  @click="billingCycle = 'monthly'"
                >Bulanan</button>
                <button
                  :class="billingCycle === 'yearly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                  class="px-4 py-2 text-sm font-medium"
                  @click="billingCycle = 'yearly'"
                >Tahunan <span class="ml-1 text-xs" :class="billingCycle === 'yearly' ? 'text-white/90' : 'text-green-700'">(Gratis 2 bulan)</span></button>
              </div>
            </div>
          </div>

          <!-- Metode Transfer -->
          <div class="border border-gray-200 rounded-xl p-5 bg-white">
            <div class="text-lg font-semibold">Transfer Bank</div>
            <p class="text-sm text-gray-600 mt-1">Pilih bank tujuan dan lakukan transfer sesuai total tagihan.</p>

            <!-- Tujuan Transfer Tetap -->
            <div class="mt-4 border rounded-lg p-4 bg-gray-50">
              <div class="text-sm text-gray-500">Transfer manual ke</div>
              <div class="mt-1 flex flex-wrap items-center gap-3">
                <div class="text-lg font-semibold">BCA</div>
                <div class="text-gray-700">a.n PT Nutra USA Indonesia</div>
              </div>
              <div class="mt-1 flex items-center gap-2">
                <span class="font-mono text-lg">861-1055501</span>
                <button @click="copy('861-1055501')" class="text-xs px-2 py-1 rounded border hover:bg-white">Salin</button>
              </div>
              <div class="mt-2 text-xs text-gray-500">Tambahkan berita transfer: "Pembelian {{ planLabel }} - {{ billingCycleLabel }}"</div>
            </div>

            <div v-if="plan.value !== 'free'" class="mt-4 text-xs text-gray-500">
              Konfirmasi pembayaran Anda akan diproses manual. Setelah transfer, klik tombol "Saya sudah transfer" di ringkasan untuk melanjutkan.
            </div>
            <div v-else class="mt-4 text-sm text-green-700">
              Paket Trial tidak membutuhkan pembayaran. Klik tombol "Aktifkan Trial" di ringkasan untuk mulai menggunakan.
            </div>
          </div>
        </div>

        <!-- Right: Ringkasan Tagihan -->
        <aside class="lg:col-span-1">
          <div class="border border-gray-200 rounded-xl p-5 sticky top-20 bg-white">
            <div class="text-lg font-semibold">Ringkasan</div>
            <div class="mt-3 space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Paket</span>
                <span>{{ planLabel }}</span>
              </div>
              <div class="flex justify-between" v-if="plan.value !== 'free'">
                <span>Harga Bulanan</span>
                <span>Rp {{ toIDR(monthlyPrice) }}</span>
              </div>
              <div class="flex justify-between" v-if="plan.value !== 'free'">
                <span>Siklus</span>
                <span>{{ billingCycleLabel }}</span>
              </div>
              <hr class="my-2" />
              <div class="flex justify-between" v-if="plan.value !== 'free'">
                <span>Subtotal</span>
                <span>Rp {{ toIDR(subtotal) }}</span>
              </div>
              <div class="flex justify-between text-green-700" v-if="plan.value !== 'free' && discount > 0">
                <span>Diskon (2 bulan gratis)</span>
                <span>- Rp {{ toIDR(discount) }}</span>
              </div>
              <div class="flex justify-between text-base font-semibold mt-2">
                <span>Total</span>
                <span v-if="plan.value !== 'free'">Rp {{ toIDR(totalDue) }}</span>
                <span v-else>Rp 0</span>
              </div>
            </div>

            <div class="mt-5 space-y-2">
              <button
                v-if="plan.value !== 'free'"
                @click="submitInvoice()"
                class="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
              >Submit</button>
              <button
                v-else
                @click="activateTrial()"
                class="w-full px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
              >Aktifkan Trial</button>
              <NuxtLink to="/#pricing" class="block text-center text-xs text-gray-500 hover:underline">Kembali ke Pricing</NuxtLink>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead, useRoute, useRouter, useSupabaseUser, useSupabaseClient, computed, ref, onMounted } from '#imports'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'authenticated', middleware: 'auth' })
useHead({ title: 'Pembayaran - Nutra AI Chat' })

const route = useRoute()
const router = useRouter()
const user = useSupabaseUser()
const { showToast } = useToast()
const supabase = useSupabaseClient()

// Plan & harga per bulan
const plan = computed(() => (route.query.plan || 'free').toString())
const planPrices = { free: 0, pro: 149000, business: 500000, corporate: 1500000 }
const planNames = { free: 'Free Trial 3 Hari', pro: 'Pro', business: 'Business', corporate: 'Corporate' }
const planLabel = computed(() => planNames[plan.value] || plan.value)
const monthlyPrice = computed(() => planPrices[plan.value] || 0)

// Siklus pembayaran
const billingCycle = ref('monthly') // 'monthly' | 'yearly'
const billingCycleLabel = computed(() => billingCycle.value === 'yearly' ? 'Tahunan (Gratis 2 bulan)' : 'Bulanan')

// Perhitungan
const subtotal = computed(() => {
  if (plan.value === 'free') return 0
  return billingCycle.value === 'yearly' ? monthlyPrice.value * 12 : monthlyPrice.value
})
const discount = computed(() => {
  if (plan.value === 'free') return 0
  return billingCycle.value === 'yearly' ? monthlyPrice.value * 2 : 0
})
const totalDue = computed(() => Math.max(0, subtotal.value - discount.value))

// Bank transfer (fixed)
const bankInfo = { code: 'BCA', name: 'BCA', accountNumber: '861-1055501', accountName: 'PT Nutra USA Indonesia' }

onMounted(() => {
  if (!user?.value) {
    router.replace(`/register?plan=${encodeURIComponent(plan.value)}`)
  }
})

function toIDR(n) {
  return (n || 0).toLocaleString('id-ID')
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); showToast({ type: 'success', message: 'Disalin ke clipboard' }) } catch {}
}

async function submitInvoice() {
  try {
    const now = new Date()
    // Hitung tanggal mulai (3 hari setelah transaksi)
    const start = new Date(now)
    start.setDate(start.getDate() + 3)
    // Hitung tanggal berakhir (30 hari untuk bulanan, 14 bulan untuk tahunan)
    const end = new Date(start)
    if (billingCycle.value === 'yearly') {
      end.setMonth(end.getMonth() + 14)
    } else {
      end.setDate(end.getDate() + 30)
    }

    // Simpan invoice
    const invoicePayload = {
      invoice_number: `INV-${Date.now()}`,
      user_id: user?.value?.id || null,
      plan: plan.value,
      billing_cycle: billingCycle.value,
      price_monthly: monthlyPrice.value,
      subtotal: subtotal.value,
      discount: discount.value,
      total: totalDue.value,
      currency: 'IDR',
      bank_code: bankInfo.code,
      bank_name: bankInfo.name,
      bank_account_number: bankInfo.accountNumber,
      bank_account_name: bankInfo.accountName,
      status: 'pending',
      created_at: now.toISOString(),
    }
    const { error: invError } = await supabase.from('invoices').insert([invoicePayload])
    if (invError) throw invError

    // Simpan user_package
    const userPackagePayload = {
      user_id: user?.value?.id || null,
      package_id: null,
      created_at: now.toISOString(),
      start_at: start.toISOString(),
      end_at: end.toISOString(),
    }
    const { error: upError } = await supabase.from('user_package').insert([userPackagePayload])
    if (upError) throw upError

    showToast({ type: 'success', message: 'Invoice dan paket berhasil dibuat.' })
    router.push('/views/dashboard')
  } catch (e) {
    console.error(e)
    showToast({ type: 'error', message: 'Gagal membuat invoice/paket.' })
  }
}

async function activateTrial() {
  showToast({ type: 'success', message: 'Trial diaktifkan.' })
  router.push('/views/dashboard')
}
</script>
