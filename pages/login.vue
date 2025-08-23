<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8"
  >
    <div
      class="bg-white shadow-xl rounded-xl px-6 py-8 sm:px-10 sm:py-8 w-full max-w-md flex flex-col items-center"
    >
      <img
        src="/assets/img/nutra.png"
        alt="Nutra Logo"
        class="w-24 h-12 sm:w-25 sm:h-14 mb-4 object-contain"
      />
      <h1 class="text-xl sm:text-2xl font-bold mb-2 text-blue-700">Login</h1>
      <p class="mb-6 text-gray-500 text-center text-sm sm:text-base">Masuk ke akun Anda untuk melanjutkan</p>
      <form @submit.prevent="login" class="w-full flex flex-col gap-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="input"
          required
          :disabled="loading"
        />
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            class="input-with-icon"
            required
            :disabled="loading"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            :disabled="loading"
          >
            <svg
              v-if="showPassword"
              class="h-5 w-5 text-gray-400 hover:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
            <svg
              v-else
              class="h-5 w-5 text-gray-400 hover:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
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
          <span v-else>Login</span>
        </button>
      </form>
      <p v-if="error" class="text-red-500 mt-3 text-sm text-center">
        {{ error }}
      </p>
      <NuxtLink
        to="/register"
        class="mt-6 text-blue-600 hover:underline transition text-center text-sm sm:text-base"
        >Belum punya akun? <span class="font-semibold">Register</span></NuxtLink
      >
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'; // Import onMounted
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref("");
const loading = ref(false);
const supabase = useSupabaseClient();
const router = useRouter();
const user = useSupabaseUser(); // Get Supabase user

// Redirect if already logged in
onMounted(() => {
  if (user.value) {
    router.push('/views/dashboard');
  }
});

async function login() {
  loading.value = true;
  error.value = "";
  try {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (loginError) {
      error.value = loginError.message;
    } else {
      router.push("/views/dashboard"); // Redirect to /views/dashboard after successful login
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.2s;
  font-size: 1rem;
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.input-with-icon {
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.2s;
  font-size: 1rem;
  width: 100%;
}

.input-with-icon:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  font-size: 1rem;
  width: 100%;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

/* Ensure proper mobile styling */
@media (max-width: 640px) {
  .input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
  .btn-primary {
    font-size: 16px;
  }
}
</style>