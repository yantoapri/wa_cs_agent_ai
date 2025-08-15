<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Invoice Management</h1>
          <p class="text-sm text-gray-600 mt-1">Manage invoices and payment records</p>
        </div>
     
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white border-b border-gray-200 px-6 py-3">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            @input="fetchInvoices"
            placeholder="Search invoices..."
            class="w-1/3 xs:w-full px-3 mr-2 xs:mr-0 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
           <input
          v-model="dateFilter"
          @input="fetchInvoices"
          type="month"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        </div>
      
       
      </div>
    </div>



    <!-- Tabs -->
    <div class="bg-white border-b border-gray-200">
      <div class="flex border-b border-gray-200">
        
        <button 
          @click="activeTab = 1"
          :class="['px-6 py-3 font-medium text-sm', activeTab === 1 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']"
        >
          Waiting Payment
        </button>
        <button 
          @click="activeTab = 2"
          :class="['px-6 py-3 font-medium text-sm', activeTab === 2 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']"
        >
          Waiting Approve
        </button>
        <button 
          @click="activeTab = 3"
          :class="['px-6 py-3 font-medium text-sm', activeTab === 3 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']"
        >
          Completed
        </button>
        <button 
          @click="activeTab = 4"
          :class="['px-6 py-3 font-medium text-sm', activeTab === 4 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']"
        >
          Expired Payment
        </button>
      </div>
    </div>

    <!-- Invoices Table -->
    <div class="flex-1 overflow-auto">
      <div class="bg-white">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="invoice in tabInvoices" :key="invoice.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">#{{ invoice.invoice_number }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="invoice.users?.avatar || `https://ui-avatars.com/api/?name=${invoice.user_id?.username
 || 'Unknown'}&background=random`"
                    :alt="invoice.user_id?.username
 || 'Unknown'"
                    class="h-8 w-8 rounded-full"
                  />
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">{{ invoice.user_id?.username
 || 'Unknown' }}</div>
                    <div class="text-sm text-gray-500">{{ invoice.user_id?.email || '' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ invoice.plan?.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ toIDR(invoice.total) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusColor(invoice?.status.id)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ invoice?.status.name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>{{ formatDate(invoice.created_at) }}</div>
                <div v-if="invoice.due_date" class="text-xs text-gray-400">
                  Due: {{ formatDate(invoice.due_date) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="openDetailModal(invoice)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Detail
                  </button>
                  <button
                  v-if="invoice.status === 2"
                    @click="approveInvoice(invoice)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Approve
                  </button>
                  
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="tabInvoices && tabInvoices.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
          <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>

        <!-- Pagination Controls -->
        <div class="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-700">Items per page:</span>
            <select 
              v-model="itemsPerPage"
              @change="changeItemsPerPage(itemsPerPage)"
              class="px-2 py-1 text-sm border border-gray-300 rounded-md"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-700">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
              {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} items
            </span>
            <div class="flex gap-1">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
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
            <p><strong>Plan:</strong> {{ selectedInvoice.plan?.name || 'N/A' }}</p>
            <p><strong>Amount:</strong> Rp {{ toIDR(selectedInvoice.total) }}</p>
            <p><strong>Date:</strong> {{ formatDate(selectedInvoice.created_at) }}</p>
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
import { ref, computed, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()

// State
const invoices = ref([]) // Ensure always initialized as array
const tabInvoices = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
const showDetailModal = ref(false)
const selectedInvoice = ref(null)



// Computed
const activeTab = ref(1)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const totalRevenue=ref(0)
const pendingInvoices= ref(0)
// Methods
const fetchInvoices = async () => {
  if (!activeTab.value) return;

  loading.value = true;
  try {
    const from = (currentPage.value - 1) * itemsPerPage.value;
    const to = from + itemsPerPage.value - 1;

    let query = supabase
      .from('invoices')
      .select(`
        *,
        user_id(*),
        plan(*),
        status(*)
      `, { count: 'exact' })
      .eq('status', activeTab.value);

    if (searchQuery.value) {
      query = query.ilike('invoice_number', `%${searchQuery.value}%`);
    }

    if (dateFilter.value) {
      const year = parseInt(dateFilter.value.split('-')[0]);
      const month = parseInt(dateFilter.value.split('-')[1]);
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    tabInvoices.value = data;
    totalItems.value = count || 0;
  } catch (error) {
    console.error('Error fetching invoices:', error);
  } finally {
    loading.value = false;
  }
};

// Pagination controls
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / itemsPerPage.value)
})

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchInvoices()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchInvoices()
  }
}

const changeItemsPerPage = (value) => {
  itemsPerPage.value = value
  currentPage.value = 1
  fetchInvoices()
}


const approveInvoice = async (invoice) => {
  try {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 3 }) // Update to 'completed' status
      .eq('id', invoice.id)

    if (error) throw error
    await fetchInvoices()
  } catch (error) {
    console.error('Error approving invoice:', error)
  }
}

const deleteInvoice = async (invoice) => {
  if (!confirm('Are you sure you want to delete this invoice?')) return

  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoice.id)

    if (error) throw error
    await fetchInvoices()
  } catch (error) {
    console.error('Error deleting invoice:', error)
  }
}

const openDetailModal = (invoice) => {
  selectedInvoice.value = invoice
  showDetailModal.value = true
}

const closeDetailModal = () => {
  selectedInvoice.value = null
  showDetailModal.value = false
}

const sendInvoice = (invoice) => {
  console.log('Send invoice:', invoice)
  alert('Invoice sent successfully!')
}



const getStatusColor = (status) => {
  switch (status) {
    case 1:
      return 'bg-blue-100 text-blue-800'
    case 2:
      return 'bg-yellow-100 text-yellow-800'
    case 3:
      return 'bg-green-100 text-green-800'
    case 4:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const toIDR = (n) => {
  return (n || 0).toLocaleString('id-ID');
}

// Lifecycle hooks
onMounted(() => {
  fetchInvoices()
})

// Watch for tab changes
watch(activeTab, () => {
  currentPage.value = 1
  fetchInvoices()
})
</script>
