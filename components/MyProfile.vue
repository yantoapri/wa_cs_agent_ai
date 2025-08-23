<template>
  <div class="w-full  bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Profile</h1>
          <p class="text-sm text-gray-600 mt-1">Manage your profile and account settings</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-6">
      <div class="w-full">
        <!-- Profile Information Card -->
        <div class="bg-white shadow-md rounded-lg mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Informasi Profil</h2>
            <p class="text-sm text-gray-600">Informasi dasar akun Anda</p>
          </div>
          <div class="p-6">
            <div class="flex items-center mb-6">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ userEmail || 'User' }}</h3>
                <p class="text-sm text-gray-500">Akun Pengguna</p>
              </div>
            </div>
        
          </div>
        </div>

        <!-- Change Password Card -->
        <div class="bg-white shadow-md rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Ubah Password</h2>
            <p class="text-sm text-gray-600">Perbarui password untuk keamanan akun</p>
          </div>
          <div class="p-6">
            <form @submit.prevent="updatePassword" class="space-y-6">
              <!-- Success/Error Message -->
              <div
                v-if="message"
                :class="[
                  'p-4 rounded-lg border',
                  messageType === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                ]"
              >
                <div class="flex items-center">
                  <svg
                    v-if="messageType === 'success'"
                    class="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ message }}
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="newPassword"
                    type="password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan password baru"
                    required
                    minlength="6"
                  />
                  <p class="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="confirmPassword"
                    type="password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Konfirmasi password baru"
                    required
                    minlength="6"
                  />
                </div>
              </div>

              <div class="flex justify-end pt-4">
                <button
                  type="submit"
                  class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  :disabled="loading"
                >
                  <svg
                    v-if="loading"
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {{ loading ? "Menyimpan..." : "Update Password" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useSupabaseUser, useSupabaseClient } from "#imports";

const user = useSupabaseUser();
const supabase = useSupabaseClient();

const userEmail = computed(() => user.value?.email || "");
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const message = ref("");
const messageType = ref("");

async function updatePassword() {
  message.value = "";
  messageType.value = "";
  if (newPassword.value !== confirmPassword.value) {
    message.value = "Password dan konfirmasi tidak sama.";
    messageType.value = "error";
    return;
  }
  loading.value = true;
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    });
    if (error) {
      message.value = error.message || "Gagal update password.";
      messageType.value = "error";
    } else {
      message.value = "Password berhasil diupdate!";
      messageType.value = "success";
      newPassword.value = "";
      confirmPassword.value = "";
    }
  } catch (e) {
    message.value = e.message || "Gagal update password.";
    messageType.value = "error";
  } finally {
    loading.value = false;
  }
}
</script>
