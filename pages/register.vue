<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100"
  >
    <div
      class="bg-white shadow-xl rounded-xl px-10 py-8 w-full max-w-md flex flex-col items-center"
    >
      <img
        src="/assets/img/nutra.png"
        alt="Nutra Logo"
        class="w-25 h-14 mb-4"
      />
      <h1 class="text-2xl font-bold mb-2 text-blue-700">Register</h1>
      <p class="mb-6 text-gray-500">
        Buat akun baru untuk mulai menggunakan aplikasi
      </p>
      <form @submit.prevent="register" class="w-full flex flex-col gap-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="input"
          required
          :disabled="loading"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="input"
          required
          :disabled="loading"
        />
        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading">
            <svg
              class="animate-spin h-5 w-5 inline-block mr-2 text-white"
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
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            Loading...
          </span>
          <span v-else>Register</span>
        </button>
      </form>
      <p v-if="error" class="text-red-500 mt-3 text-sm text-center">
        {{ error }}
      </p>
      <NuxtLink
        to="/login"
        class="mt-6 text-blue-600 hover:underline transition"
        >Sudah punya akun? <b>Login</b></NuxtLink
      >
    </div>
  </div>
</template>

<script setup>
import { useToast } from "~/composables/useToast";
const { showToast } = useToast();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const supabase = useSupabaseClient();

async function register() {
  loading.value = true;
  error.value = "";
  try {
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });
    if (signUpError) {
      error.value = signUpError.message;
    } else {
      showToast({
        message: "Registrasi berhasil! Silakan cek email untuk verifikasi.",
        type: "success",
      });
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.input {
  @apply px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition;
}
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
