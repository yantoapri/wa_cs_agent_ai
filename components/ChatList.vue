<template>
  <div class="flex flex-col h-full">
    <!-- Sub Tab Navigation -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex space-x-1">
        <button
          v-for="subTab in chatSubTabs"
          :key="subTab.value"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none"
          :class="
            activeSubTab === subTab.value
              ? 'text-blue-600 bg-blue-50 border border-blue-200'
              : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
          "
          @click="$emit('update:activeSubTab', subTab.value)"
        >
          {{ subTab.label }}
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto">
      <!-- Broadcast List -->
      <div v-if="activeSubTab === 'broadcast'" class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-800">Daftar Broadcast</h3>
          <button
            @click="$emit('add-broadcast')"
            class="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            title="Tambah Broadcast Baru"
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

        <!-- Loading State -->
        <div
          v-if="broadcastLoading"
          class="flex items-center justify-center py-8"
        >
          <div class="text-gray-500">Memuat broadcast...</div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="broadcastError"
          class="bg-red-50 border border-red-200 rounded-md p-4 mb-4"
        >
          <div class="text-red-800 text-sm">{{ broadcastError }}</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="broadcastList.length === 0" class="text-center py-8">
          <div class="text-gray-500">Belum ada broadcast message</div>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="broadcast in broadcastList"
            :key="broadcast.id"
            @click="$emit('select-broadcast', broadcast)"
            class="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            :class="
              selectedBroadcast?.id === broadcast.id
                ? 'border-blue-300 bg-blue-50'
                : ''
            "
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="font-medium text-gray-800">{{ broadcast.title }}</h4>
                <p class="text-sm text-gray-600 mt-1">
                  {{ broadcast.message.substring(0, 50) }}...
                </p>
                <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{{ broadcast.contactCount }} kontak</span>
                  <span>{{ formatDate(broadcast.createdAt) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="
                    broadcast.status === 'sent'
                      ? 'bg-green-100 text-green-800'
                      : broadcast.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  "
                >
                  {{ getStatusText(broadcast.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Auto Message List -->
      <div v-else-if="activeSubTab === 'auto-message'" class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-800">
            Daftar Pesan Otomatis
          </h3>
          <button
            @click="$emit('add-auto-message')"
            class="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
            title="Tambah Pesan Otomatis Baru"
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

        <!-- Loading State -->
        <div
          v-if="autoMessageLoading"
          class="flex items-center justify-center py-8"
        >
          <div class="text-gray-500">Memuat pesan otomatis...</div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="autoMessageError"
          class="bg-red-50 border border-red-200 rounded-md p-4 mb-4"
        >
          <div class="text-red-800 text-sm">{{ autoMessageError }}</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="autoMessageList.length === 0" class="text-center py-8">
          <div class="text-gray-500">Belum ada pesan otomatis</div>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="autoMessage in autoMessageList"
            :key="autoMessage.id"
            @click="$emit('select-auto-message', autoMessage)"
            class="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            :class="
              selectedAutoMessage?.id === autoMessage.id
                ? 'border-green-300 bg-green-50'
                : ''
            "
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="font-medium text-gray-800">
                  {{ autoMessage.title }}
                </h4>
                <p class="text-sm text-gray-600 mt-1">
                  {{ autoMessage.message.substring(0, 50) }}...
                </p>
                <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{{ autoMessage.contactCount }} kontak</span>
                  <span>{{ formatDate(autoMessage.scheduledAt) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="
                    autoMessage.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : autoMessage.status === 'sent'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  "
                >
                  {{ getStatusText(autoMessage.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useBroadcastMessages } from "~/composables/useBroadcastMessages";
import { useAutoMessages } from "~/composables/useAutoMessages";

const props = defineProps({
  activeSubTab: {
    type: String,
    default: "broadcast",
  },
  selectedBroadcast: {
    type: Object,
    default: null,
  },
  selectedAutoMessage: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits([
  "update:activeSubTab",
  "select-broadcast",
  "select-auto-message",
  "add-broadcast",
  "add-auto-message",
]);

const chatSubTabs = [
  { value: "broadcast", label: "Broadcast" },
  { value: "auto-message", label: "Pesan Otomatis" },
];

// Use composables
const {
  broadcastMessages,
  loading: broadcastLoading,
  error: broadcastError,
  fetchBroadcastMessages,
} = useBroadcastMessages();

const {
  autoMessages,
  loading: autoMessageLoading,
  error: autoMessageError,
  fetchAutoMessages,
} = useAutoMessages();

// Computed properties for transformed data
const broadcastList = computed(() => {
  return broadcastMessages.value.map((msg) => ({
    id: msg.id,
    title: msg.title,
    message: msg.message,
    contactCount: msg.contact_count,
    contact_ids: msg.contact_ids, // Include contact_ids
    status: msg.status,
    createdAt: msg.created_at,
  }));
});

const autoMessageList = computed(() => {
  return autoMessages.value.map((msg) => ({
    id: msg.id,
    title: msg.title,
    message: msg.message,
    contactCount: msg.contact_count,
    contact_ids: msg.contact_ids, // Include contact_ids
    status: msg.status,
    scheduledAt: msg.scheduled_at,
  }));
});

// Load data on mount
onMounted(async () => {
  await Promise.all([fetchBroadcastMessages(), fetchAutoMessages()]);
});

// Watch for sub tab changes to refresh data
watch(
  () => props.activeSubTab,
  async (newTab) => {
    if (newTab === "broadcast") {
      await fetchBroadcastMessages();
    } else if (newTab === "auto-message") {
      await fetchAutoMessages();
    }
  }
);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
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

// Expose methods to parent component
defineExpose({
  fetchBroadcastMessages,
  fetchAutoMessages,
});
</script>
