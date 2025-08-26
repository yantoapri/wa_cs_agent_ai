<template>
  <div class="w-full p-2 md:p-8 h-full flex flex-col">
    <div
      class="flex items-center mb-4 bg-white p-3 rounded-lg"
      v-if="selectedAgent"
    >
      <!-- Tombol back hanya di mobile, di   if (!selectedChannel.value || selectedChannel.value.trim() === "") {
    showToast({ message: "Channel WhatsApp wajib dipilih.", type: "error" });
    return;
  }

  try {
    // Set selected channel as phone
    form.value.phone = selectedChannel.value;atar -->
      <button
        class="md:hidden mr-2 p-1 text-gray-700 hover:bg-gray-200 rounded-full"
        @click="$emit('back')"
        aria-label="Kembali ke daftar agent"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-7 h-7"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <img
        class="w-12 h-12 rounded-full mr-4"
        :src="getAgentAvatar(selectedAgent)"
        :alt="selectedAgent?.name"
      />
      <div>
        <span class="block font-semibold text-lg">{{ 
          selectedAgent?.name
        }}</span>
        <!-- ...status/info lain... -->
      </div>
    </div>

    <div
      v-if="showForm"
      class="bg-white rounded-lg shadow-xl w-full max-w-full overflow-y-auto p-4 mb-4 flex-1"
    >
      <form @submit.prevent="onSave">
        <!-- Data Profil Agen Section -->
        <div class="mb-6">
          <div class="mb-4">
            <label class="block font-medium text-gray-700 mb-2">
              Nama <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              required
              class="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nama Lengkap"
            />
          </div>
          <div class="mb-4">
            <label class="block font-medium text-gray-700 mb-2">
              Chanel<span class="text-red-500">*</span>
            </label>
            <select
              v-model="selectedChannel"
              required
              class="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih Channel</option>
              <option
                v-for="channel in chanels"
                :key="channel.id"
                :value="channel.whatsapp_number"
                :disabled="channel.whatsapp_number==''"
              >
                {{ channel.session_name }} - {{ channel.whatsapp_number }} ({{ channel.is_active ? 'Aktif' : 'Tidak Aktif' }})
              </option>
            </select>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {{ form?.id ? "Update" : "Simpan" }}
          </button>
          <button
            v-if="form?.id"
            type="button"
            @click="onDelete"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Hapus
          </button>
        </div>
      </form>
    </div>

    <div
      v-if="!showForm && !selectedAgent"
      class="p-4 md:p-8 text-gray-400 text-center flex-1 flex items-center justify-center"
    >
      Pilih agent manusia untuk melihat detail atau klik "Buat Agent Manusia"
      untuk tambah baru.
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useAgentStore } from "~/composables/useAgents";
import { useChanelstore } from "~/composables/useChanels";
import { useToast } from "~/composables/useToast";
const { showToast } = useToast();

const props = defineProps({ selectedAgent: Object });
const { updateAgent, deleteAgent, addAgent, fetchAgentsByType } = 
  useAgentStore();
const { chanels, fetchAllChannels } = useChanelstore();
const emit = defineEmits(["refresh-list", "clear-selected"]);

const form = ref(null);
const showForm = ref(false);
const notif = ref("");
const error = ref("");

// Separate reactive state for channel selection
const selectedChannel = ref("");

// Watch for changes in selectedChannel and sync to form.phone
watch(selectedChannel, (newVal) => {
  if (form.value) {
    form.value.phone = newVal;
  }
});

// Watch for changes in form.phone and sync to selectedChannel
watch(() => form.value?.phone, (newVal) => {
  if (newVal !== selectedChannel.value) {
    selectedChannel.value = newVal || "";
  }
});

// Watch for selectedAgent prop changes
watch(
  () => props.selectedAgent,
  (val) => {
    if (val && (val.id || Object.keys(val).length === 0)) {
      // Deep clone agar tidak mengubah props langsung
      form.value = JSON.parse(JSON.stringify(val));
      
      // Ensure form has all required properties for new agent
      if (!form.value.name) form.value.name = "";
      if (!form.value.phone) form.value.phone = "";
      
      // Set selected channel
      selectedChannel.value = form.value.phone || "";
      
      showForm.value = true;
    } else {
      form.value = null;
      selectedChannel.value = "";
      showForm.value = false;
    }
    notif.value = "";
    error.value = "";
  },
  { immediate: true }
);

// Horizontal agent manusia list
const agentList = ref([]);
onMounted(async () => {
  agentList.value = await fetchAgentsByType("manusia");
  await fetchAllChannels(); // Load all channels data (including inactive)
  console.log("Loaded channels:", chanels.value);
});

function selectAgent(agent) {
  form.value = JSON.parse(JSON.stringify(agent));
  
  // Ensure form has all required properties
  if (!form.value.name) form.value.name = "";
  if (!form.value.phone) form.value.phone = "";
  
  // Set selected channel
  selectedChannel.value = form.value.phone || "";
  
  showForm.value = true;
}

function getAgentAvatar(agent) {
  if (!agent) return "";
  if (agent.avatar_url) return agent.avatar_url;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    agent.name || "A"
  )}&background=random`;
}

function closeModal() {
  showForm.value = false;
  form.value = null;
  selectedChannel.value = "";
  emit("clear-selected");
}

async function onSave() {
  notif.value = "";
  error.value = "";

  // Validation
  if (!form.value.name || form.value.name.trim() === "") {
    showToast({ message: "Nama wajib diisi.", type: "error" });
    return;
  }

  if (!form.value.phone || form.value.phone.trim() === "") {
    showToast({ message: "Channel WhatsApp wajib dipilih.", type: "error" });
    return;
  }

  try {
    // form.phone already contains the selected channel value

    if (form.value.id) {
      await updateAgent(form.value.id, form.value);
      showToast({ message: "Data agent berhasil disimpan.", type: "success" });
      emit("refresh-list");
      closeModal();
    } else {
      // Tambah agent baru
      const newAgent = await addAgent({
        ...form.value,
        type: "manusia",
        is_active: true,
      });
      showToast({
        message: "Data agent berhasil ditambahkan.",
        type: "success",
      });
      emit("refresh-list");
      closeModal();
    }
  } catch (e) {
    showToast({
      message: e.message || "Gagal menyimpan data agent.",
      type: "error",
    });
  }
}

async function onDelete() {
  notif.value = "";
  error.value = "";
  try {
    await deleteAgent(form.value.id);
    showToast({ message: "Data agent berhasil dihapus.", type: "success" });
    closeModal();
    emit("refresh-list");
  } catch (e) {
    showToast({
      message: e.message || "Gagal menghapus data agent.",
      type: "error",
    });
  }
}
</script>
