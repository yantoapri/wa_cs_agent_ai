<template>
  <!-- Halaman placeholder untuk redirect otomatis ke dashboard -->
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue'

// Proteksi login
definePageMeta({ middleware: 'auth' })

const router = useRouter()

// Redirect ke /views/dashboard setelah mount (CSR)
onMounted(() => {
  router.replace('/views/dashboard')
})
</script>

<style scoped>
/* style kosong untuk menjaga struktur SFC valid */
</style>
