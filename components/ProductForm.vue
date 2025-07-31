<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200 bg-white">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">
            {{ isEditing ? "Edit Produk" : "Tambah Produk Baru" }}
          </h2>
          <p class="text-gray-600 mt-1">
            {{
              isEditing
                ? "Edit detail produk"
                : "Tambahkan produk baru ke inventori"
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Form Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <form @submit.prevent="handleSubmit" class="max-w-2xl">
        <div class="space-y-6">
          <!-- Product Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nama Produk *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan nama produk..."
            />
          </div>

          <!-- Product Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Deskripsi produk (opsional)..."
            ></textarea>
          </div>

          <!-- Price and Stock -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Harga *
              </label>
              <input
                v-model="form.price"
                type="number"
                required
                min="0"
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Stok *
              </label>
              <input
                v-model="form.stock"
                type="number"
                required
                min="0"
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <!-- Weight -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Berat Barang *
              </label>
              <input
                v-model="form.weight"
                type="number"
                required
                min="0"
                step="0.01"
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Satuan Berat
              </label>
              <select
                v-model="form.weightUnit"
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gram">Gram</option>
                <option value="kg">Kilogram</option>
              </select>
            </div>
          </div>

          <!-- Discount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Diskon (%)
            </label>
            <input
              v-model="form.discount"
              type="number"
              min="0"
              max="100"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          <!-- Product Image -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Gambar Produk
            </label>
            <div class="flex items-center space-x-4">
              <label
                class="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 flex items-center space-x-2"
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                <span>Pilih Gambar</span>
                <input
                  type="file"
                  ref="productImageInput"
                  @change="handleProductImageUpload"
                  accept="image/*"
                  class="hidden"
                />
              </label>
              <button
                v-if="form.image"
                @click="removeProductImage"
                type="button"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                Hapus Gambar
              </button>
            </div>

            <!-- Image Preview -->
            <div v-if="form.image" class="mt-3">
              <div class="relative inline-block">
                <img
                  :src="form.image"
                  alt="Preview"
                  class="max-w-xs max-h-48 rounded-lg border border-gray-200"
                />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-6">
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="flex-1 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? "Menyimpan..." : isEditing ? "Update" : "Simpan" }}
            </button>
            <button
              type="button"
              @click="$emit('back')"
              class="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSupabaseClient } from "#imports";
import { useProducts } from "~/composables/useProducts";
import { useToast } from "~/composables/useToast";

const props = defineProps({
  editData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["back", "saved", "refresh-list"]);

const { createProduct, updateProduct } = useProducts();
const { showToast } = useToast();

// Form data
const form = ref({
  name: "",
  description: "",
  price: "",
  stock: "",
  weight: "",
  weightUnit: "gram",
  discount: "",
  image: "",
});

const selectedFile = ref(null);
const productImageInput = ref(null);

// Loading states
const loading = ref(false);

// Computed properties
const isEditing = computed(() => !!props.editData);

const isFormValid = computed(() => {
  const hasName = form.value.name.trim() !== "";
  const hasPrice = form.value.price !== "" && form.value.price >= 0;
  const hasStock = form.value.stock !== "" && form.value.stock >= 0;
  const hasWeight = form.value.weight !== "" && form.value.weight > 0;
  const validDiscount =
    form.value.discount === "" ||
    (form.value.discount >= 0 && form.value.discount <= 100);

  return hasName && hasPrice && hasStock && hasWeight && validDiscount;
});

// Initialize form with edit data
const initializeForm = () => {
  if (props.editData) {
    form.value = {
      name: props.editData.name || "",
      description: props.editData.description || "",
      price: props.editData.price?.toString() || "",
      stock: props.editData.stock?.toString() || "",
      weight: props.editData.weight?.toString() || "",
      weightUnit: props.editData.weight_unit || "gram",
      discount: props.editData.discount?.toString() || "",
      image: props.editData.image || "",
    };
    selectedFile.value = null; // Reset selected file when editing
  }
};

// Image upload handlers
const handleProductImageUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    selectedFile.value = file;
    // Create preview URL for display
    const reader = new FileReader();
    reader.onload = (e) => {
      // Store preview URL temporarily for display
      form.value.image = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeProductImage = () => {
  form.value.image = "";
  selectedFile.value = null;
  if (productImageInput.value) {
    productImageInput.value.value = "";
  }
};

// Upload image to Supabase storage
const uploadImageToSupabase = async (file) => {
  const supabase = useSupabaseClient();

  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from("chat-images")
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Gagal mengupload gambar");
  }
};

// Handle form submission
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  loading.value = true;

  try {
    let imageUrl = "";

    // If there's a new file to upload
    if (selectedFile.value) {
      imageUrl = await uploadImageToSupabase(selectedFile.value);
    } else if (isEditing.value && props.editData.image) {
      // Keep existing image URL when editing
      imageUrl = props.editData.image;
    }

    const formData = {
      name: form.value.name.trim(),
      description: form.value.description.trim(),
      price: parseInt(form.value.price) || 0,
      stock: parseInt(form.value.stock) || 0,
      weight: parseFloat(form.value.weight) || 0,
      weight_unit: form.value.weightUnit,
      discount: parseInt(form.value.discount) || 0,
      image: imageUrl,
    };

    if (isEditing.value) {
      // Update existing product
      await updateProduct(props.editData.id, formData);
      showToast({
        message: "Produk berhasil diupdate",
        type: "success",
      });
    } else {
      // Create new product
      await createProduct(formData);
      showToast({
        message: "Produk berhasil ditambahkan",
        type: "success",
      });
    }

    emit("saved");
    emit("refresh-list"); // Emit refresh-list after successful save/update
  } catch (err) {
    console.error("Error saving product:", err);
    showToast({
      message: err.message || "Gagal menyimpan produk",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
};

// Initialize on mount
onMounted(() => {
  initializeForm();
});
</script>
