<template>
  <div class="w-full p-6 ">
    <div class="w-full bg-white p-8 rounded-lg shadow h-full">
      <div class="w-1/3">
        <h1 class="text-2xl font-bold mb-6">My Profile</h1>
    <div class="mb-6">
      <label class="block text-gray-700 font-medium mb-1">Email</label>
      <input
        type="email"
        :value="userEmail"
        readonly
        class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
      />
    </div>
    <form @submit.prevent="updatePassword">
      <h2 class="text-lg font-semibold mb-3">Update Password</h2>
      <div class="mb-4">
        <label class="block text-gray-700 mb-1">Password Baru</label>
        <input
          v-model="newPassword"
          type="password"
          class="w-full px-3 py-2 border border-gray-300 rounded"
          required
          minlength="6"
        />
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 mb-1">Konfirmasi Password</label>
        <input
          v-model="confirmPassword"
          type="password"
          class="w-full px-3 py-2 border border-gray-300 rounded"
          required
          minlength="6"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
        :disabled="loading"
      >
        {{ loading ? "Menyimpan..." : "Update Password" }}
      </button>
      <div
        v-if="message"
        :class="
          messageType === 'success'
            ? 'text-green-600 mt-4'
            : 'text-red-600 mt-4'
        "
      >
        {{ message }}
      </div>
    </form>
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
