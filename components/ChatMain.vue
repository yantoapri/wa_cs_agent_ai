<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200 bg-white">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">
            {{ getHeaderTitle() }}
          </h2>
          <p class="text-gray-600 mt-1">{{ getHeaderSubtitle() }}</p>
        </div>
        <button
          v-if="selectedBroadcast || selectedAutoMessage || showForm"
          @click="$emit('back')"
          class="md:hidden bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200"
        >
          ← Kembali
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Form Input -->
      <template v-if="showForm">
        <ChatForm
          :form-type="formType"
          :edit-data="formEditData"
          @back="$emit('back')"
          @saved="$emit('form-saved')"
          @refresh-list="$emit('refresh-list')"
        />
      </template>

      <!-- Welcome State -->
      <div
        v-else-if="!selectedBroadcast && !selectedAutoMessage && !showForm"
        class="flex-1 flex items-center justify-center"
      >
        <div class="text-center">
          <div
            class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-700 mb-2">
            Selamat Datang di Chat
          </h3>
          <p class="text-gray-500">
            Pilih broadcast atau pesan otomatis untuk melihat detail
          </p>
        </div>
      </div>

      <!-- Broadcast Detail -->
      <div v-else-if="selectedBroadcast && !showForm" class="p-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-800">
              {{ selectedBroadcast.title }}
            </h3>
            <span
              class="px-3 py-1 text-sm rounded-full"
              :class="
                selectedBroadcast.status === 'sent'
                  ? 'bg-green-100 text-green-800'
                  : selectedBroadcast.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              "
            >
              {{ getStatusText(selectedBroadcast.status) }}
            </span>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Pesan</label
              >
              <div class="bg-gray-50 p-3 rounded-md">
                <p class="text-gray-800">{{ selectedBroadcast.message }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Jumlah Kontak</label
                >
                <p class="text-gray-800">
                  {{ selectedBroadcast.contactCount }} kontak
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Tanggal Dibuat</label
                >
                <p class="text-gray-800">
                  {{ formatDate(selectedBroadcast.createdAt) }}
                </p>
              </div>
            </div>

            <!-- Contacts List -->
            <div v-if="selectedBroadcast.contactCount > 0">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Daftar Kontak yang Dikirimi</label
              >
              <div class="bg-gray-50 rounded-md max-h-60 overflow-y-auto">
                <div v-if="loadingContacts" class="p-4 text-center">
                  <div
                    class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"
                  ></div>
                  <p class="text-sm text-gray-600 mt-2">Memuat kontak...</p>
                </div>
                <div
                  v-else-if="broadcastContacts.length === 0"
                  class="p-4 text-center"
                >
                  <p class="text-sm text-gray-500">
                    Tidak ada data kontak tersedia
                  </p>
                </div>
                <div
                  v-else
                  v-for="contact in broadcastContacts"
                  :key="contact.id"
                  class="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-100"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div
                        class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                      >
                        <span class="text-sm font-medium text-blue-600">
                          {{
                            contact.name
                              ? contact.name.charAt(0).toUpperCase()
                              : "?"
                          }}
                        </span>
                      </div>
                      <div>
                        <p class="font-medium text-gray-800">
                          {{ contact.name || "Tanpa Nama" }}({{
                            contact.phone_number || "No HP tidak tersedia"
                          }})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                v-if="selectedBroadcast.status === 'pending'"
                @click="handleSendBroadcast"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Kirim Sekarang
              </button>
              <button
                @click="handleDeleteBroadcast"
                class="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Auto Message Detail -->
      <div v-else-if="selectedAutoMessage && !showForm" class="p-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-800">
              {{ selectedAutoMessage.title }}
            </h3>
            <span
              class="px-3 py-1 text-sm rounded-full"
              :class="
                selectedAutoMessage.status === 'scheduled'
                  ? 'bg-blue-100 text-blue-800'
                  : selectedAutoMessage.status === 'sent'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              "
            >
              {{ getStatusText(selectedAutoMessage.status) }}
            </span>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Pesan</label
              >
              <div class="bg-gray-50 p-3 rounded-md">
                <p class="text-gray-800">{{ selectedAutoMessage.message }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Jumlah Kontak</label
                >
                <p class="text-gray-800">
                  {{ selectedAutoMessage.contactCount }} kontak
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Jadwal Kirim</label
                >
                <p class="text-gray-800">
                  {{ formatDateTime(selectedAutoMessage.scheduledAt) }}
                </p>
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                v-if="selectedAutoMessage.status === 'scheduled'"
                @click="handleSendAutoMessage"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Kirim Sekarang
              </button>
              <button
                v-if="selectedAutoMessage.status === 'scheduled'"
                @click="handleCancelAutoMessage"
                class="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-md hover:bg-yellow-200"
              >
                Batalkan
              </button>
              <button
                @click="$emit('edit', selectedAutoMessage)"
                class="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Edit
              </button>
              <button
                @click="handleDeleteAutoMessage"
                class="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useBroadcastMessages } from "~/composables/useBroadcastMessages";
import { useAutoMessages } from "~/composables/useAutoMessages";
import { useToast } from "~/composables/useToast";
import ChatForm from "~/components/ChatForm.vue";
import Swal from "sweetalert2";

// Fallback for SweetAlert if not available
const showAlert = (options) => {
  console.log("[ChatMain] showAlert called with options:", options);
  console.log("[ChatMain] Swal available:", typeof Swal !== "undefined");
  console.log(
    "[ChatMain] Swal.fire available:",
    typeof Swal !== "undefined" && Swal.fire
  );

  if (typeof Swal !== "undefined" && Swal.fire) {
    console.log("[ChatMain] Using SweetAlert");
    return Swal.fire(options);
  } else {
    console.log("[ChatMain] Using fallback alert");
    // Fallback to native alert
    alert(options.text || options.title || "Alert");
    return Promise.resolve({ isConfirmed: true });
  }
};

const props = defineProps({
  selectedBroadcast: {
    type: Object,
    default: null,
  },
  selectedAutoMessage: {
    type: Object,
    default: null,
  },
  showForm: {
    type: Boolean,
    default: false,
  },
  formType: {
    type: String,
    default: "broadcast",
  },
  formEditData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["back", "edit", "refresh-list", "form-saved"]);

// Use composables for actions
const { sendBroadcastMessage, deleteBroadcastMessage, updateBroadcastMessage } =
  useBroadcastMessages();

const {
  sendAutoMessageNow,
  deleteAutoMessage,
  updateAutoMessage,
  cancelAutoMessage,
} = useAutoMessages();

// Reactive data for broadcast contacts
const broadcastContacts = ref([]);
const loadingContacts = ref(false);

// Fetch contacts for broadcast
const fetchBroadcastContacts = async (contactIds) => {
  if (!contactIds || contactIds.length === 0) {
    broadcastContacts.value = [];
    return;
  }

  loadingContacts.value = true;
  try {
    const supabase = useSupabaseClient();

    const { data, error } = await supabase
      .from("contacts")
      .select("id, name, phone_number, email")
      .in("id", contactIds);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    broadcastContacts.value = data || [];
  } catch (err) {
    console.error("Error fetching broadcast contacts:", err);
    broadcastContacts.value = [];
  } finally {
    loadingContacts.value = false;
  }
};

// Watch for selectedBroadcast changes to fetch contacts
watch(
  () => props.selectedBroadcast,
  (newBroadcast) => {
    if (newBroadcast && newBroadcast.contact_ids) {
      let contactIds = [];

      // Handle different formats of contact_ids
      if (Array.isArray(newBroadcast.contact_ids)) {
        // Check if it's the new format with objects containing name and phone
        if (
          newBroadcast.contact_ids.length > 0 &&
          typeof newBroadcast.contact_ids[0] === "object" &&
          newBroadcast.contact_ids[0].name
        ) {
          // New format: array of objects with name and phone
          broadcastContacts.value = newBroadcast.contact_ids.map((contact) => ({
            id: contact.phone, // Use phone as ID for consistency
            name: contact.name,
            phone_number: contact.phone,
            email: null, // No email in this format
          }));
          return; // No need to fetch from database
        } else {
          // Old format: array of contact IDs
          contactIds = newBroadcast.contact_ids;
        }
      } else if (typeof newBroadcast.contact_ids === "string") {
        // If it's a JSON string
        try {
          const parsed = JSON.parse(newBroadcast.contact_ids);
          if (
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            typeof parsed[0] === "object" &&
            parsed[0].name
          ) {
            // New format: array of objects with name and phone
            broadcastContacts.value = parsed.map((contact) => ({
              id: contact.phone, // Use phone as ID for consistency
              name: contact.name,
              phone_number: contact.phone,
              email: null, // No email in this format
            }));
            return; // No need to fetch from database
          } else {
            // Old format: array of contact IDs
            contactIds = parsed;
          }
        } catch (e) {
          console.error("Error parsing contact_ids:", e);
          contactIds = [];
        }
      }

      // Only fetch from database if we have contact IDs (old format)
      if (contactIds.length > 0) {
        fetchBroadcastContacts(contactIds);
      } else {
        broadcastContacts.value = [];
      }
    } else {
      broadcastContacts.value = [];
    }
  },
  { immediate: true }
);

const getHeaderTitle = () => {
  if (props.showForm) {
    const isEditing = !!props.formEditData;
    const formType =
      props.formType === "broadcast" ? "Broadcast" : "Pesan Otomatis";
    return isEditing ? `Edit ${formType}` : `Tambah ${formType}`;
  }
  if (props.selectedBroadcast) return "Detail Broadcast";
  if (props.selectedAutoMessage) return "Detail Pesan Otomatis";
  return "Chat";
};

const getHeaderSubtitle = () => {
  if (props.showForm) {
    return props.formType === "broadcast"
      ? "Kirim pesan ke banyak kontak sekaligus"
      : "Jadwalkan pesan untuk dikirim otomatis";
  }
  if (props.selectedBroadcast) return "Kelola broadcast message";
  if (props.selectedAutoMessage) return "Kelola pesan otomatis";
  return "Kelola pesan dan broadcast";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusText = (status) => {
  const statusMap = {
    sent: "Terkirim",
    pending: "Menunggu",
    scheduled: "Terjadwal",
    draft: "Draft",
    failed: "Gagal",
    cancelled: "Dibatalkan",
  };
  return statusMap[status] || status;
};

// Action handlers
const handleSendBroadcast = async () => {
  if (props.selectedBroadcast) {
    await sendBroadcastMessage(props.selectedBroadcast.id);
    emit("back");
    emit("refresh-list");
  }
};

const handleSendAutoMessage = async () => {
  if (props.selectedAutoMessage) {
    await sendAutoMessageNow(props.selectedAutoMessage.id);
    emit("back");
    emit("refresh-list");
  }
};

const handleDeleteBroadcast = async () => {
  if (!props.selectedBroadcast) return;

  const result = await showAlert({
    title: "Hapus Broadcast",
    text: `Apakah Anda yakin ingin menghapus broadcast "${props.selectedBroadcast.title}"?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });

  if (result.isConfirmed) {
    await deleteBroadcastMessage(props.selectedBroadcast.id);
    emit("back");
    emit("refresh-list");
  }
};

const handleDeleteAutoMessage = async () => {
  if (!props.selectedAutoMessage) return;

  const result = await showAlert({
    title: "Hapus Pesan Otomatis",
    text: `Apakah Anda yakin ingin menghapus pesan otomatis "${props.selectedAutoMessage.title}"?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });

  if (result.isConfirmed) {
    await deleteAutoMessage(props.selectedAutoMessage.id);
    emit("back");
    emit("refresh-list");
  }
};

const handleCancelAutoMessage = async () => {
  if (!props.selectedAutoMessage) return;

  const result = await showAlert({
    title: "Batalkan Pesan Otomatis",
    text: `Apakah Anda yakin ingin membatalkan pesan otomatis "${props.selectedAutoMessage.title}"?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Batalkan!",
    cancelButtonText: "Tidak",
    reverseButtons: true,
  });

  if (result.isConfirmed) {
    await cancelAutoMessage(props.selectedAutoMessage.id);
    emit("back");
    emit("refresh-list");
  }
};
</script>
