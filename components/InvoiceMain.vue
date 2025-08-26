<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900">Invoice Management</h1>
          <p class="text-sm text-gray-600 mt-1">Manage customer invoices and payments</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-4 md:p-6 overflow-y-auto">
      <!-- Filters -->
      <div class="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search by Username -->
          <div class="sm:col-span-2 lg:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search Username</label>
            <input
              v-model="searchUsername"
              type="text"
              placeholder="Search by username..."
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
              <option value="">All Status</option>
              <option v-for="status in statusOptions" :key="status.id" :value="status.id">
                {{ status.name }}
              </option>
            </select>
          </div>

          <!-- Date From -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              v-model="dateFrom"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Date To -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              v-model="dateTo"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-4">
          <div class="text-sm text-gray-600">
            Showing {{ filteredInvoices.length }} of {{ invoices.length }} invoices
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <button
              @click="clearFilters"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
            <button
              @click="applyFilters"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="mt-2 text-gray-600">Loading invoices...</p>
      </div>
      <div v-else-if="error" class="text-red-500 text-center py-8">
        <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">{{ error }}</p>
      </div>
      <div v-else-if="invoices.length === 0" class="bg-white shadow-md rounded-lg p-8 md:p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm md:text-base font-medium text-gray-900">No invoices</h3>
        <p class="mt-1 text-sm text-gray-500">There are no invoices in the system yet.</p>
      </div>
      <div v-else-if="filteredInvoices.length === 0" class="bg-white shadow-md rounded-lg p-8 md:p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm md:text-base font-medium text-gray-900">No invoices found</h3>
        <p class="mt-1 text-sm text-gray-500">No invoices match your current filters. Try adjusting your search criteria.</p>
        <div class="mt-6">
          <button
            @click="clearFilters"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      </div>

      <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
        <!-- Mobile: Stack cards instead of table -->
        <div class="block md:hidden">
          <div v-for="invoice in filteredInvoices" :key="invoice.id" class="border-b border-gray-200 p-4 last:border-b-0">
            <div class="space-y-3">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div class="flex-1">
                  <p class="font-medium text-gray-900 text-base">{{ invoice.invoice_number }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ invoice.user.email }}</p>
                  <div class="mt-2">
                    <span
                      :class="{'bg-yellow-200 text-yellow-800': invoice.status.id===1,'bg-green-200 text-green-800': invoice.status.id === 2,'bg-blue-200 text-blue-800': invoice.status.id === 3,}"
                      class="px-2 py-1 rounded-full text-xs font-semibold"
                    >
                      {{ invoice.status.name }}
                    </span>
                  </div>
                </div>
                <div class="flex flex-row sm:flex-col gap-2 sm:gap-1">
                  <button v-if="invoice.status.id === 2" @click="approveInvoice(invoice)" 
                    class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                    Approve
                  </button>
                  <button @click="openDetailModal(invoice)" 
                    class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors">
                    Detail
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <span class="text-xs text-gray-500 uppercase tracking-wide">Plan</span>
                  <p class="font-medium text-sm mt-1">{{ invoice.plan.name }}</p>
                </div>
                <div>
                  <span class="text-xs text-gray-500 uppercase tracking-wide">Amount</span>
                  <p class="font-medium text-sm mt-1 text-green-600">Rp {{ toIDR(invoice.total) }}</p>
                </div>
                <div class="col-span-2">
                  <span class="text-xs text-gray-500 uppercase tracking-wide">Date</span>
                  <p class="font-medium text-sm mt-1">{{ formatDate(invoice.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop: Table view -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead>
              <tr>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Plan
                </th>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
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
                  <p class="text-gray-900 whitespace-no-wrap">{{ invoice.user.email }}</p>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ invoice.plan.name }}</p>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">Rp {{ toIDR(invoice.total) }}</p>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ formatDate(invoice.created_at) }}</p>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    :class="{'bg-yellow-200 text-yellow-800': invoice.status.id===1,'bg-green-200 text-green-800': invoice.status.id === 2,'bg-blue-200 text-blue-800': invoice.status.id === 3,}"
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                  >
                    {{ invoice.status.name }}
                  </span>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <button v-if="invoice?.status?.id === 2" @click="approveInvoice(invoice)" class="text-green-600 hover:text-green-900 mr-4">Approve</button>
                  <button @click="openDetailModal(invoice)" class="text-gray-600 hover:text-gray-900 mr-4">Detail</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-4 md:p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg md:text-xl font-semibold">Transaction Details</h3>
            <button @click="closeDetailModal" class="text-gray-400 hover:text-gray-600 md:hidden">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div v-if="selectedInvoice" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500 uppercase tracking-wide">Invoice Number</p>
                <p class="font-medium">{{ selectedInvoice.invoice_number }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 uppercase tracking-wide">User</p>
                <p class="font-medium">{{ selectedInvoice.user.email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 uppercase tracking-wide">Plan</p>
                <p class="font-medium">{{ selectedInvoice.plan.name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 uppercase tracking-wide">Amount</p>
                <p class="font-medium text-green-600">Rp {{ toIDR(selectedInvoice.total) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 uppercase tracking-wide">Date</p>
                <p class="font-medium">{{ formatDate(selectedInvoice.created_at, true) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 uppercase tracking-wide">Status</p>
                <span
                  :class="{'bg-yellow-200 text-yellow-800': selectedInvoice.status.id===1,'bg-green-200 text-green-800': selectedInvoice.status.id === 2,'bg-blue-200 text-blue-800': selectedInvoice.status.id === 3,}"
                  class="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                >
                  {{ selectedInvoice.status.name }}
                </span>
              </div>
            </div>
            <div v-if="selectedInvoice.payment_receipt" class="border-t pt-4">
              <p class="text-sm text-gray-500 uppercase tracking-wide mb-2">Proof of Payment</p>
              <a :href="selectedInvoice.payment_receipt" target="_blank" 
                class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Image
              </a>
            </div>
          </div>
          <div class="flex justify-end mt-6 pt-4 border-t">
            <button @click="closeDetailModal" 
              class="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useSupabaseClient } from '#imports';
import { useToast } from '~/composables/useToast';

const supabase = useSupabaseClient();
const { showToast } = useToast();

const invoices = ref([]);
const loading = ref(true);
const error = ref(null);

const showDetailModal = ref(false);
const selectedInvoice = ref(null);

// Filter variables
const searchUsername = ref('');
const filterStatus = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const statusOptions = ref([]);

// Computed filtered invoices
const filteredInvoices = computed(() => {
  let filtered = [...invoices.value];

  // Filter by username
  if (searchUsername.value) {
    filtered = filtered.filter(invoice => 
      invoice.user.email.toLowerCase().includes(searchUsername.value.toLowerCase())
    );
  }

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(invoice => invoice.status.id === filterStatus.value);
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
  searchUsername.value = '';
  filterStatus.value = '';
  dateFrom.value = '';
  dateTo.value = '';
}

// Apply filters function (optional, since computed property auto-updates)
function applyFilters() {
  // This function can be used for additional filter logic if needed
  // The computed property already handles real-time filtering
  showToast({ type: 'info', message: `Filtered ${filteredInvoices.value.length} invoices` });
}

async function fetchStatusOptions() {
  try {
    const { data, error: statusError } = await supabase
      .from('status_invoice')
      .select('id, name')
      .order('id');

    if (statusError) {
      throw statusError;
    }

    statusOptions.value = data;
  } catch (e) {
    console.error('Error fetching status options:', e);
  }
}

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

    // Send email notification to user
    try {
      const emailResponse = await $fetch('/api/send-approval-email', {
        method: 'POST',
        body: {
          userEmail: invoice.user?.email,
          userName: invoice.user?.name || invoice.user?.email,
          invoiceNumber: invoice.id,
          amount: invoice.amount,
          planName: invoice.plan?.name ,
          startDate: formatDate(now),
          endDate: formatDate(endDate)
        }
      });
      
      if (emailResponse.success) {
        showToast({ type: 'success', message: 'Invoice approved and email notification sent' });
      } else {
        showToast({ type: 'success', message: 'Invoice approved (email notification failed)' });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      showToast({ type: 'success', message: 'Invoice approved (email notification failed)' });
    }

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

onMounted(async () => {
  await fetchInvoices();
  await fetchStatusOptions();
});
</script>