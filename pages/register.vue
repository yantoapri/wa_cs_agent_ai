<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center">
        <img src="/assets/img/nutra.png" alt="Nutra Logo" class="mx-auto h-12 w-auto" />
        <h1 class="mt-6 text-3xl font-extrabold text-gray-900">Buat Akun Baru</h1>
        <p class="mt-2 text-sm text-gray-600">Pilih paket yang paling sesuai dengan kebutuhan Anda.</p>
      </div>

      <!-- Package Selection -->
      <section id="pricing" class="mt-10">
        <div v-if="loading" class="text-center">Loading packages...</div>
        <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="pkg in packages"
            :key="pkg.id"
            @click="selectPackage(pkg)"
            :class="['rounded-2xl border p-6 shadow-sm transition cursor-pointer flex flex-col', selectedPackage && selectedPackage.id === pkg.id ? 'border-blue-600 ring-2 ring-blue-500' : 'border-gray-200 hover:shadow-md']"
          >
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
            <button 
              @click.stop="selectPackage(pkg)"
              :disabled="selectedPackage && selectedPackage.id === pkg.id"
              class="btn-primary mt-4"
            >
              Pilih Paket
            </button>
          </div>
        </div>
      </section>

      <!-- Registration and Payment Form -->
      <section v-if="selectedPackage" class="mt-12">
        <div class="bg-white shadow-lg rounded-2xl p-8">
          <h2 class="text-2xl font-bold text-gray-800">Langkah Terakhir: Daftar & Bayar</h2>
          <div class="grid md:grid-cols-2 gap-8 mt-6">
            <!-- Left: Registration Form -->
            <div>
              <h3 class="text-lg font-semibold">1. Informasi Akun</h3>
              <form @submit.prevent="registerAndPay" class="mt-4 space-y-4">
               
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700">Alamat Email</label>
                  <input v-model="email" id="email" type="email" placeholder="you@example.com" required class="input mt-1" :disabled="paymentLoading" />
                </div>
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                  <input v-model="password" id="password" type="password" placeholder="••••••••" required class="input mt-1" :disabled="paymentLoading" />
                </div>
              </form>
            </div>

            <!-- Right: Payment Summary -->
            <div>
              <h3 class="text-lg font-semibold">2. Ringkasan Pembayaran</h3>
              
              <div class="mt-4">
                <div class="text-sm font-medium text-gray-700 mb-2">Tambahkan Kartu Kredit Anda</div>
                
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
                  >Tahunan <span class="ml-1 text-xs" :class="billingCycle === 'yearly' ? 'text-white/90' : 'text-green-700'">(Diskon 2 bulan)</span></button>
                </div>
              </div>

              <div class="mt-4 border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                <div class="flex justify-between">
                  <span class="text-gray-600">Paket:</span>
                  <span class="font-semibold">{{ selectedPackage.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="font-semibold">{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(subtotal) }}</span>
                </div>
                <div v-if="discount > 0" class="flex justify-between text-green-700">
                  <span class="text-gray-600">Diskon:</span>
                  <span class="font-semibold">- {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(discount) }}</span>
                </div>
                <hr/>
                <div class="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalDue) }}</span>
                </div>
              </div>
              <div class="mt-4">
                 <p class="text-sm text-gray-600">Lakukan pembayaran ke rekening berikut:</p>
                 <div class="mt-2 border rounded-lg p-3 bg-blue-50">
                    <p class="font-semibold">BCA: 861-1055501</p>
                    <p class="text-sm">a.n PT Nutra USA Indonesia</p>
                 </div>
              </div>
            </div>
          </div>
          
          <div class="mt-8 border-t pt-6">
            <button @click="registerAndPay" class="btn-primary w-full" :disabled="paymentLoading || !email || !password">
              <span v-if="paymentLoading">Processing...</span>
              <span v-else>Daftar & Konfirmasi Pembayaran</span>
            </button>
            <p v-if="paymentError" class="text-red-500 mt-3 text-sm text-center">{{ paymentError }}</p>
            <p class="mt-4 text-center text-sm">
              Sudah punya akun? 
              <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">Login di sini</NuxtLink>
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePackages } from '~/composables/usePackages';
import { useToast } from '~/composables/useToast';

