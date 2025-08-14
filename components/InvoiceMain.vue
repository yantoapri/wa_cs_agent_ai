<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Invoice Management</h1>
          <p class="text-sm text-gray-600 mt-1">Manage invoices and payment records</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="exportInvoices"
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Export
          </button>
          <button
            @click="showCreateInvoiceModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Create Invoice
          </button>
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
            placeholder="Search invoices..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          v-model="dateFilter"
          type="month"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-blue-600">Total Invoices</p>
              <p class="text-2xl font-semibold text-blue-900">{{ invoices.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-green-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-green-600">Total Revenue</p>
              <p class="text-2xl font-semibold text-green-900">${{ totalRevenue.toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-yellow-600">Pending</p>
              <p class="text-2xl font-semibold text-yellow-900">{{ pendingInvoices }}</p>
            </div>
          </div>
        </div>

        <div class="bg-red-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-red-600">Overdue</p>
              <p class="text-2xl font-semibold text-red-900">{{ overdueInvoices }}</p>
            </div>
          </div>
        </div>
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
            <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">#{{ invoice.invoice_number }}</div>
                <div class="text-sm text-gray-500">{{ invoice.id }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="invoice.user?.avatar || `https://ui-avatars.com/api/?name=${invoice.user?.name}&background=random`"
                    :alt="invoice.user?.name"
                    class="h-8 w-8 rounded-full"
                  />
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">{{ invoice.user?.name || 'Unknown' }}</div>
                    <div class="text-sm text-gray-500">{{ invoice.user?.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ invoice.package?.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ invoice.amount?.toFixed(2) || '0.00' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusColor(invoice.status)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ invoice.status || 'pending' }}
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
                    @click="viewInvoice(invoice)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                  <button
                    v-if="invoice.status === 'pending'"
                    @click="markAsPaid(invoice)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Mark Paid
                  </button>
                  <button
                    @click="sendInvoice(invoice)"
                    class="text-purple-600 hover:text-purple-900"
                  >
                    Send
                  </button>
                  <button
                    @click="deleteInvoice(invoice)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="filteredInvoices.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
          <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      </div>
    </div>

    <!-- Create Invoice Modal -->
    <div v-if="showCreateInvoiceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Create New Invoice</h3>
        
        <form @submit.prevent="createInvoice">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Customer</label>
              <select
                v-model="invoiceForm.user_id"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Customer</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }} ({{ user.email }})
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Package</label>
              <select
                v-model="invoiceForm.package_id"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Package</option>
                <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">
                  {{ pkg.name }} - ${{ pkg.price }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Amount</label>
              <input
                v-model="invoiceForm.amount"
                type="number"
                step="0.01"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                v-model="invoiceForm.due_date"
                type="date"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="showCreateInvoiceModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {{ loading ? 'Creating...' : 'Create Invoice' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()

// State
const invoices = ref([])
const users = ref([])
const packages = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
const showCreateInvoiceModal = ref(false)

// Form data
const invoiceForm = ref({
  user_id: '',
  package_id: '',
  amount: 0,
  due_date: ''
})

// Computed
const filteredInvoices = computed(() => {
  let filtered = invoices.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(invoice => 
      invoice.invoice_number?.toLowerCase().includes(query) ||
      invoice.user?.name?.toLowerCase().includes(query) ||
      invoice.user?.email?.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(invoice => invoice.status === statusFilter.value)
  }

  if (dateFilter.value) {
    const [year, month] = dateFilter.value.split('-')
    filtered = filtered.filter(invoice => {
      const invoiceDate = new Date(invoice.created_at)
      return invoiceDate.getFullYear() == year && (invoiceDate.getMonth() + 1) == month
    })
  }

  return filtered
})

const totalRevenue = computed(() => {
  return invoices.value
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0)
})

const pendingInvoices = computed(() => {
  return invoices.value.filter(invoice => invoice.status === 'pending').length
})

const overdueInvoices = computed(() => {
  const now = new Date()
  return invoices.value.filter(invoice => {
    if (invoice.status !== 'pending') return false
    if (!invoice.due_date) return false
    return new Date(invoice.due_date) < now
  }).length
})

// Methods
const fetchInvoices = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        user:users(*),
        package:packages(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    invoices.value = data || []
  } catch (error) {
    console.error('Error fetching invoices:', error)
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .order('name')

    if (error) throw error
    users.value = data || []
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const fetchPackages = async () => {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('id, name, price')
      .eq('status', 'active')
      .order('name')

    if (error) throw error
    packages.value = data || []
  } catch (error) {
    console.error('Error fetching packages:', error)
  }
}

const createInvoice = async () => {
  loading.value = true
  try {
    const invoiceNumber = `INV-${Date.now()}`
    
    const { error } = await supabase
      .from('invoices')
      .insert([{
        ...invoiceForm.value,
        invoice_number: invoiceNumber,
        status: 'pending'
      }])

    if (error) throw error

    await fetchInvoices()
    showCreateInvoiceModal.value = false
    invoiceForm.value = {
      user_id: '',
      package_id: '',
      amount: 0,
      due_date: ''
    }
  } catch (error) {
    console.error('Error creating invoice:', error)
    alert('Error creating invoice: ' + error.message)
  } finally {
    loading.value = false
  }
}

const markAsPaid = async (invoice) => {
  try {
    const { error } = await supabase
      .from('invoices')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', invoice.id)

    if (error) throw error
    await fetchInvoices()
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
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

const viewInvoice = (invoice) => {
  // Open invoice in new tab or modal
  console.log('View invoice:', invoice)
}

const sendInvoice = (invoice) => {
  // Send invoice via email
  console.log('Send invoice:', invoice)
  alert('Invoice sent successfully!')
}

const exportInvoices = () => {
  // Export invoices to CSV
  console.log('Export invoices')
  alert('Export functionality would be implemented here')
}

const getStatusColor = (status) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  fetchInvoices()
  fetchUsers()
  fetchPackages()
})
</script>