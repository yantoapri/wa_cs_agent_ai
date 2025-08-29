<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Riwayat Tagihan & Pembayaran</h1>
          <p class="text-sm text-gray-600 mt-1">Lihat riwayat tagihan dan status pembayaran Anda</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-6">
      <!-- Filters -->
      <div class="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search by Invoice Number -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cari Invoice</label>
            <input
              v-model="searchInvoice"
              type="text"
              placeholder="Cari berdasarkan nomor invoice..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Filter by Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="filterStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="1">Menunggu Pembayaran</option>
              <option value="2">Sudah Dibayar</option>
              <option value="3">Terverifikasi</option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rentang Tanggal</label>
            <div class="flex gap-2">
              <input
                v-model="dateFrom"
                type="date"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                v-model="dateTo"
                type="date"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-600">
            Showing {{ filteredInvoices.length }} of {{ invoices.length }} invoices
          </div>
          <div class="flex gap-2">
            <button
              @click="clearFilters"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Hapus Filter
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-8">Memuat...</div>
      <div v-else-if="error" class="text-red-500 text-center py-8">{{ error }}</div>

      <div v-else class="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
        <table class="min-w-full leading-normal">
          <thead>
            <tr>
              <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nomor Invoice
              </th>
              <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Paket
              </th>
              <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Jumlah
              </th>
              <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tanggal
              </th>
              <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in filteredInvoices" :key="invoice.id">
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">{{ invoice.invoice_number }}</p>
              </td>
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">{{ invoice?.plan.name }}</p>
              </td>
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">Rp {{ toIDR(invoice.total) }}</p>
              </td>
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">{{ formatDate(invoice.created_at) }}</p>
              </td>
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                <span
                  :class="{
                    'bg-yellow-200 text-yellow-800': invoice.status.id===1,
                    'bg-green-200 text-green-800': invoice.status.id === 2,
                    'bg-blue-200 text-blue-800': invoice.status.id === 3,
                    'bg-red-200 text-red-800': invoice.status.id === 4,
                    'bg-yellow-200 text-yellow-800': invoice.status.id === 5
                  }"
                  class="px-2 py-1 rounded-full text-xs font-semibold"
                >
                  {{ invoice?.status.name }}
                </span>
              </td>
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm text-right">
                <button v-if="invoice?.status.id==1||invoice?.status.id==5" @click="openUploadModal(invoice)" class="bg-blue-600 text-white px-3 py-1 rounded text-sm mr-2 hover:bg-blue-700 transition-colors">{{invoice?.status.id==5 ? 'Reupload Bukti' : 'Upload Bukti'}}</button>
                <button @click="openDetailModal(invoice)" class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors">Detail</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Upload Bukti Pembayaran</h3>
          <div v-if="selectedInvoice">
            <p class="mb-4">Invoice: <strong>{{ selectedInvoice.invoice_number }}</strong></p>
            <input type="file" @change="handleFileUpload" accept="image/*" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <div class="flex gap-3 mt-6">
              <button @click="submitProofOfPayment" :disabled="uploading" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg">
                {{ uploading ? 'Mengupload...' : 'Kirim' }}
              </button>
              <button @click="closeUploadModal" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg">Batal</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Detail Transaksi</h3>
          <div v-if="selectedInvoice" class="space-y-2">
            <p><strong>Nomor Invoice:</strong> {{ selectedInvoice.invoice_number }}</p>
            <p><strong>Paket:</strong> {{ selectedInvoice?.plan.name }}</p>
            
            <p><strong>Tanggal:</strong> {{ formatDate(selectedInvoice.created_at, true) }}</p>
            <p><strong>Status:</strong> <span  :class="{'bg-yellow-200 text-yellow-800': selectedInvoice.status.id===1,'bg-green-200 text-green-800': selectedInvoice.status.id === 2,'bg-blue-200 text-blue-800': selectedInvoice.status.id === 3,'bg-red-200 text-red-800': selectedInvoice.status.id === 4,'bg-yellow-200 text-yellow-800': selectedInvoice.status.id === 5}"
                  class="inline-block px-2 py-1 rounded-full text-xs font-semibold">{{ selectedInvoice?.status.name }}</span></p>
            <p>
                <strong>Bank Tujuan:</strong><br>
                {{ selectedInvoice?.bank_name }} - {{ selectedInvoice?.bank_account_name }}<br>
                {{ selectedInvoice?.bank_account_number }}({{ selectedInvoice?.bank_code }})
            </p>
            <p><strong>Lama Paket:</strong> {{ selectedInvoice?.billing_cycle }}</p>
            <p><strong>Harga</strong> Rp. {{ toIDR(selectedInvoice?.plan.harga) }}</p>
            <p><strong>Subtotal:</strong>Rp. {{ toIDR(selectedInvoice.subtotal) }}</p>
            
            <p><strong>Diskon:</strong>Rp. {{ toIDR(selectedInvoice?.discount) }}</p>
            <p><strong>Jumlah:</strong> Rp {{ toIDR(selectedInvoice.total) }}</p>
            <div v-if="selectedInvoice.payment_receipt">
              <strong>Bukti Pembayaran:</strong> <a :href="selectedInvoice.payment_receipt" target="_blank" class="text-blue-600 hover:underline">Lihat Gambar</a>
            </div>
          </div>
          <div class="text-right mt-6">
            <button @click="closeDetailModal" class="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg">Tutup</button>
          </div>
        </div>
      </div>
      </div>

  </div>
