<template>
  <div class="w-full p-6">
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-6">
          <!-- Product Selection (for auto-message only) -->
          <div v-if="formType === 'auto-message'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pilih Produk untuk Promosi (Opsional)
            </label>
            <select
              v-model="selectedProduct"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Pilih produk untuk promosi (opsional)</option>
              <option
                v-for="product in availableProducts"
                :key="product.id"
                :value="product"
              >
                {{ product.name }} - Rp
                {{ product.price?.toLocaleString("id-ID") }}
                {{ product.discount ? `(${product.discount}% off)` : "" }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Pilih produk jika ingin menggunakan AI untuk generate pesan
              promosi
            </p>
          </div>

          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Judul *
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan judul pesan..."
            />
          </div>

          <!-- Message -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pesan *
            </label>

            <!-- AI Generate Button (for auto-message only) -->
            <div v-if="formType === 'auto-message'" class="mb-3">
              <button
                type="button"
                @click="generateAIMessage"
                :disabled="aiGenerating || !selectedProduct"
                :class="[
                  'flex items-center gap-2 px-4 py-2 rounded-md',
                  aiGenerating || !selectedProduct
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700',
                ]"
              >
                <svg
                  v-if="aiGenerating"
                  class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                <svg
                  v-else
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
                {{ 
                  aiGenerating
                    ? "Generating..."
                    : !selectedProduct
                    ? "Pilih produk untuk generate pesan"
                    : "Generate Pesan dengan AI"
                }}
              </button>
              <p v-if="!selectedProduct" class="mt-1 text-xs text-gray-500">
                Pilih produk terlebih dahulu untuk mengaktifkan fitur generate
                pesan dengan AI
              </p>
            </div>

            <textarea
              v-model="form.message"
              rows="6"
              required
              :disabled="aiGenerating"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              :placeholder="
                aiGenerating
                  ? 'Generating pesan dengan AI...'
                  : 'Tulis pesan Anda di sini...'
              "
            ></textarea>
          </div>

          <!-- Channel Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pilih Channel *
            </label>
            <select
              v-model="form.channelId"
              required
              :disabled="channelsLoading"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value=""> 
                {{ 
                  channelsLoading
                    ? "Memuat channel..."
                    : "Pilih channel untuk mengirim pesan"
                }}
              </option>
              <option
                v-for="channel in availableChannels"
                :key="channel.id"
                :value="channel.id"
                :disabled="!channel.is_active"
              >
                {{ channel.name }} ({{ channel.whatsapp_number }})
                {{ channel.is_active ? "- Aktif" : "- Tidak Aktif" }}
              </option>
            </select>
            <p
              v-if="selectedChannel && !selectedChannel.is_active"
              class="mt-1 text-sm text-red-600"
            >
              Channel ini tidak aktif. Silakan pilih channel yang aktif.
            </p>
            <p
              v-if="selectedChannel && !selectedChannel.session_name"
              class="mt-1 text-sm text-red-600"
            >
              Channel ini belum terhubung dengan WhatsApp. Silakan hubungkan
              terlebih dahulu.
            </p>
            <p
              v-if="availableChannels.length === 0 && !channelsLoading"
              class="mt-1 text-sm text-gray-500"
            >
              Tidak ada channel tersedia. Silakan buat channel terlebih dahulu.
            </p>
          </div>

          <!-- Contact Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pilih Kontak *
            </label>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input
                  v-model="selectAll"
                  type="checkbox"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label class="text-sm text-gray-700">Pilih Semua Kontak</label>
              </div>
              <div
                class="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3"
              >
                <!-- Loading state -->
                <div v-if="contactsLoading" class="text-center py-4">
                  <div class="text-gray-500">Memuat kontak...</div>
                </div>

                <!-- Empty state -->
                <div
                  v-else-if="availableContacts.length === 0"
                  class="text-center py-4"
                >
                  <div class="text-gray-500">Tidak ada kontak tersedia</div>
                </div>

                <!-- Contact list -->
                <div v-else>
                  <div
                    v-for="contact in availableContacts"
                    :key="contact.id"
                    class="flex items-center gap-2 py-1"
                  >
                    <input
                      v-model="selectedContacts"
                      :value="contact.id"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label class="text-sm text-gray-700 flex-1">
                      {{ contact.name }} ({{ contact.phone_number }})
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Schedule (for auto messages only) -->
          <div v-if="formType === 'auto-message'" class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Jadwal Kirim *
            </label>

            <!-- Schedule Type Selection -->
            <div class="mb-4 relative">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tipe Penjadwalan
              </label>
              <div class="flex gap-4 relative z-20 pointer-events-auto">
                <label
                  class="flex items-center cursor-pointer pointer-events-auto"
                >
                  <input
                    v-model="scheduleType"
                    type="radio"
                    value="custom"
                    @click.stop="handleScheduleTypeChange('custom')"
                    class="mr-2 text-blue-600 focus:ring-blue-500 relative z-10 pointer-events-auto"
                  />
                  <span class="text-sm text-gray-700 pointer-events-auto"
                    >Custom (Multi Jadwal)</span
                  >
                </label>
                <label
                  class="flex items-center cursor-pointer pointer-events-auto"
                >
                  <input
                    v-model="scheduleType"
                    type="radio"
                    value="interval"
                    @click.stop="handleScheduleTypeChange('interval')"
                    class="mr-2 text-blue-600 focus:ring-blue-500 relative z-10 pointer-events-auto"
                  />
                  <span class="text-sm text-gray-700 pointer-events-auto"
                    >Interval (Berulang)</span
                  >
                </label>
              </div>
            </div>

            <!-- Custom Schedule Type -->
            <div v-if="scheduleType === 'custom'">
              <!-- Schedule List -->
              <div class="space-y-3">
                <div
                  v-for="(schedule, index) in form.schedules"
                  :key="index"
                  class="border border-gray-200 rounded-md p-4 bg-gray-50"
                >
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-gray-700">
                      Jadwal {{ index + 1 }}
                    </span>
                    <button
                      v-if="form.schedules.length > 1"
                      @click="removeSchedule(index)"
                      type="button"
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      Hapus
                    </button>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs text-gray-600 mb-1"
                        >Tanggal</label
                      >
                      <input
                        v-model="schedule.date"
                        type="date"
                        required
                        :min="today"
                        class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-600 mb-1"
                        >Waktu</label
                      >
                      <input
                        v-model="schedule.time"
                        type="time"
                        required
                        step="60"
                        class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 relative z-0"
                        style="font-family: monospace"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add Schedule Button -->
              <button
                @click="addSchedule"
                type="button"
                class="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                Tambah Jadwal
              </button>

              <p class="mt-2 text-xs text-gray-500">
                Anda dapat menambahkan beberapa jadwal untuk mengirim pesan yang
                sama pada waktu yang berbeda.
              </p>
            </div>

            <!-- Interval Schedule Type -->
            <div v-if="scheduleType === 'interval'">
              <div class="space-y-4">
                <!-- Start Date -->
                <div>
                  <label class="block text-xs text-gray-600 mb-1"
                    >Tanggal Mulai</label
                  >
                  <input
                    v-model="intervalSchedule.startDate"
                    type="date"
                    required
                    :min="today"
                    class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <!-- Time -->
                <div>
                  <label class="block text-xs text-gray-600 mb-1"
                    >Waktu Kirim</label
                  >
                  <input
                    v-model="intervalSchedule.time"
                    type="time"
                    required
                    step="60"
                    class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 relative z-0"
                    style="font-family: monospace"
                  />
                </div>

                <!-- Interval Type -->
                <div>
                  <label class="block text-xs text-gray-600 mb-1"
                    >Pilih Hari</label
                  >
                  <div class="grid grid-cols-7 gap-2">
                    <label
                      v-for="(day, index) in weekDays"
                      :key="index"
                      class="flex items-center justify-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                      :class="{
                        'bg-blue-100 border-blue-500':
                          intervalSchedule.weekDays.includes(index),
                      }"
                    >
                      <input
                        v-model="intervalSchedule.weekDays"
                        :value="index"
                        type="checkbox"
                        class="sr-only"
                      />
                      <span class="text-xs font-medium">{{ day }}</span>
                    </label>
                  </div>
                  <p class="mt-1 text-xs text-gray-500">
                    Pilih hari dalam seminggu untuk pengiriman otomatis
                  </p>
                </div>

                <!-- End Date (Optional) -->
                <div>
                  <label class="block text-xs text-gray-600 mb-1">
                    Tanggal Berakhir (Opsional)
                  </label>
                  <input
                    v-model="intervalSchedule.endDate"
                    type="date"
                    :min="intervalSchedule.startDate"
                    class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    Kosongkan jika ingin berjalan tanpa batas waktu
                  </p>
                </div>
              </div>

              <p class="mt-2 text-xs text-gray-500">
                Pesan akan dikirim secara otomatis pada hari yang dipilih.
              </p>

              <!-- Preview of generated schedules -->
              <div
                v-if="scheduleType === 'interval' && form.schedules.length > 0"
                class="mt-4"
              >
                <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 class="text-sm font-medium text-blue-800 mb-2">
                    Preview Jadwal ({{ form.schedules.length }} jadwal)
                  </h4>
                  <div class="max-h-32 overflow-y-auto space-y-1">
                    <div
                      v-for="(schedule, index) in form.schedules.slice(0, 10)"
                      :key="index"
                      class="text-xs text-blue-700"
                    >
                      {{ schedule.date }} {{ schedule.time }}
                    </div>
                    <div
                      v-if="form.schedules.length > 10"
                      class="text-xs text-blue-600"
                    >
                      ... dan {{ form.schedules.length - 10 }} jadwal lainnya
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-6">
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? "Mengirim..." : isEditing ? "Update" : "Kirim" }}
            </button>
            <button
              type="button"
              @click="$emit('back')"
              class="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Batal
            </button>
          </div>

          <!-- Progress Indicator -->
          <div v-if="loading && sendingProgress.total > 0" class="mt-4">
            <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-blue-800">
                  {{ 
                    sendingProgress.current >= sendingProgress.total
                      ? "Broadcast Selesai"
                      : "Mengirim Broadcast..."
                  }}
                </span>
                <span class="text-sm text-blue-600">
                  {{ sendingProgress.current }} / {{ sendingProgress.total }}
                </span>
              </div>
              <div class="w-full bg-blue-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{
                    width: `${ 
                      (sendingProgress.current / sendingProgress.total) * 100
                    }%`,
                  }"
                ></div>
              </div>
              <div class="mt-2 text-sm text-blue-700">
                {{ sendingProgress.message }}
              </div>
              <div
                v-if="sendingProgress.current >= sendingProgress.total"
                class="mt-2 text-xs text-blue-600"
              >
                Pesan akan dikirim dengan delay 60 detik antar kontak di
                background.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";
