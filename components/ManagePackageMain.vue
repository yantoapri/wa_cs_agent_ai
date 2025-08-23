<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900">Package Management</h1>
          <p class="text-sm text-gray-600 mt-1">Manage subscription packages</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="openAddModal"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Package
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 p-4 md:p-6 overflow-y-auto">
      <div v-if="loading" class="text-center">Loading...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>

      <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
        <!-- Mobile: Stack cards instead of table -->
        <div class="block md:hidden">
          <div v-for="pkg in packages" :key="pkg.id" class="border-b border-gray-200 p-4">
            <div class="space-y-3">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium text-gray-900">{{ pkg.name }}</h3>
                  <p class="text-lg font-bold text-blue-600">{{ pkg.harga }}</p>
                </div>
                <div class="flex gap-2">
                  <button @click="openEditModal(pkg)" class="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                  <button @click="openDeleteModal(pkg)" class="text-red-600 hover:text-red-900 text-sm">Delete</button>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-gray-500">Exp Days:</span>
                  <p class="font-medium">{{ pkg.exp_date }}</p>
                </div>
                <div>
                  <span class="text-gray-500">AI Limit:</span>
                  <p class="font-medium">{{ pkg.limit_ai }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Agent:</span>
                  <p class="font-medium">{{ pkg.limit_agent }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Broadcast:</span>
                  <p class="font-medium">{{ pkg.limit_broadcast }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Channel:</span>
                  <p class="font-medium">{{ pkg.limit_chanel }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Product:</span>
                  <p class="font-medium">{{ pkg.limit_produk }}</p>
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
                  Name
                </th>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Exp Days
                </th>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  AI Limit
                </th>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Agent Limit
                </th>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Broadcast
                </th>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Channel
                </th>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pkg in packages" :key="pkg.id">
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ pkg.name }}</p>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ pkg.harga }}</p>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ pkg.exp_date }}</p>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ pkg.limit_ai }}</p>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ pkg.limit_agent }}</p>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ pkg.limit_broadcast }}</p>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ pkg.limit_chanel }}</p>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ pkg.limit_produk }}</p>
                </td>
                <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <button @click="openEditModal(pkg)" class="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                  <button @click="openDeleteModal(pkg)" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Package Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">{{ isEditMode ? 'Edit Package' : 'Add New Package' }}</h3>
          <form @submit.prevent="isEditMode ? updatePackage() : addPackage()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input v-model="form.name" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <input v-model="form.harga" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Expires In (Days) *</label>
                <input v-model.number="form.exp_date" type="number" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">AI Limit *</label>
                <input v-model.number="form.limit_ai" type="number" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Agent Limit *</label>
                <input v-model.number="form.limit_agent" type="number" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Broadcast Limit *</label>
                <input v-model.number="form.limit_broadcast" type="number" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Channel Limit *</label>
                <input v-model.number="form.limit_chanel" type="number" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Product Limit *</label>
                <input v-model.number="form.limit_produk" type="number" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea v-model="form.deskripsi" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button type="submit" :disabled="saving" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg">
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
              <button type="button" @click="closeModal" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4 text-red-600">Delete Package</h3>
          <p>Are you sure you want to delete <strong>{{ packageToDelete?.name }}</strong>?</p>
          <div class="flex gap-3 mt-6">
            <button @click="confirmDelete" :disabled="deleting" class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg">
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
            <button @click="closeDeleteModal" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { usePackages } from '~/composables/usePackages';
import Swal from 'sweetalert2';

const {
  packages,
  loading,
  error,
  fetchPackages,
  addPackage: createPackage,
  updatePackage: editPackage,
  deletePackage: removePackage,
} = usePackages();

const showModal = ref(false);
const showDeleteConfirm = ref(false);
const isEditMode = ref(false);
const saving = ref(false);
const deleting = ref(false);
const packageToDelete = ref(null);

const form = reactive({
  name: '',
  limit_ai: 0,
  deskripsi: '',
  exp_date: 0,
  harga: '',
  limit_agent: 0,
  limit_broadcast: 0,
  limit_produk: 0,
  limit_chanel: 0,
});

const resetForm = () => {
  form.name = '';
  form.limit_ai = 0;
  form.deskripsi = '';
  form.exp_date = 0;
  form.harga = '';
  form.limit_agent = 0;
  form.limit_broadcast = 0;
  form.limit_produk = 0;
  form.limit_chanel = 0;
};

const openAddModal = () => {
  resetForm();
  isEditMode.value = false;
  showModal.value = true;
};

const openEditModal = (pkg) => {
  resetForm();
  isEditMode.value = true;
  form.id = pkg?.id;
  form.name = pkg.name || '';
  form.limit_ai = pkg.limit_ai || 0;
  form.deskripsi = pkg.deskripsi || '';
  form.exp_date = pkg.exp_date || 0;
  form.harga = pkg.harga || '';
  form.limit_agent = pkg.limit_agent || 0;
  form.limit_broadcast = pkg.limit_broadcast || 0;
  form.limit_produk = pkg.limit_produk || 0;
  form.limit_chanel = pkg.limit_chanel || 0;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const addPackage = async () => {
  saving.value = true;
  try {
    await createPackage({ ...form });
    await fetchPackages();
    closeModal();
    Swal.fire('Success', 'Package added successfully', 'success');
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  } finally {
    saving.value = false;
  }
};

const updatePackage = async () => {
  saving.value = true;
  try {
    await editPackage(form.id, { ...form });
    await fetchPackages();
    closeModal();
    Swal.fire('Success', 'Package updated successfully', 'success');
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  } finally {
    saving.value = false;
  }
};

const openDeleteModal = (pkg) => {
  packageToDelete.value = pkg;
  showDeleteConfirm.value = true;
};

const closeDeleteModal = () => {
  showDeleteConfirm.value = false;
  packageToDelete.value = null;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await removePackage(packageToDelete.value.id);
    await fetchPackages();
    closeDeleteModal();
    Swal.fire('Success', 'Package deleted successfully', 'success');
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  } finally {
    deleting.value = false;
  }
};

onMounted(fetchPackages);
</script>