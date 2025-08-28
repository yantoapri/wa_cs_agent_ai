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
                <div class="text-sm text-gray-500">Paket Dipilih</div>
                <div class="mt-1 text-2xl font-bold capitalize">{{ planLabel }}</div>
              </div>
              <button @click="openPackageModal" class="text-sm text-blue-600 hover:underline">Ubah paket</button>
            </div>

            <div v-if="plan !== 'free'" class="mt-5">
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

            <div v-if="plan !== 'free'" class="mt-4 text-xs text-gray-500">
              Konfirmasi pembayaran Anda akan diproses manual. Setelah transfer, klik tombol "Submit" di ringkasan untuk melanjutkan.
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
              <div class="flex justify-between" v-if="plan !== 'free'">
                <span>Harga Bulanan</span>
                <span>Rp {{ toIDR(monthlyPrice) }}</span>
              </div>
              <div class="flex justify-between" v-if="plan !== 'free'">
                <span>Siklus</span>
                <span>{{ billingCycleLabel }}</span>
              </div>
              <hr class="my-2" />
              <div class="flex justify-between" v-if="plan !== 'free'">
                <span>Subtotal</span>
                <span>Rp {{ toIDR(subtotal) }}</span>
              </div>
              <div class="flex justify-between text-green-700" v-if="plan !== 'free' && discount > 0">
                <span>Diskon (2 bulan gratis)</span>
                <span>- Rp {{ toIDR(discount) }}</span>
              </div>
              <div class="flex justify-between text-base font-semibold mt-2">
                <span>Total</span>
                <span v-if="plan !== 'free'">Rp {{ toIDR(totalDue) }}</span>
                <span v-else>Rp 0</span>
              </div>
            </div>

            <div class="mt-5 space-y-2">
              <button
                v-if="plan !== 'free'"
                @click="submitInvoice()"
                class="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
              >Submit</button>
              <button
                v-else
                @click="activateTrial()"
                class="w-full px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
              >Aktifkan Trial</button>
              <NuxtLink to="/views/dashboard" class="block text-center text-xs text-gray-500 hover:underline">Kembali ke Dashboard</NuxtLink>
            </div>
          </div>
        </aside>
      </div>

      <!-- Package Selection Modal -->
      <div v-if="showPackageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-4">Pilih Paket Baru</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div v-for="pkg in packages" :key="pkg.id" class="border rounded-lg p-4 flex flex-col">
                <h4 class="font-bold text-lg">{{ pkg.name }}</h4>
                <p class="text-gray-600">Rp {{ toIDR(pkg.harga) }} / bulan</p>
                <ul class="text-sm space-y-2 mt-4">
                  <li>{{ pkg.limit_ai }} Pesan AI</li>
                  <li>{{ pkg.limit_agent }} Agen</li>
                  <li>{{ pkg.limit_broadcast }} Broadcast</li>
                  <li>{{ pkg.limit_chanel }} Channel</li>
                  <li>{{ pkg.limit_produk }} Produk</li>
                </ul>
                <button @click="selectPackage(pkg)" class="mt-auto bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Pilih</button>
              </div>
            </div>
            <div class="text-right mt-4">
              <button @click="showPackageModal = false" class="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg">Batal</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useHead, useRoute, useRouter, useSupabaseUser, useSupabaseClient, computed, ref, onMounted } from '#imports'
import { useToast } from '~/composables/useToast'
import { usePackages } from '~/composables/usePackages';

definePageMeta({ layout: 'authenticated', middleware: 'auth' })
useHead({ title: 'Pembayaran - Nutra AI Chat' })

const route = useRoute()
const router = useRouter()
const user = useSupabaseUser()
const { showToast } = useToast()
const supabase = useSupabaseClient()
const { packages, fetchPackages } = usePackages();


const showPackageModal = ref(false);
const userPackage = ref(null);

const plan = ref(route.query.plan || 'free');
const planNames = { free: 'Free Trial 3 Hari', pro: 'Pro', business: 'Business', corporate: 'Corporate' };
const planLabel = computed(() => planNames[plan.value] || plan.value);
const monthlyPrice = computed(() => (packages.value?.find(p => p.name.toLowerCase() === plan.value)?.harga || 0));

async function fetchUserPackage() {
  if (!user.value) return;
  const { data, error } = await supabase
    .from('users')
    .select('package(*)')
    .eq('auth_id', user.value.id)
    .single();
  if (error) {
    console.error('Error fetching user package:', error);
    return;
  }
  userPackage.value = data.package;
  if (data.package) {
    plan.value = data.package.name.toLowerCase();
  }
}

function openPackageModal() {
  showPackageModal.value = true;
}

function selectPackage(selectedPackage) {
  plan.value = selectedPackage.name.toLowerCase();
  showPackageModal.value = false;
}

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

onMounted(async () => {
  if (!user?.value) {
    router.replace(`/register?plan=${encodeURIComponent(plan.value)}`)
    return;
  }
  await fetchUserPackage();
  await fetchPackages();
})

function toIDR(n) {
  return 'Rp ' + (n || 0).toLocaleString('id-ID')
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); showToast({ type: 'success', message: 'Disalin ke clipboard' }) } catch {}
}

async function getPublicUserId() {
  if (!user.value) return null;
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.value.id)
    .single();
  
  if (error) {
    console.error('Error fetching public user id:', error);
    return null;
  }
  return data.id;
}

async function submitInvoice() {
  try {
    const publicUserId = await getPublicUserId();
    if (!publicUserId) {
      throw new Error('Could not find user profile.');
    }

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
      user_id: publicUserId,
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
      status: 1,
      created_at: now.toISOString(),
    }
    const { error: invError } = await supabase.from('invoices').insert([invoicePayload])
    if (invError) throw invError


    showToast({ type: 'success', message: 'Invoice dan paket berhasil dibuat.' })
    router.push('/views/billing-payment')
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
