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
import { ref, watch, onMounted } from "vue";
import { useConversationStore } from "~/composables/useConversationStore";
import { useAgentStore } from "~/composables/useAgents";

const props = defineProps({
  selectedConversation: Object,
});

const { messages, loading, addMessage, fetchMessages, markMessagesAsRead } =
  useConversationStore();
const { agents } = useAgentStore();
const newMessage = ref("");
const sending = ref(false);

const getConversationName = (conversation) => {
  if (conversation.contact_name) {
    return conversation.contact_name;
  }
  if (conversation.assigned_agent_id) {
    const agent = agents.value.find(
      (a) => a.id === conversation.assigned_agent_id
    );
    return agent
      ? `${agent.name} (${agent.agent_type === "ai" ? "AI" : "Human"})`
      : "Unknown Agent";
  }
  return "Unknown Contact";
};

const getConversationAvatar = (conversation) => {
  if (conversation.contact_avatar) {
    return conversation.contact_avatar;
  }
  if (conversation.assigned_agent_id) {
    const agent = agents.value.find(
      (a) => a.id === conversation.assigned_agent_id
    );
    if (agent) {
      return (
        agent.avatar ||
        `https://ui-avatars.com/api/?name=${agent.name}&background=random`
      );
    }
  }
  return "https://ui-avatars.com/api/?name=Unknown&background=random";
};

const getConversationStatus = (conversation) => {
  if (conversation.assigned_agent_id) {
    const agent = agents.value.find(
      (a) => a.id === conversation.assigned_agent_id
    );
    if (agent) {
      return agent.agent_type === "ai" ? "AI Assistant" : "Human Agent";
    }
  }
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
      conversation_id: props.selectedConversation.id,
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
      await fetchMessages(newConversation.id);
      // Mark messages as read when conversation is selected
      await markMessagesAsRead(newConversation.id);
    }
  },
  { immediate: true }
);

onMounted(() => {
  // Load agents if not already loaded
  if (agents.value.length === 0) {
    // This will be handled by the parent component or global state
  }
});
</script>
