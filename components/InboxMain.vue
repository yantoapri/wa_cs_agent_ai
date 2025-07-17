<template>
  <div>
    <div v-if="selectedConversation" class="bg-white rounded-lg shadow p-6">
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

      <div v-if="loading" class="text-center py-8">
        <div class="text-gray-500">Loading pesan...</div>
      </div>

      <div v-else class="space-y-2 mb-4 max-h-96 overflow-y-auto">
        <div
          v-if="messages.length === 0"
          class="text-center py-8 text-gray-400"
        >
          Belum ada pesan dalam percakapan ini
        </div>
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'px-4 py-2 rounded-lg max-w-[70%]',
            message.direction === 'outbound'
              ? 'bg-blue-50 ml-auto'
              : 'bg-gray-100',
          ]"
        >
          <!-- Sender info for agent messages -->
          <div
            v-if="message.sender_id && message.agents"
            class="text-xs text-gray-500 mb-1"
          >
            {{ message.agents.name }} ({{
              message.agents.agent_type === "ai" ? "AI" : "Human"
            }})
          </div>
          <!-- Sender info for contact messages -->
          <div
            v-else-if="message.direction === 'inbound'"
            class="text-xs text-gray-500 mb-1"
          >
            {{
              selectedConversation.contact_name ||
              selectedConversation.contact_phone
            }}
          </div>
          <div class="text-sm">{{ message.content }}</div>
          <div class="text-xs text-gray-400 mt-1">
            {{ formatTime(message.created_at) }}
            <span v-if="message.direction === 'outbound'" class="ml-2">
              {{ message.is_read ? "✓✓" : "✓" }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Ketik pesan..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-base"
          @keyup.enter="sendMessage"
          :disabled="sending"
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim() || sending"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {{ sending ? "Mengirim..." : "Kirim" }}
        </button>
      </div>
    </div>
    <div v-else class="p-8 text-gray-400 text-center">
      Pilih percakapan untuk melihat detail chat.
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import { useConversationStore } from "~/composables/useConversationStore";

const props = defineProps({
  selectedConversation: Object,
});

const {
  messages,
  loading,
  addMessage,
  fetchMessagesByGroup,
  markMessagesAsRead,
} = useConversationStore();
const newMessage = ref();
const sending = ref(false);

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

const sendMessage = async () => {
  if (!newMessage.value.trim() || !props.selectedConversation) return;

  sending.value = true;
  try {
    await addMessage({
      sender_id: props.selectedConversation.agent.id,
      contact_id: props.selectedConversation.contact.id,
      channel_id: props.selectedConversation.channel.id,
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

// Watch for conversation changes and load messages
watch(
  () => props.selectedConversation,
  async (newConversation) => {
    if (newConversation) {
      await fetchMessagesByGroup(
        newConversation.agent.id,
        newConversation.contact.id,
        newConversation.channel.id
      );
      // Mark messages as read when conversation is selected
      await markMessagesAsRead(
        newConversation.agent.id,
        newConversation.contact.id,
        newConversation.channel.id
      );
    }
  },
  { immediate: true }
);
</script>
