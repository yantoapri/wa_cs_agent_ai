<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
          <p class="text-sm text-gray-600 mt-1">Manage users and their roles</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="openAddModal"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add User
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Name
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Email
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Package
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Start At
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              End At
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Role
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ user.username }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ user.email }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <div v-if="user?.package">
                <span 
                  class="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium border"
                  :class="getPackageColorClass(user.package.id)"
                >
                  {{ user.package.name }}
                </span>
              </div>
              <span v-else class="text-gray-400">No Package</span>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">
                {{ user.role?.id === 2 ? formatDate(user.start_at) : "-" }}
              </p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">
                {{ user.role?.id === 2 ? formatDate(user.end_at) : "-" }}
              </p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ user.role?.name || user.role }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
              <button @click="openEditModal(user)" class="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
              <button @click="openDeleteModal(user)" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">{{ isEditMode ? 'Edit User' : 'Add New User' }}</h3>
          <form @submit.prevent="isEditMode ? updateUser() : addUser()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input v-model="form.name" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input v-model="form.email" type="email" required :disabled="isEditMode" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div v-if="!isEditMode">
                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input v-model="form.password" type="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select v-model="form.role" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="2">Client</option>
                  <option value="1">Superadmin</option>
                </select>
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
          <h3 class="text-lg font-semibold mb-4 text-red-600">Delete User</h3>
          <p>Are you sure you want to delete <strong>{{ userToDelete?.username }}</strong>?</p>
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
import { useUsers } from '~/composables/useUsers';
import Swal from 'sweetalert2';

const {
  users,
  loading,
  error,
  fetchUsers,
  addUser: createUser,
  updateUser: editUser,
  deleteUser: removeUser,
} = useUsers();

const showModal = ref(false);
const showDeleteConfirm = ref(false);
const isEditMode = ref(false);
const saving = ref(false);
const deleting = ref(false);
const userToDelete = ref(null);

const form = reactive({
  id: null,
  auth_id: null,
  name: '',
  email: '',
  password: '',
  role: 2,
});

const resetForm = () => {
  form.id = null;
  form.auth_id = null;
  form.name = '';
  form.email = '';
  form.password = '';
  form.role = 2;
};

const getPackageColorClass = (packageId) => {
  const colorMap = {
    1: "border-yellow-500 text-yellow-500",
    2: "border-teal-500 text-teal-500", 
    3: "border-blue-600 text-blue-600",
    4: "border-gray-500 text-gray-500"
  };
  return colorMap[packageId] || "border-gray-300 text-gray-600";
};

const formatDate = (val) => {
  if (!val) return "-";
  try {
    const date = new Date(val);
    if (isNaN(date.getTime())) return "-";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  } catch (error) {
    return "-";
  }
};

const openAddModal = () => {
  resetForm();
  isEditMode.value = false;
  showModal.value = true;
};

const openEditModal = (user) => {
  console.log('Opening edit modal for user:', user);
  resetForm();
  isEditMode.value = true;
  form.id = user.id;
  form.auth_id = user.auth_id;
  form.name = user.username;
  form.email = user.email;
  form.role = user.role?.id || user.role;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const addUser = async () => {
  saving.value = true;
  try {
    await createUser({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    });
    await fetchUsers();
    closeModal();
    Swal.fire('Success', 'User added successfully', 'success');
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  } finally {
    saving.value = false;
  }
};

const updateUser = async () => {
  saving.value = true;
  try {
    await editUser(form.id, {
      name: form.name,
      role: form.role,
    });
    await fetchUsers();
    closeModal();
    Swal.fire('Success', 'User updated successfully', 'success');
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  } finally {
    saving.value = false;
  }
};

const openDeleteModal = (user) => {
  userToDelete.value = user;
  showDeleteConfirm.value = true;
};

const closeDeleteModal = () => {
  showDeleteConfirm.value = false;
  userToDelete.value = null;
};

const confirmDelete = async () => {
  if (!userToDelete.value || !userToDelete.value.auth_id) {
    Swal.fire('Error', 'Cannot delete user without an authentication ID.', 'error');
    return;
  }
  deleting.value = true;
  try {
    await removeUser(userToDelete.value.auth_id);
    await fetchUsers();
    closeDeleteModal();
    Swal.fire('Success', 'User deleted successfully', 'success');
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  } finally {
    deleting.value = false;
  }
};

onMounted(fetchUsers);
</script>