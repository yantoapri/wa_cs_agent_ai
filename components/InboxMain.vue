<template>
  <div>
    <div
      v-if="selectedConversation"
      class="bg-white rounded-lg shadow p-6 h-[90vh] flex flex-col"
    >
      <div class="flex items-center mb-4">
        <img
          class="w-12 h-12 rounded-full mr-4"
          :src="getConversationAvatar(selectedConversation)"
          :alt="getConversationName(selectedConversation)"
        />
        <div>
          <span class="block font-semibold text-lg">{{
            getConversationName(selectedConversation)
          }}</span>
          <span class="text-gray-500 text-sm">{{
            getConversationStatus(selectedConversation)
          }}</span>
        </div>
      </div>

      <div v-if="loading" class="text-center py-8 flex-1">
        <div class="text-gray-500">Loading pesan...</div>
      </div>

      <div v-else class="space-y-2 mb-4 flex-1 overflow-y-auto">
        <div
          v-if="messages.length === 0"
          class="text-center py-8 text-gray-400"
        >
          Belum ada pesan dalam percakapan ini
        </div>
        <template v-else>
          <template v-for="(message, idx) in sortedMessages" :key="message.id">
            <template v-if="shouldShowDate(messages, idx)">
              <div class="flex justify-center my-4">
                <span
                  class="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full shadow"
                  >{{ formatDate(message.created_at) }}</span
                >
              </div>
            </template>
            <!-- Bubble chat: kanan jika from == contact, kiri jika from == chanel -->
            <div
              class="w-full flex"
              :class="
                normalizePhone(message.from) ===
                normalizePhone(selectedConversation.contact?.phone_number)
                  ? 'justify-end'
                  : 'justify-start'
              "
            >
              <div
                :class="[
                  'max-w-[70%] px-4 py-2 rounded-lg mb-2 align-top',
                  normalizePhone(message.from) ===
                  normalizePhone(selectedConversation.contact?.phone_number)
                    ? 'bg-blue-500 text-white ml-auto' // bubble kanan (user)
                    : 'bg-gray-100 text-gray-900 mr-auto', // bubble kiri (agent)
                ]"
              >
                <div
                  class="text-xs mb-1"
                  :class="
                    normalizePhone(message.from) ===
                    normalizePhone(selectedConversation.contact?.phone_number)
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  "
                >
                  {{
                    normalizePhone(message.from) ===
                    normalizePhone(selectedConversation.contact?.phone_number)
                      ? selectedConversation.contact?.name ||
                        selectedConversation.contact?.phone_number ||
                        "User"
                      : selectedConversation.agent?.name || "Agent"
                  }}
                </div>
                <div v-if="message.media_url" class="mb-2">
                  <img
                    :src="message.media_url"
                    alt="media"
                    class="max-w-full max-h-60 rounded-lg border"
                    :class="
                      normalizePhone(message.from) ===
                      normalizePhone(selectedConversation.contact?.phone_number)
                        ? 'ml-auto'
                        : 'mr-auto'
                    "
                  />
                </div>
                <div class="text-sm whitespace-pre-line">
                  {{ message.content }}
                </div>
                <div
                  class="text-xs text-gray-200 mt-1"
                  v-if="
                    normalizePhone(message.from) ===
                    normalizePhone(selectedConversation.contact?.phone_number)
                  "
                >
                  {{ formatTime(message.created_at) }}
                </div>
                <div class="text-xs text-gray-400 mt-1" v-else>
                  {{ formatTime(message.created_at) }}
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>

      <!-- HAPUS input dan tombol kirim pesan -->
      <!--
      <div class="flex gap-2">
        <input ... />
        <button ...>Kirim</button>
      </div>
      -->
    </div>
    <div v-else class="p-8 text-gray-400 text-center">
      Pilih percakapan untuk melihat detail chat.
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onBeforeUnmount, computed } from "vue";
import { useConversationStore } from "~/composables/useConversationStore";

const props = defineProps({
  selectedConversation: Object,
});

const {
  messages,
  loading,
  addMessage,
  fetchMessagesByGroupAi,
  fetchMessagesByGroupManusia,
  markMessagesAsRead,
} = useConversationStore();
const newMessage = ref("");
const sending = ref(false);

let isMounted = true;
onBeforeUnmount(() => {
  isMounted = false;
});

const getConversationName = (conversation) => {
  return (
    conversation.contact?.name ||
    conversation.contact?.phone_number ||
    "Unknown Contact"
  );
};

const getConversationAvatar = (conversation) => {
  return (
    conversation.contact?.avatar_url ||
    `https://ui-avatars.com/api/?name=${getConversationName(
      conversation
    )}&background=random`
  );
};

const getConversationStatus = (conversation) => {
  return "Active";
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: undefined,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function shouldShowDate(messages, idx) {
  if (idx === 0) return true;
  const prev = messages[idx - 1];
  const curr = messages[idx];
  return formatDate(prev.created_at) !== formatDate(curr.created_at);
}

function normalizePhone(num) {
  if (!num) return "";
  return String(num)
    .replace(/^\+?0?/, "")
    .replace(/[^0-9]/g, "");
}

const sendMessage = async () => {
  if (!props.selectedConversation || !String(newMessage.value).trim()) return;

  sending.value = true;
  try {
    await addMessage({
      sender_id: props.selectedConversation.agent.id,
      contact_id: props.selectedConversation.contact.id,
      chanel_id: props.selectedConversation.chanel.id,
      content: newMessage.value.trim(),
      direction: "outbound",
      message_type: "text",
      is_read: true,
    });
    newMessage.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    sending.value = false;
  }
};

const sortedMessages = computed(() => {
  return [...messages.value].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
});

// Watch for conversation changes and load messages
watch(
  () => props.selectedConversation,
  async (newConversation) => {
    if (!isMounted) return;
    try {
      if (newConversation) {
        if (newConversation.agent.type === "ai") {
          await fetchMessagesByGroupAi(
            newConversation.agent.id,
            newConversation.contact.id,
            newConversation.chanel.id
          );
        }
        if (newConversation.agent.type === "manusia") {
          await fetchMessagesByGroupManusia(
            newConversation.agent.id,
            newConversation.contact.id,
            newConversation.chanel.id
          );
        }
        if (!isMounted) return;
        await markMessagesAsRead(
          newConversation.agent.id,
          newConversation.contact.id,
          newConversation.chanel.id
        );
        if (!isMounted) return;
        console.log("[InboxMain] Messages loaded:", messages.value);
      }
    } catch (err) {
      console.error("[InboxMain] Error in watcher:", err);
    }
  },
  { immediate: true }
);
</script>
