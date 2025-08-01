<template>
  <div class="flex flex-col h-full">
    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Product Form -->
      <template v-if="showForm">
        <ProductForm
          :edit-data="formEditData"
          @back="$emit('back')"
          @saved="$emit('form-saved')"
          @refresh-list="$emit('refresh-list')"
        />
      </template>

      <!-- Product Detail or Welcome State -->
      <template v-else>
        <!-- Welcome State -->
        <div
          v-if="!selectedProduct"
          class="flex-1 flex items-center justify-center"
        >
          <div class="text-center">
            <div
              class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-700 mb-2">
              Selamat Datang di Produk
            </h3>
            <p class="text-gray-500">
              Pilih produk untuk melihat detail dan mengelolanya
            </p>
          </div>
        </div>

        <!-- Product Detail -->
        <div v-else class="p-6">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-800">
                {{ selectedProduct.name }}
              </h3>
            </div>

            <div class="space-y-4">
              <!-- Product Image -->
              <div v-if="selectedProduct.image">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Produk
                </label>
                <div class="flex justify-center">
                  <img
                    :src="selectedProduct.image"
                    :alt="selectedProduct.name"
                    class="max-w-xs max-h-64 rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              <!-- Product Description -->
              <div v-if="selectedProduct.description">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <div class="bg-gray-50 p-3 rounded-md">
                  <p class="text-gray-800">{{ selectedProduct.description }}</p>
                </div>
              </div>

              <!-- Product Details Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Harga
                  </label>
                  <p class="text-lg font-semibold text-green-600">
                    Rp {{ formatPrice(selectedProduct.price) }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Stok
                  </label>
                  <p class="text-gray-800">{{ selectedProduct.stock }} unit</p>
                </div>
                <div v-if="selectedProduct.weight">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Berat
                  </label>
                  <p class="text-gray-800">
                    {{ selectedProduct.weight }}
                    {{ selectedProduct.weight_unit }}
                  </p>
                </div>
                <div v-if="selectedProduct.discount > 0">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Diskon
                  </label>
                  <p class="text-orange-600 font-medium">
                    {{ selectedProduct.discount }}%
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Dibuat
                  </label>
                  <p class="text-gray-800">
                    {{ formatDate(selectedProduct.created_at) }}
                  </p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4">
                <button
                  @click="$emit('edit-product', selectedProduct)"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  @click="handleDeleteProduct"
                  class="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useProducts } from "~/composables/useProducts";
import { useToast } from "~/composables/useToast";
import ProductForm from "~/components/ProductForm.vue";
import Swal from "sweetalert2";

const props = defineProps({
  selectedProduct: {
    type: Object,
    default: null,
  },
  showForm: {
    type: Boolean,
    default: false,
  },
  formEditData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits([
  "back",
  "edit-product",
  "form-saved",
  "refresh-list",
]);

const { updateProduct, deleteProduct } = useProducts();
const { showToast } = useToast();

const getHeaderTitle = () => {
  if (props.selectedProduct) return "Detail Produk";
  return "Produk";
};

const getHeaderSubtitle = () => {
  if (props.selectedProduct) return "Kelola detail produk";
  return "Kelola produk dan inventori";
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID").format(price || 0);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const handleDeleteProduct = async () => {
  if (!props.selectedProduct) return;

  const result = await Swal.fire({
    title: "Hapus Produk",
    text: `Apakah Anda yakin ingin menghapus produk "${props.selectedProduct.name}"?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });

  if (result.isConfirmed) {
    try {
      await deleteProduct(props.selectedProduct.id);
      showToast({
        message: "Produk berhasil dihapus",
        type: "success",
      });
      emit("back");
      emit("refresh-list"); // Emit refresh-list after successful delete
    } catch (error) {
      showToast({
        message: "Gagal menghapus produk",
        type: "error",
      });
    }
  }
};
</script>
