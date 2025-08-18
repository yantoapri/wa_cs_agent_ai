<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Invoices</h2>

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
              User
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
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in invoices" :key="invoice.id">
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ invoice.invoice_number }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ invoice.user.email }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ invoice.plan.name }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">Rp {{ toIDR(invoice.total) }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ new Date(invoice.created_at).toLocaleDateString() }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <span
                :class="{'bg-yellow-200 text-yellow-800': invoice.status.id===1,'bg-green-200 text-green-800': invoice.status.id === 2,'bg-blue-200 text-blue-800': invoice.status.id === 3,}"
                class="px-2 py-1 rounded-full text-xs font-semibold"
              >
                {{ invoice.status.name }}
              </span>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <button v-if="invoice.status.id === 2" @click="approveInvoice(invoice)" class="text-green-600 hover:text-green-900 mr-4">Approve</button>
              <button @click="openDetailModal(invoice)" class="text-gray-600 hover:text-gray-900 mr-4">Detail</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Transaction Details</h3>
          <div v-if="selectedInvoice" class="space-y-2">
            <p><strong>Invoice Number:</strong> {{ selectedInvoice.invoice_number }}</p>
            <p><strong>User:</strong> {{ selectedInvoice.user.email }}</p>
            <p><strong>Plan:</strong> {{ selectedInvoice.plan.name }}</p>
            <p><strong>Amount:</strong> Rp {{ toIDR(selectedInvoice.total) }}</p>
            <p><strong>Date:</strong> {{ new Date(selectedInvoice.created_at).toLocaleString() }}</p>
            <p><strong>Status:</strong> <span class="font-semibold capitalize">{{ selectedInvoice.status.name }}</span></p>
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
import { useSupabaseClient } from '#imports';
import { useToast } from '~/composables/useToast';

const supabase = useSupabaseClient();
const { showToast } = useToast();

const invoices = ref([]);
const loading = ref(true);
const error = ref(null);

const showDetailModal = ref(false);
const selectedInvoice = ref(null);

async function fetchInvoices() {
  loading.value = true;
  try {
    const { data, error: fetchError } = await supabase
      .from('invoices')
      .select('*, user:users(*), plan(*), status:status_invoice(*)')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    invoices.value = data;
  } catch (e) {
    error.value = e.message;
    console.error('Error fetching invoices:', e);
  } finally {
    loading.value = false;
  }
}

function toIDR(n) {
  return (n || 0).toLocaleString('id-ID');
}

function openDetailModal(invoice) {
  selectedInvoice.value = invoice;
  showDetailModal.value = true;
}

function closeDetailModal() {
  selectedInvoice.value = null;
  showDetailModal.value = false;
}

async function approveInvoice(invoice) {
  try {
    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({ status: 3 }) // Assuming 3 is the ID for 'paid'
      .eq('id', invoice.id);

    if (invoiceError) {
      throw invoiceError;
    }

    const now = new Date();
    let endDate = new Date(now);

    if (invoice.billing_cycle === 'monthly') {
      endDate.setDate(now.getDate() + invoice.plan.exp_date);
    } else if (invoice.billing_cycle === 'yearly') {
      endDate.setDate(now.getDate() + (invoice.plan.exp_date * 12) + 60);
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .update({
        start_at: now.toISOString(),
        end_at: endDate.toISOString(),
        is_trial:false,
        is_active:true
      })
      .eq('id', invoice.user_id);

    if (userError) {
      throw userError;
    }

    showToast({ type: 'success', message: 'Invoice approved successfully' });
    await fetchInvoices();
  } catch (error) {
    showToast({ type: 'error', message: 'Failed to approve invoice' });
    console.error('Error approving invoice:', error);
  }
}

async function deleteInvoice(invoice) {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoice.id);

    if (error) {
      throw error;
    }

    showToast({ type: 'success', message: 'Invoice deleted successfully' });
    await fetchInvoices();
  } catch (error) {
    showToast({ type: 'error', message: 'Failed to delete invoice' });
    console.error('Error deleting invoice:', error);
  }
}

function sendInvoice(invoice) {
  // Logic to send invoice, e.g., via email
  showToast({ type: 'info', message: `Sending invoice ${invoice.invoice_number}...` });
}

onMounted(fetchInvoices);
</script>