const { packages, loading, error, fetchPackages } = usePackages();
const { showToast } = useToast();
const supabase = useSupabaseClient();
const router = useRouter();
const route = useRoute();

const selectedPackage = ref(null);
const email = ref('');
const password = ref('');
const paymentLoading = ref(false);
const paymentError = ref('');
const billingCycle = ref('monthly'); // monthly or yearly


onMounted(async () => {
  await fetchPackages();

});

function selectPackage(pkg) {
  selectedPackage.value = pkg;
}

const monthlyPrice = computed(() => selectedPackage.value?.harga || 0);

const subtotal = computed(() => {
  return billingCycle.value === 'yearly' ? monthlyPrice.value * 12 : monthlyPrice.value;
});

const discount = computed(() => {
  return billingCycle.value === 'yearly' ? monthlyPrice.value * 2 : 0;
});

const totalDue = computed(() => Math.max(0, subtotal.value - discount.value));

async function registerAndPay() {
  // Validate credit card format (16-19 digits, with optional spaces/dashes)


  if (!email.value || !password.value || !selectedPackage.value ) {
    paymentError.value = 'Harap isi semua field dan pilih paket.';
    return;
  }

  paymentLoading.value = true;
  paymentError.value = '';

  try {
    // 1. Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });

    if (signUpError) throw new Error(`Registration failed: ${signUpError.message}`);
    if (!signUpData.user) throw new Error('User registration did not return a user object.');

    const userId = signUpData.user.id;

    // 2. Insert user into public 'users' table
    const { error: insertError } = await supabase.from('users').insert([{
      auth_id: userId,
      username: email.value,
      email: email.value,
      credit_card: creditCard.value,
      bank_name: bankName.value,
      role: 2, // Default user role
      is_active: true, // User is not active until payment is confirmed
      is_trial: selectedPackage.value.id === 1 ? true : false, // Trial for the first package only
      package_id: selectedPackage.value.id,
      start_at: new Date().toISOString(),
      end_at: selectedPackage.value.id === 1 
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        : billingCycle.value === 'yearly'
          ? new Date(Date.now() + 425 * 24 * 60 * 60 * 1000).toISOString() // 1 year + 2 months (365 + 60 days)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }]);

    if (insertError) throw new Error(`Failed to save user profile: ${insertError.message}`);

    // 3. Create an invoice
    const { error: invoiceError } = await supabase.from('invoices').insert([{
      invoice_number: `INV-${Date.now()}`,
      user_id: userId, // This should be the public user id, but we use auth_id for now.
      // TODO: You might need a function to get the public user id from auth_id
      plan: selectedPackage.value.id,
      billing_cycle: billingCycle.value,
      price_monthly: monthlyPrice.value,
      subtotal: subtotal.value,
      discount: discount.value,
      total: totalDue.value,
      currency: 'IDR',
      status: 1, // Payment is pending confirmation
      bank_code: 'BCA',
      bank_name: 'BCA',
      bank_account_number: '861-1055501',
      bank_account_name: 'PT Nutra USA Indonesia',
    }]);

    if (invoiceError) throw new Error(`Failed to create invoice: ${invoiceError.message}`);

    showToast({
      message: 'Registrasi berhasil! Silakan login dan tunggu konfirmasi pembayaran.',
      type: 'success',
    });
    router.push('/login');

  } catch (e) {
    paymentError.value = e.message;
    // Optional: more specific error handling or user feedback
  } finally {
    paymentLoading.value = false;
  }
}

</script>

<style scoped>
.input {
  @apply block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition;
}
.btn-primary {
  @apply w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition;
}
</style>

