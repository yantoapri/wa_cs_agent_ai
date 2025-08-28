<template>
  <div class="flex flex-col h-[100vh]">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-800">Daftar Produk</h3>
        <button
          v-if="!limitProduk"
          @click="$emit('add-product')"
          class="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          title="Tambah Produk Baru"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 min-h-0 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="text-gray-500">Memuat produk...</div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-md p-4 m-4"
      >
        <div class="text-red-800 text-sm">{{ error }}</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="products.length === 0" class="text-center py-8">
        <div class="text-gray-500">Belum ada produk</div>
        <button
          @click="$emit('add-product')"
          class="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Tambah Produk Pertama
        </button>
      </div>

      <!-- Product List -->
      <div v-else class="p-4 space-y-3">
        <div
          v-for="product in products"
          :key="product.id"
          @click="$emit('select-product', product)"
          class="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transform hover:scale-[1.02]"
          :class="
            selectedProduct?.id === product.id
              ? 'border-blue-300 bg-blue-50 shadow-md scale-[1.02]'
              : ''
          "
        >
          <div class="flex items-start gap-4">
            <!-- Product Image -->
            <div class="flex-shrink-0">
              <div
                class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center transition-colors duration-200 group-hover:bg-blue-100"
              >
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.name"
                  class="w-12 h-12 object-cover rounded-md"
                />
                <svg
                  v-else
                  class="w-8 h-8 text-gray-400 transition-colors duration-200 group-hover:text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4
                    class="font-medium text-gray-800 truncate transition-colors duration-200 group-hover:text-blue-700"
                  >
                    {{ product.name }}
                  </h4>
                  <div class="mt-2">
                    <span
                      class="font-medium text-green-600 transition-colors duration-200 group-hover:text-green-700"
                    >
                      Rp {{ formatPrice(product.price) }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2 ml-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useProducts } from "~/composables/useProducts";
import { useRouter } from "vue-router";
import { useSupabaseUser, useSupabaseClient } from "#imports";

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter();
const props = defineProps({
  selectedProduct: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["select-product", "add-product"]);

const { products, loading, error, fetchProducts } = useProducts();
const limitProduk = ref(false);

async function getCountProduct() {
  try {
    // Ensure user is available and has an id
    if (!user.value?.id) {
      console.error('User not authenticated');
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*,package(*)")
      .eq("auth_id", user.value.id)
      .single();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return;
    }

    if (!userData) {
      console.error('User data not found');
      return;
    }

    // Check if user subscription has expired
    if (userData.end_at && new Date().getTime() >= new Date(userData.end_at).getTime()) {
      router.push("/views/dashboard");
      return;
    }

    const { count, error: countError } = await supabase
      .from("products")
      .select('*', { count: 'exact', head: true })
      .eq("created_by", user.value.id);
    
    if (countError) {
      console.error('Error fetching product count:', countError);
      return;
    }

    // Set limit based on package limits
    if (userData.package && typeof count === 'number') {
      limitProduk.value = count >= userData.package.limit_produk;
    }
  } catch (error) {
    console.error('Error in getCountProduct:', error);
  }
}
// Load products on mount
onMounted(async () => {
  getCountProduct();
  await fetchProducts();
});

const formatPrice = (price) => {
  return 'Rp ' + new Intl.NumberFormat("id-ID").format(price || 0);
}

function handlePriceInput(e, product) {
  let raw = e.target.value.replace(/[^\d]/g, '');
  if (raw) raw = String(Number(raw));
  product.price = raw;
}

// Expose methods to parent component
defineExpose({
  fetchProducts,
});
</script>