import { useBroadcastMessages } from "~/composables/useBroadcastMessages";
import { useAutoMessages } from "~/composables/useAutoMessages";
import { useProducts } from "~/composables/useProducts";
import { $fetch } from "ofetch";
import Swal from "sweetalert2";

// Fallback for SweetAlert if not available
const showAlert = (options) => {
  if (typeof Swal !== "undefined" && Swal.fire) {
    return Swal.fire(options);
  } else {
    // Fallback to native alert
    alert(options.text || options.title || "Alert");
    return Promise.resolve({ isConfirmed: true });
  }
};

const props = defineProps({
  formType: {
    type: String,
    required: true,
    validator: (value) => ["broadcast", "auto-message"].includes(value),
  },
  editData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["back", "saved", "refresh-list"]);

const supabase = useSupabaseClient();
const user = useSupabaseUser();

// Form data
const form = ref({
  title: "",
  message: "",
  status: "scheduled", // Default status for auto messages
  scheduledDate: "",
  scheduledTime: "",
  channelId: "",
  schedules: [], // Only used for auto messages
});

// Schedule type and interval data
const scheduleType = ref("custom"); // "custom" or "interval"
const intervalSchedule = ref({
  startDate: "",
  time: "00:00",
  weekDays: [], // 0=Sunday, 1=Monday, etc.
  endDate: "", // Optional end date
});

// Week days for weekly interval
const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// Contact selection
const availableContacts = ref([]);
const selectedContacts = ref([]);
const selectAll = ref(false);

// Channel selection
const availableChannels = ref([]);
const channelsLoading = ref(false);

// Product selection
const availableProducts = ref([]);
const selectedProduct = ref(null);
const productsLoading = ref(false);

// AI generation
const aiGenerating = ref(false);

// Loading states
const loading = ref(false);
const contactsLoading = ref(false);
const sendingProgress = ref({ current: 0, total: 0, message: "" });

// Computed properties
const isEditing = computed(() => !!props.editData);
const today = computed(() => new Date().toISOString().split("T")[0]);
const is_interval=ref(false)
const selectedChannel = computed(() => {
  if (!form.value.channelId) return null;
  return availableChannels.value.find(
    (channel) => channel.id === form.value.channelId
  );
});

const isFormValid = computed(() => {
  const hasTitle = form.value.title.trim() !== "";
  const hasMessage = form.value.message.trim() !== "";
  const hasContacts = selectedContacts.value.length > 0;
  const hasChannel = form.value.channelId !== "";
  const isChannelActive = selectedChannel.value?.is_active;
  const hasSession = selectedChannel.value?.session_name;

  if (props.formType === "auto-message") {
    if (scheduleType.value === "custom") {
      const hasValidSchedules =
        form.value.schedules.length > 0 &&
        form.value.schedules.every(
          (schedule) => schedule.date && schedule.time
        );
      return (
        hasTitle &&
        hasMessage &&
        hasContacts &&
        hasChannel &&
        isChannelActive &&
        hasSession &&
        hasValidSchedules
      );
    } else if (scheduleType.value === "interval") {
      const hasValidInterval =
        intervalSchedule.value.startDate &&
        intervalSchedule.value.time &&
        intervalSchedule.value.weekDays.length > 0;
      return (
        hasTitle &&
        hasMessage &&
        hasContacts &&
        hasChannel &&
        isChannelActive &&
        hasSession &&
        hasValidInterval
      );
    }
    return false;
  }

  return (
    hasTitle &&
    hasMessage &&
    hasContacts &&
    hasChannel &&
    isChannelActive &&
    hasSession
  );
});

// Load contacts
const loadContacts = async () => {
  if (!user.value) return;

  contactsLoading.value = true;
  try {
    const { data, error } = await supabase
      .from("contacts")
      .select("id, name, phone_number")
      .eq("is_active", true)
      .eq("created_by",user.value.id)
      .order("name");

    if (error) throw error;

    availableContacts.value = data || [];
  } catch (err) {
    console.error("Error loading contacts:", err);
  } finally {
    contactsLoading.value = false;
  }
};

// Load channels
const loadChannels = async () => {
  if (!user.value) return;

  channelsLoading.value = true;
  try {
    const { data, error } = await supabase
      .from("chanels")
      .select("id, name, whatsapp_number, is_active, session_name")
      .eq("created_by", user.value.id)
      .order("name");

    if (error) throw error;

    availableChannels.value = data || [];
  } catch (err) {
    console.error("Error loading channels:", err);
  } finally {
    channelsLoading.value = false;
  }
};

// Load products
const loadProducts = async () => {
  if (!user.value) return;

  productsLoading.value = true;
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("created_by", user.value.id)
      .order("name");

    if (error) throw error;

    availableProducts.value = data || [];
  } catch (err) {
    console.error("Error loading products:", err);
  } finally {
    productsLoading.value = false;
  }
};

