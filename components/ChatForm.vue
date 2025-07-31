<template>
  <div class="w-full p-6">
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-6">
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
            <textarea
              v-model="form.message"
              rows="6"
              required
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tulis pesan Anda di sini..."
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
          <div v-if="formType === 'auto-message'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Jadwal Kirim *
            </label>

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
                      class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
import { $fetch } from "ofetch";

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
  status: "draft",
  scheduledDate: "",
  scheduledTime: "",
  channelId: "",
  schedules: [], // Only used for auto messages
});

// Contact selection
const availableContacts = ref([]);
const selectedContacts = ref([]);
const selectAll = ref(false);

// Channel selection
const availableChannels = ref([]);
const channelsLoading = ref(false);

// Loading states
const loading = ref(false);
const contactsLoading = ref(false);
const sendingProgress = ref({ current: 0, total: 0, message: "" });

// Computed properties
const isEditing = computed(() => !!props.editData);
const today = computed(() => new Date().toISOString().split("T")[0]);

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
    const hasValidSchedules =
      form.value.schedules.length > 0 &&
      form.value.schedules.every((schedule) => schedule.date && schedule.time);
    return (
      hasTitle &&
      hasMessage &&
      hasContacts &&
      hasChannel &&
      isChannelActive &&
      hasSession &&
      hasValidSchedules
    );
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

// Watch for changes in selected contacts
watch(selectedContacts, (newValue) => {
  selectAll.value =
    newValue.length === availableContacts.value.length &&
    availableContacts.value.length > 0;
});

// Helper function to create auto message metadata
const createAutoMessageMetadata = () => {
  return {
    sender_type: "auto_message",
    is_auto_message: true,
    message_type: "scheduled",
    is_scheduled_message: true,
  };
};

// Initialize form with edit data
const initializeForm = () => {
  if (props.editData) {
    form.value = {
      title: props.editData.title || "",
      message: props.editData.message || "",
      status: props.editData.status || "draft",
      channelId: props.editData.chanel_id || "",
      scheduledDate: "",
      scheduledTime: "",
      schedules: [], // Initialize empty schedules
    };

    // Handle schedules for auto messages
    if (props.formType === "auto-message") {
      if (props.editData.schedules && Array.isArray(props.editData.schedules)) {
        // If schedules exist in edit data, use them
        form.value.schedules = props.editData.schedules;
      } else if (props.editData.scheduled_at) {
        // If only scheduled_at exists, convert to single schedule
        const scheduledDate = new Date(props.editData.scheduled_at);
        form.value.schedules = [
          {
            date: scheduledDate.toISOString().split("T")[0],
            time: scheduledDate.toTimeString().slice(0, 5),
          },
        ];
      } else {
        // Default to one empty schedule
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
  form.value.schedules.push({ date: today, time: "00:00" });
};

// Remove a schedule
const removeSchedule = (index) => {
  form.value.schedules.splice(index, 1);
};

// Handle form submission
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  // Additional validation for channel
  if (!selectedChannel.value) {
    Swal.fire({
      icon: "warning",
      title: "Peringatan",
      text: "Silakan pilih channel untuk mengirim pesan",
      confirmButtonText: "OK",
    });
    return;
  }

  if (!selectedChannel.value.is_active) {
    Swal.fire({
      icon: "warning",
      title: "Channel Tidak Aktif",
      text: "Channel yang dipilih tidak aktif. Silakan pilih channel yang aktif.",
      confirmButtonText: "OK",
    });
    return;
  }

  if (!selectedChannel.value.session_name) {
    Swal.fire({
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
    Swal.fire({
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
    Swal.fire({
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
      status: form.value.status,
      chanel_id: form.value.channelId,
    };

    if (props.formType === "auto-message") {
      // For auto messages, include schedules
      formData.schedules = form.value.schedules;
      // Also include the first schedule as scheduled_at for backward compatibility
      if (form.value.schedules.length > 0) {
        const firstSchedule = form.value.schedules[0];
        if (firstSchedule.date && firstSchedule.time) {
          formData.scheduled_at = new Date(
            `${firstSchedule.date}T${firstSchedule.time}`
          ).toISOString();
        }
      }

      // Add metadata to identify auto messages
      formData.metadata = createAutoMessageMetadata();
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
    Swal.fire({
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
    Swal.fire({
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

    // Extract contact IDs from the contact objects for the API call
    console.log("formData.contact_ids:", formData.contact_ids);
    console.log("availableContacts.value:", availableContacts.value);

    const contactIds = formData.contact_ids
      .map((contact) => {
        // If contact is an object with name and phone, we need to find the original contact ID
        if (typeof contact === "object" && contact.name && contact.phone) {
          const foundContact = availableContacts.value.find(
            (c) => c.name === contact.name && c.phone_number === contact.phone
          );
          console.log(
            `Looking for contact: ${contact.name} (${contact.phone})`,
            foundContact
          );
          return foundContact ? foundContact.id : null;
        }
        // If contact is already an ID, return it directly
        return contact;
      })
      .filter((id) => id !== null); // Remove any null values

    console.log("Extracted contactIds:", contactIds);

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

    console.log("Broadcast started successfully:", response);
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
    console.error("Error sending broadcast to WAHA:", error);
    throw error;
  }
};

// Initialize on mount
onMounted(async () => {
  await loadContacts();
  await loadChannels(); // Load channels on mount
  initializeForm();
});
</script>