</template><script setup>
import { ref, onMounted, computed } from 'vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';
import { useToast } from '~/composables/useToast';

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { showToast } = useToast();

const invoices = ref([]);
const loading = ref(true);
const error = ref(null);

// Filter variables
const searchInvoice = ref('');
const filterStatus = ref('');
const dateFrom = ref('');
const dateTo = ref('');

// Computed filtered invoices
const filteredInvoices = computed(() => {
  let filtered = [...invoices.value];

  // Filter by invoice number
  if (searchInvoice.value) {
    filtered = filtered.filter(invoice => 
      invoice.invoice_number.toLowerCase().includes(searchInvoice.value.toLowerCase())
    );
  }

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(invoice => invoice.status.id === parseInt(filterStatus.value));
  }

  // Filter by date range
  if (dateFrom.value) {
    filtered = filtered.filter(invoice => 
      new Date(invoice.created_at) >= new Date(dateFrom.value)
    );
  }

  if (dateTo.value) {
    filtered = filtered.filter(invoice => 
      new Date(invoice.created_at) <= new Date(dateTo.value + ' 23:59:59')
    );
  }

  return filtered;
});

// Clear filters function
function clearFilters() {
  searchInvoice.value = '';
  filterStatus.value = '';
  dateFrom.value = '';
  dateTo.value = '';
}

const showUploadModal = ref(false);
const showDetailModal = ref(false);
const selectedInvoice = ref(null);
const fileToUpload = ref(null);
const uploading = ref(false);

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
async function fetchInvoices() {
  if (!user.value) return;

  loading.value = true;
  var public_user_id = await getPublicUserId();
  try {
    const { data, error: fetchError } = await supabase
      .from('invoices')
      .select('*,status(*),plan(*)')
      .eq('user_id', public_user_id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    invoices.value = data;
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

function toIDR(n) {
  return (n || 0).toLocaleString('id-ID');
}

function formatDate(dateString, includeTime = false) {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  let formatted = `${day} ${month} ${year}`;
  
  if (includeTime) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    formatted += ` ${hours}:${minutes}`;
  }
  
  return formatted;
}

function openUploadModal(invoice) {
  selectedInvoice.value = invoice;
  showUploadModal.value = true;
}

function closeUploadModal() {
  selectedInvoice.value = null;
  fileToUpload.value = null;
  showUploadModal.value = false;
}

function openDetailModal(invoice) {
  selectedInvoice.value = invoice;
  showDetailModal.value = true;
}

function closeDetailModal() {
  selectedInvoice.value = null;
  showDetailModal.value = false;
}

function handleFileUpload(event) {
  fileToUpload.value = event.target.files[0];
}

async function submitProofOfPayment() {
  if (!fileToUpload.value || !selectedInvoice.value) return;

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('image', fileToUpload.value);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const { url } = await response.json();

    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 2,
        payment_receipt: url
      })
      .eq('id', selectedInvoice.value.id);

    if (updateError) {
      throw updateError;
    }

    showToast({ type: 'success', message: 'Bukti pembayaran berhasil diupload' });
    await fetchInvoices();
    closeUploadModal();
  } catch (e) {
    showToast({ type: 'error', message: e.message });
  } finally {
    uploading.value = false;
  }
}

onMounted(fetchInvoices);
</script>