// Toggle select all contacts
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedContacts.value = availableContacts.value.map(
      (contact) => contact.id
    );
  } else {
    selectedContacts.value = [];
  }
};

// Handle schedule type change
const handleScheduleTypeChange = (type) => {
  scheduleType.value = type;
  // Reset schedules when switching types
  if (type === "custom") {
    is_interval.value=false
    // Initialize with one empty schedule for custom
    if (form.value.schedules.length === 0) {
      form.value.schedules = [{ date: today.value, time: "00:00" }];
    }
  } else if (type === "interval") {
    is_interval.value=true
    // Initialize interval schedule if not set
    if (!intervalSchedule.value.startDate) {
      intervalSchedule.value.startDate = today.value;
    }
    if (!intervalSchedule.value.time) {
      intervalSchedule.value.time = "00:00";
    }
    // Convert interval to schedules for preview
    form.value.schedules = convertIntervalToSchedules();
  }
};

// Watch for changes in selected contacts
watch(selectedContacts, (newValue) => {
  selectAll.value =
    newValue.length === availableContacts.value.length &&
    availableContacts.value.length > 0;
});

// Watch for time format changes in schedules
watch(
  () => form.value.schedules,
  (newSchedules) => {
    if (newSchedules) {
      newSchedules.forEach((schedule, index) => {
        if (schedule.time) {
          const formattedTime = formatTimeTo24Hour(schedule.time);
          if (formattedTime !== schedule.time) {
            form.value.schedules[index].time = formattedTime;
          }
        }
      });
    }
  },
  { deep: true }
);

