<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Billing & Payment History</h2>

    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Invoice Number
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Plan
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Amount
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Date
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in invoices" :key="invoice.id">
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ invoice.invoice_number }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ invoice?.plan.name }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">Rp {{ toIDR(invoice.total) }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ new Date(invoice.created_at).toLocaleDateString() }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <span
                :class="{
                  'bg-yellow-200 text-yellow-800': invoice.status.id===1,
                  'bg-green-200 text-green-800': invoice.status.id === 2,
                  'bg-blue-200 text-blue-800': invoice.status.id === 3,
                }"
                class="px-2 py-1 rounded-full text-xs font-semibold"
              >
                {{ invoice?.status.name }}
              </span>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <button v-if="invoice.status === 'pending'" @click="openUploadModal(invoice)" class="text-blue-600 hover:text-blue-900 mr-4">Upload</button>
              <button @click="openDetailModal(invoice)" class="text-gray-600 hover:text-gray-900">Detail</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Upload Proof of Payment</h3>
          <div v-if="selectedInvoice">
            <p class="mb-4">Invoice: <strong>{{ selectedInvoice.invoice_number }}</strong></p>
            <input type="file" @change="handleFileUpload" accept="image/*" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <div class="flex gap-3 mt-6">
              <button @click="submitProofOfPayment" :disabled="uploading" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg">
                {{ uploading ? 'Uploading...' : 'Submit' }}
              </button>
              <button @click="closeUploadModal" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Transaction Details</h3>
          <div v-if="selectedInvoice" class="space-y-2">
            <p><strong>Invoice Number:</strong> {{ selectedInvoice.invoice_number }}</p>
            <p><strong>Plan:</strong> {{ selectedInvoice.plan }}</p>
            <p><strong>Amount:</strong> Rp {{ toIDR(selectedInvoice.total) }}</p>
            <p><strong>Date:</strong> {{ new Date(selectedInvoice.created_at).toLocaleString() }}</p>
            <p><strong>Status:</strong> <span class="font-semibold capitalize">{{ selectedInvoice.status }}</span></p>
            <div v-if="selectedInvoice.payment_receipt">
              <strong>Proof of Payment:</strong> <a :href="selectedInvoice.payment_receipt" target="_blank" class="text-blue-600 hover:underline">View Image</a>
            </div>
          </div>
          <div class="text-right mt-6">
            <button @click="closeDetailModal" class="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg">Close</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';
import { useToast } from '~/composables/useToast';

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { showToast } = useToast();

const invoices = ref([]);
const loading = ref(true);
const error = ref(null);

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
        status: 'waiting approve', 
        payment_receipt: url 
      })
      .eq('id', selectedInvoice.value.id);

    if (updateError) {
      throw updateError;
    }

    showToast({ type: 'success', message: 'Proof of payment uploaded successfully' });
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