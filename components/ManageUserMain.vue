<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p class="text-sm text-gray-600 mt-1">Kelola pengguna dan peran mereka</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-4 md:p-6 overflow-y-auto">
      <!-- Filters -->
      <div class="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search by Name/Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cari Pengguna</label>
            <input
              v-model="searchUser"
              type="text"
              placeholder="Cari berdasarkan nama atau email..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Filter by Package -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Paket</label>
            <select
              v-model="filterPackage"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Paket</option>
              <option value="no-package">Tidak Ada Paket</option>
              <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">
                {{ pkg.name }}
              </option>
            </select>
          </div>

          <!-- Filter by Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Peran</label>
            <select
              v-model="filterRole"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Peran</option>
              <option value="1">Superadmin</option>
              <option value="2">Klien</option>
            </select>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-4">
          <div class="text-sm text-gray-600">
            Showing {{ filteredUsers.length }} of {{ users.length }} users
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <button
              @click="clearFilters"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Hapus Filter
            </button>
            <!-- <button
              @click="openAddModal"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah Pengguna
            </button> -->
          </div>
        </div>
      </div>

    <div v-if="loading" class="text-center py-8">Memuat...</div>
    <div v-else-if="error" class="text-red-500 text-center py-8">{{ error }}</div>
    <div v-else-if="filteredUsers.length === 0 && users.length > 0" class="bg-white shadow-md rounded-lg p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada pengguna ditemukan</h3>
      <p class="mt-1 text-sm text-gray-500">Tidak ada pengguna yang cocok dengan filter Anda. Coba sesuaikan kriteria pencarian.</p>
      <div class="mt-6">
        <button
          @click="clearFilters"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Hapus semua filter
        </button>
      </div>
    </div>
    <div v-else-if="users.length === 0" class="bg-white shadow-md rounded-lg p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada pengguna</h3>
      <p class="mt-1 text-sm text-gray-500">Belum ada pengguna di sistem.</p>
    </div>
    
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <!-- Mobile: Stack cards instead of table -->
      <div class="block md:hidden">
        <div v-for="user in filteredUsers" :key="user.id" class="border-b border-gray-200 p-4">
          <div class="space-y-2">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium text-gray-900">{{ user.username }}</p>
                <p class="text-sm text-gray-600">{{ user.email }}</p>
              </div>
              <div v-if="user.role?.id !== 1" class="flex gap-2">
                <button @click="openEditModal(user)" class="text-blue-600 hover:text-blue-900 text-sm">Ubah</button>
                <button @click="openDeleteModal(user)" class="text-red-600 hover:text-red-900 text-sm">Hapus</button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-500">Paket:</span>
                <div v-if="user?.package" class="mt-1">
                  <span 
                    class="inline-flex items-center gap-x-1.5 py-1 px-2 rounded-full text-xs font-medium border"
                    :class="getPackageColorClass(user.package.id)"
                  >
                    {{ user.package.name }}
                  </span>
                </div>
                <span v-else class="text-gray-400">No Package</span>
              </div>
              <div>
                <span class="text-gray-500">Peran:</span>
                <p class="font-medium">{{ user.role?.name || user.role }}</p>
              </div>
              <div v-if="user.role?.id === 2">
                <span class="text-gray-500">Mulai:</span>
                <p>{{ formatDate(user.start_at) }}</p>
              </div>
              <div v-if="user.role?.id === 2">
                <span class="text-gray-500">Akhir:</span>
                <p>{{ formatDate(user.end_at) }}</p>
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
                Nama
              </th>
              <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Paket
              </th>
              <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Mulai Pada
              </th>
              <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Berakhir Pada
              </th>
              <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Peran
              </th>
              <th class="px-3 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">{{ user.username }}</p>
              </td>
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">{{ user.email }}</p>
              </td>
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                <div v-if="user?.package">
                  <span 
                    class="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium border"
                    :class="getPackageColorClass(user.package.id)"
                  >
                    {{ user.package.name }}
                  </span>
                </div>
                <span v-else class="text-gray-400">Tidak Ada Paket</span>
              </td>
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">
                  {{ user.role?.id === 2 ? formatDate(user.start_at) : "-" }}
                </p>
              </td>
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">
                  {{ user.role?.id === 2 ? formatDate(user.end_at) : "-" }}
                </p>
              </td>
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">{{ user.role?.name || user.role }}</p>
              </td>
              <td class="px-3 py-5 border-b border-gray-200 bg-white text-sm text-right">
                <template v-if="user.role?.id !== 1">
                  <button @click="openEditModal(user)" class="text-blue-600 hover:text-blue-900 mr-4">Ubah</button>
                  <button @click="openDeleteModal(user)" class="text-red-600 hover:text-red-900">Hapus</button>
                </template>
                <span v-else class="text-gray-400 text-sm">Dilindungi</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">{{ isEditMode ? 'Ubah Pengguna' : 'Tambah Pengguna Baru' }}</h3>
          <form @submit.prevent="isEditMode ? updateUser() : addUser()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                <input v-model="form.name" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input v-model="form.email" type="email" required :disabled="isEditMode" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div v-if="!isEditMode">
                <label class="block text-sm font-medium text-gray-700 mb-1">Kata Sandi *</label>
                <div class="relative">
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    class="input-with-icon"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      v-if="showPassword"
                      class="h-4 w-4 text-gray-400 hover:text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                    <svg
                      v-else
                      class="h-4 w-4 text-gray-400 hover:text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Peran *</label>
                <select v-model="form.role" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="2">Klien</option>
                  <option value="1">Superadmin</option>
                </select>
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button type="submit" :disabled="saving" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg">
                {{ saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
              <button type="button" @click="closeModal" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg">
                Batal
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
          <h3 class="text-lg font-semibold mb-4 text-red-600">Hapus Pengguna</h3>
          <p>Apakah Anda yakin ingin menghapus <strong>{{ userToDelete?.username }}</strong>?</p>
          <div class="flex gap-3 mt-6">
            <button @click="confirmDelete" :disabled="deleting" class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg">
              {{ deleting ? 'Menghapus...' : 'Hapus' }}
            </button>
            <button @click="closeDeleteModal" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg">
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useUsers } from '~/composables/useUsers';
import { useSupabaseClient } from '#imports';
import Swal from 'sweetalert2';

const supabase = useSupabaseClient();

const {
  users,
  loading,
  error,
  fetchUsers,
  addUser: createUser,
  updateUser: editUser,
  deleteUser: removeUser,
} = useUsers();

// Filter variables
const searchUser = ref('');
const filterPackage = ref('');
const filterRole = ref('');
const packages = ref([]);

// Computed filtered users
const filteredUsers = computed(() => {
  let filtered = [...users.value];

  // Filter by search term (name or email)
  if (searchUser.value) {
    const searchTerm = searchUser.value.toLowerCase();
    filtered = filtered.filter(user => 
      user.username?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by package
  if (filterPackage.value) {
    if (filterPackage.value === 'no-package') {
      filtered = filtered.filter(user => !user.package);
    } else {
      filtered = filtered.filter(user => user.package?.id === parseInt(filterPackage.value));
    }
  }

  // Filter by role
  if (filterRole.value) {
    filtered = filtered.filter(user => {
      const userRole = user.role?.id || user.role;
      return userRole === parseInt(filterRole.value);
    });
  }

  return filtered;
});

// Clear filters function
function clearFilters() {
  searchUser.value = '';
  filterPackage.value = '';
  filterRole.value = '';
}

// Fetch packages for filter dropdown
async function fetchPackages() {
  try {
    const { data, error: fetchError } = await supabase
      .from('package')
      .select('id, name')
      .order('name');

    if (fetchError) {
      throw fetchError;
    }

    packages.value = data;
  } catch (e) {
    console.error('Error fetching packages:', e);
  }
}

const showModal = ref(false);
const showDeleteConfirm = ref(false);
const isEditMode = ref(false);
const saving = ref(false);
const deleting = ref(false);
const userToDelete = ref(null);
const showPassword = ref(false);

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
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
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
    Swal.fire('Berhasil', 'Pengguna berhasil ditambahkan', 'success');
  } catch (err) {
    Swal.fire('Kesalahan', err.message, 'error');
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
    Swal.fire('Berhasil', 'Pengguna berhasil diperbarui', 'success');
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
    Swal.fire('Kesalahan', 'Tidak dapat menghapus pengguna tanpa ID autentikasi.', 'error');
    return;
  }
  deleting.value = true;
  try {
    await removeUser(userToDelete.value.auth_id);
    await fetchUsers();
    closeDeleteModal();
    Swal.fire('Berhasil', 'Pengguna berhasil dihapus', 'success');
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  await fetchUsers();
  await fetchPackages();
});
</script>

<style scoped>
.input-with-icon {
  width: 100%;
  padding: 0.5rem 0.75rem;
  padding-right: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.2s;
}

.input-with-icon:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}
</style>