// Watch for interval schedule changes and convert to schedules for preview
watch(
  () => [
    intervalSchedule.value.startDate,
    intervalSchedule.value.time,
    intervalSchedule.value.weekDays,
    intervalSchedule.value.endDate,
  ],
  () => {
    if (scheduleType.value === "interval") {
      form.value.schedules = convertIntervalToSchedules();
    }
  },
  { deep: true }
);

// Watch for form type changes to clear selected product
watch(
  () => props.formType,
  (newFormType) => {
    if (newFormType !== "auto-message") {
      selectedProduct.value = null;
    }
  }
);

// Initialize form with edit data
const initializeForm = () => {
  if (props.editData) {
    form.value = {
      title: props.editData.title || "",
      message: props.editData.message || "",
      status: props.editData.status || "scheduled",
      channelId: props.editData.chanel_id || "",
      scheduledDate: "",
      scheduledTime: "",
      schedules: [], // Initialize empty schedules
    };

    // Handle schedules for auto messages
    if (props.formType === "auto-message") {
      // Check if this is an interval schedule
      if (props.editData.interval_config) {
        scheduleType.value = "interval";
        intervalSchedule.value = {
          startDate: props.editData.interval_config.startDate || today.value,
          time: formatTimeTo24Hour(
            props.editData.interval_config.time || "00:00"
          ),
          weekDays: props.editData.interval_config.weekDays || [],
          endDate: props.editData.interval_config.endDate || "",
        };
        // Convert interval to schedules for display and ensure 24-hour format
        form.value.schedules = convertIntervalToSchedules();
      } else if (
        props.editData.schedules &&
        Array.isArray(props.editData.schedules)
      ) {
        // If schedules exist in edit data, use them and ensure 24-hour format
        scheduleType.value = "custom";
        form.value.schedules = props.editData.schedules.map((schedule) => ({
          ...schedule,
          time: formatTimeTo24Hour(schedule.time), // Ensure 24-hour format
        }));
      } else if (props.editData.scheduled_at) {
        // If only scheduled_at exists, convert to single schedule
        scheduleType.value = "custom";
        const scheduledDate = new Date(props.editData.scheduled_at);
        form.value.schedules = [
          {
            date: scheduledDate.toISOString().split("T")[0],
            time: formatTimeTo24Hour(scheduledDate.toTimeString().slice(0, 5)), // Ensure 24-hour format
          },
        ];
      } else {
        // Default to custom with one empty schedule
        scheduleType.value = "custom";
        form.value.schedules = [{ date: today.value, time: "00:00" }];
      }
    }

    // Handle contact_ids - support both old and new formats
    if (props.editData.contact_ids) {
      if (
        Array.isArray(props.editData.contact_ids) &&
        props.editData.contact_ids.length > 0
      ) {
        // Check if it's the new format with objects
        if (
          typeof props.editData.contact_ids[0] === "object" &&
          props.editData.contact_ids[0].name
        ) {
          // New format: extract contact IDs from the contact objects
          // We need to find the original contact IDs by matching name and phone
          const contactObjects = props.editData.contact_ids;
          const contactIds = availableContacts.value
            .filter((contact) =>
              contactObjects.some(
                (obj) =>
                  obj.name === contact.name &&
                  obj.phone === contact.phone_number
              )
            )
            .map((contact) => contact.id);
          selectedContacts.value = contactIds;
        } else {
          // Old format: direct array of contact IDs
          selectedContacts.value = props.editData.contact_ids;
        }
      }
    }

    // Handle selected product for auto messages
    if (props.formType === "auto-message" && props.editData.product_id) {
      const product = availableProducts.value.find(
        (p) => p.id === props.editData.product_id
      );
      if (product) {
        selectedProduct.value = product;
      }
    }
  } else {
    // For new auto messages, initialize with one default schedule
    if (props.formType === "auto-message") {
      form.value.schedules = [{ date: today.value, time: "00:00" }];
    }
  }

  // Reset progress
  sendingProgress.value = { current: 0, total: 0, message: "" };
};

