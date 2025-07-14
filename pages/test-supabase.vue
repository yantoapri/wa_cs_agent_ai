<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Supabase Connection Test</h1>

    <div v-if="loading" class="text-blue-600">Testing connection...</div>

    <div v-else-if="error" class="text-red-600">Error: {{ error }}</div>

    <div v-else-if="success" class="text-green-600">
      ✅ Supabase connection successful!
    </div>

    <div class="mt-4">
      <button
        @click="testConnection"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Connection
      </button>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient();
const loading = ref(false);
const error = ref(null);
const success = ref(false);

const testConnection = async () => {
  loading.value = true;
  error.value = null;
  success.value = false;

  try {
    // Test basic connection by getting the current user
    const { data, error: supabaseError } = await supabase.auth.getUser();

    if (supabaseError) {
      error.value = supabaseError.message;
    } else {
      success.value = true;
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Test connection on page load
onMounted(() => {
  testConnection();
});
</script>