// Add a new schedule
const addSchedule = () => {
  form.value.schedules.push({ date: today.value, time: "00:00" });
};

// Remove a schedule
const removeSchedule = (index) => {
  form.value.schedules.splice(index, 1);
};

// Format time to 24-hour format
const formatTimeTo24Hour = (timeString) => {
  if (!timeString) return "00:00";

  // If already in 24-hour format, return as is
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }

  // Convert from 12-hour to 24-hour format
  const [time, period] = timeString.split(" ");
  const [hours, minutes] = time.split(":").map(Number);

  let hour24 = hours;
  if (period === "PM" && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === "AM" && hours === 12) {
    hour24 = 0;
  }

  const result = `${hour24.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
  return result;
};

// Convert interval schedule to custom schedules
const convertIntervalToSchedules = () => {
  if (scheduleType.value !== "interval") return [];

  const schedules = [];
  const startDate = new Date(intervalSchedule.value.startDate);
  const endDate = intervalSchedule.value.endDate
    ? new Date(intervalSchedule.value.endDate)
    : null;
  const time = formatTimeTo24Hour(intervalSchedule.value.time); // Ensure 24-hour format
  const weekDays = intervalSchedule.value.weekDays;

  // If no days selected, return empty
  if (weekDays.length === 0) return [];

  let currentDate = new Date(startDate);
  const maxIterations = 100; // Prevent infinite loop
  let iteration = 0;

  while (iteration < maxIterations) {
    if (endDate && currentDate > endDate) break;

    // Check if current day is in selected week days
    const shouldAddSchedule = weekDays.includes(currentDate.getDay());

    if (shouldAddSchedule) {
      schedules.push({
        date: currentDate.toISOString().split("T")[0],
        time: time, // This is now guaranteed to be in 24-hour format
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    iteration++;
  }

  return schedules;
};

// Handle form submission
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  // Additional validation for channel
  if (!selectedChannel.value) {
    showAlert({
      icon: "warning",
      title: "Peringatan",
      text: "Silakan pilih channel untuk mengirim pesan",
      confirmButtonText: "OK",
    });
    return;
  }

  if (!selectedChannel.value.is_active) {
    showAlert({
      icon: "warning",
      title: "Channel Tidak Aktif",
      text: "Channel yang dipilih tidak aktif. Silakan pilih channel yang aktif.",
      confirmButtonText: "OK",
    });
    return;
  }

  if (!selectedChannel.value.session_name) {
    showAlert({
      icon: "warning",
      title: "Channel Belum Terhubung",
      text: "Channel yang dipilih belum terhubung dengan WhatsApp. Silakan hubungkan terlebih dahulu.",
      confirmButtonText: "OK",
    });
    return;
  }

  // Validate contacts have phone numbers
  const contactsWithPhone = availableContacts.value.filter(
    (contact) =>
      selectedContacts.value.includes(contact.id) &&
      contact.phone_number &&
      contact.phone_number.trim() !== ""
  );

  if (contactsWithPhone.length !== selectedContacts.value.length) {
    showAlert({
      icon: "warning",
      title: "Kontak Tidak Valid",
      text: "Beberapa kontak yang dipilih tidak memiliki nomor telepon. Silakan pilih kontak yang memiliki nomor telepon.",
      confirmButtonText: "OK",
    });
    return;
  }

  // Validate phone number format
  const invalidPhoneNumbers = contactsWithPhone.filter(
    (contact) => !contact.phone_number.trim().startsWith("62")
  );

  if (invalidPhoneNumbers.length > 0) {
    showAlert({
      icon: "error",
      title: "Format Nomor Telepon Tidak Valid",
      html: `
        <p>Kontak berikut memiliki format nomor telepon yang tidak valid (harus dimulai dengan 62):</p>
        <ul class="text-left mt-2">
          ${invalidPhoneNumbers
            .map(
              (c) => `<li><strong>${c.name}</strong>: ${c.phone_number}</li>`
            )
            .join("")}
        </ul>
        <p class="mt-3 text-sm text-gray-600">Format yang benar: +6281234567890 atau 6281234567890</p>
      `,
      confirmButtonText: "OK",
    });
    return;
  }

  // Validate interval schedule for auto messages
  if (props.formType === "auto-message" && scheduleType.value === "interval") {
    if (!intervalSchedule.value.startDate) {
      showAlert({
        icon: "warning",
        title: "Tanggal Mulai Diperlukan",
        text: "Silakan pilih tanggal mulai untuk interval schedule.",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!intervalSchedule.value.time) {
      showAlert({
        icon: "warning",
        title: "Waktu Kirim Diperlukan",
        text: "Silakan pilih waktu kirim untuk interval schedule.",
        confirmButtonText: "OK",
      });
      return;
    }

    if (intervalSchedule.value.weekDays.length === 0) {
      showAlert({
        icon: "warning",
        title: "Hari Diperlukan",
        text: "Silakan pilih minimal satu hari dalam seminggu untuk pengiriman otomatis.",
        confirmButtonText: "OK",
      });
      return;
    }

    // Check if generated schedules are not too many
    const generatedSchedules = convertIntervalToSchedules();
    if (generatedSchedules.length > 10) {
      showAlert({
        icon: "warning",
        title: "Terlalu Banyak Jadwal",
        text: `Interval yang dipilih akan menghasilkan ${generatedSchedules.length} jadwal. Maksimal 10 jadwal yang diizinkan. Silakan kurangi rentang waktu atau pilih hari yang lebih spesifik.`,
        confirmButtonText: "OK",
      });
      return;
    }
  }

  loading.value = true;

  try {
    // Create contact objects with name and phone for storage
    const contactObjects = contactsWithPhone.map((contact) => ({
      name: contact.name,
      phone: contact.phone_number,
    }));

    const formData = {
      title: form.value.title.trim(),
      message: form.value.message.trim(),
      contact_ids: contactObjects, // Store as array of objects with name and phone
      contact_count: selectedContacts.value.length,
      status:
        props.formType === "auto-message" ? "scheduled" : form.value.status,
      chanel_id: form.value.channelId,
      is_interval: is_interval.value,
    };

    // Add product information for auto messages
    if (props.formType === "auto-message" && selectedProduct.value) {
      formData.product_id = selectedProduct.value.id;
    }

    if (props.formType === "auto-message") {
      if (scheduleType.value === "custom") {
        // For custom schedules, use the existing schedules and ensure 24-hour format
        formData.schedules = form.value.schedules.map((schedule) => {
          const formattedTime = formatTimeTo24Hour(schedule.time);
     
          return {
            ...schedule,
            time: formattedTime,
          };
        });
      } else if (scheduleType.value === "interval") {
        // For interval schedules, convert to custom schedules
        formData.schedules = convertIntervalToSchedules();
        // Also include interval configuration for future reference
        formData.interval_config = {
          startDate: intervalSchedule.value.startDate,
          time: formatTimeTo24Hour(intervalSchedule.value.time),
          weekDays: intervalSchedule.value.weekDays,
          endDate: intervalSchedule.value.endDate,
        };
      }

      // Also include the first schedule as scheduled_at for backward compatibility
      if (formData.schedules.length > 0) {
        const firstSchedule = formData.schedules[0];
        if (firstSchedule.date && firstSchedule.time) {
          // Ensure time is in 24-hour format
          const formattedTime = formatTimeTo24Hour(firstSchedule.time);
          formData.scheduled_at = new Date(
            `${firstSchedule.date}T${formattedTime}`
          ).toISOString();

          // Update the schedule with formatted time
          formData.schedules[0].time = formattedTime;

        
        }
      }
    }

    if (isEditing.value) {
      // Update existing message
      const { updateBroadcastMessage, updateAutoMessage } =
        props.formType === "broadcast"
          ? useBroadcastMessages()
          : useAutoMessages();

      const updateFunction =
        props.formType === "broadcast"
          ? updateBroadcastMessage
          : updateAutoMessage;
      await updateFunction(props.editData.id, formData);
    } else {
      // Create new message
      if (props.formType === "broadcast") {
        // Send broadcast to WAHA first, then save to database
        await sendBroadcastToWAHA(formData);
      } else {
        // For auto messages, just save to database
        const { createAutoMessage } = useAutoMessages();
        await createAutoMessage(formData);
      }
    }

    emit("saved");
    emit("refresh-list"); // Emit refresh-list after successful save/update

    // Show success message
    showAlert({
      icon: "success",
      title: "Berhasil!",
      text:
        props.formType === "broadcast"
          ? "Broadcast berhasil dimulai dan akan dikirim dengan delay 60 detik antar kontak!"
          : "Pesan otomatis berhasil disimpan!",
      confirmButtonText: "OK",
    });

    // Reset progress after a delay
    setTimeout(() => {
      sendingProgress.value = { current: 0, total: 0, message: "" };
    }, 3000);
  } catch (err) {
    console.error("Error saving message:", err);
    sendingProgress.value.message = "Terjadi kesalahan saat mengirim broadcast";

    // Show error with SweetAlert
    showAlert({
      icon: "error",
      title: "Gagal Mengirim Pesan",
      text:
        err.message ||
        "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.",
      confirmButtonText: "OK",
    });
  } finally {
    loading.value = false;
  }
};

// Function to send broadcast to WAHA with delay
const sendBroadcastToWAHA = async (formData) => {
  try {
    // Check if selected channel is active
    const selectedChannelData = availableChannels.value.find(
      (channel) => channel.id === formData.chanel_id
    );

    if (!selectedChannelData) {
      throw new Error("Channel tidak ditemukan");
    }

    if (!selectedChannelData.is_active) {
      throw new Error("Channel tidak aktif. Silakan pilih channel yang aktif.");
    }

    // Validate session name
    if (!selectedChannelData.session_name) {
      throw new Error(
        "Session channel tidak ditemukan. Pastikan channel sudah terhubung dengan WhatsApp."
      );
    }

    const contactIds = formData.contact_ids
      .map((contact) => {
        // If contact is an object with name and phone, we need to find the original contact ID
        if (typeof contact === "object" && contact.name && contact.phone) {
          const foundContact = availableContacts.value.find(
            (c) => c.name === contact.name && c.phone_number === contact.phone
          );
  
          return foundContact ? foundContact.id : null;
        }
        // If contact is already an ID, return it directly
        return contact;
      })
      .filter((id) => id !== null); // Remove any null values


    if (contactIds.length === 0) {
      throw new Error("Tidak ada kontak yang valid ditemukan");
    }

    // Get contacts data for validation
    const { data: contacts } = await supabase
      .from("contacts")
      .select("phone_number, name")
      .in("id", contactIds);

    if (!contacts || contacts.length === 0) {
      throw new Error("Kontak tidak ditemukan dalam database");
    }

    // Validate phone numbers
    const invalidContacts = contacts.filter(
      (contact) => !contact.phone_number || contact.phone_number.trim() === ""
    );
    if (invalidContacts.length > 0) {
      throw new Error(
        `Kontak berikut tidak memiliki nomor telepon: ${invalidContacts
          .map((c) => c.name)
          .join(", ")}`
      );
    }

    sendingProgress.value.total = contacts.length;
    sendingProgress.value.current = 0;
    sendingProgress.value.message = "Memulai broadcast...";

    // Use the new broadcast-send API endpoint
    const response = await $fetch("/api/broadcast-send", {
      method: "POST",
      body: {
        message: formData.message,
        contactIds: contactIds, // Use the extracted contact IDs
        channelId: formData.chanel_id,
        sessionName: selectedChannelData.session_name,
        metadata: {
          sender_type: "broadcast",
          is_broadcast: true,
          message_type: "broadcast",
          is_manual_broadcast: true, // Additional flag to identify manual broadcasts
        },
      },
    });

    // Check if the API response indicates an error
    if (response.error) {
      throw new Error(response.message || "Gagal memulai broadcast");
    }

    sendingProgress.value.message =
      response.message || "Broadcast berhasil dimulai!";

    // Update progress to show completion
    sendingProgress.value.current = contacts.length;
    sendingProgress.value.message =
      "Broadcast sedang diproses di background...";

    // After broadcast is started, save to database
    const { createBroadcastMessage } = useBroadcastMessages();
    await createBroadcastMessage({
      ...formData,
      status: "sent", // Mark as sent since we've started the broadcast
    });

    sendingProgress.value.message =
      "Broadcast berhasil dimulai dan akan dikirim dengan delay 60 detik antar kontak!";
  } catch (error) {
    console.error("Error sending broadcast to Wa:", error);
    throw error;
  }
};

// Generate AI message
const generateAIMessage = async () => {
  if (!selectedProduct.value) {
    showAlert({
      icon: "warning",
      title: "Peringatan",
      text: "Silakan pilih produk terlebih dahulu",
      confirmButtonText: "OK",
    });
    return;
  }

  aiGenerating.value = true;
  try {
    const response = await $fetch("/api/generate-message-promosi", {
      method: "POST",
      body: {
        product: selectedProduct.value,
      },
    });

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.result) {
      // Insert the generated message into the textarea
      form.value.message = response.result;

      // Show success message
      showAlert({
        icon: "success",
        title: "Berhasil!",
        text: "Pesan promosi berhasil di-generate dengan AI dan telah dimasukkan ke dalam textarea",
        confirmButtonText: "OK",
      });
    } else {
      throw new Error("Tidak ada hasil yang di-generate");
    }
  } catch (err) {
    console.error("Error generating AI message:", err);
    showAlert({
      icon: "error",
      title: "Gagal Generate Pesan",
      text: err.message || "Terjadi kesalahan saat generate pesan dengan AI",
      confirmButtonText: "OK",
    });
  } finally {
    aiGenerating.value = false;
  }
};

// Initialize on mount
onMounted(async () => {
  await loadContacts();
  await loadChannels(); // Load channels on mount
  await loadProducts(); // Load products on mount
  initializeForm();
});
</script>