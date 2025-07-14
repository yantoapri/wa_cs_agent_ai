<template>
  <div>
    <div v-if="loading" class="text-center py-8">
      <div class="text-gray-500">Loading inbox...</div>
    </div>
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-500">{{ error }}</div>
    </div>
    <div v-else-if="conversations.length === 0" class="text-center py-8">
      <div class="text-gray-500">Belum ada percakapan</div>
    </div>
    <div v-else>
      <div
        v-for="conversation in conversations"
        :key="conversation.id"
        @click="selectConversation(conversation)"
        :class="[
          'flex items-center gap-4 p-4 rounded-lg cursor-pointer mb-2 transition',
          selectedConversation && selectedConversation.id === conversation.id
            ? 'bg-blue-50 border border-blue-200'
            : 'hover:bg-gray-50',
        ]"
      >
        <img
          class="w-12 h-12 rounded-full"
          :src="getConversationAvatar(conversation)"
          :alt="getConversationName(conversation)"
        />
        <div class="flex-1">
          <div class="flex items-center font-medium">
            <span class="text-base">{{
              getConversationName(conversation)
            }}</span>
            <span
              v-if="conversation.unread_count > 0"
              class="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
              >{{ conversation.unread_count }}</span
            >
          </div>
          <div class="text-gray-500 text-sm">
            {{ conversation.last_message || "Belum ada pesan" }}
          </div>
        </div>
        <div class="text-gray-400 text-xs w-16 text-right">
          {{ formatTime(conversation.updated_at) }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted } from "vue";
import { useConversationStore } from "~/composables/useConversationStore";
import { useAgentStore } from "~/composables/useAgents";

const emit = defineEmits(["select-conversation"]);
const props = defineProps({
  selectedConversation: Object,
  activeTab: String,
});

const { conversations, loading, error, fetchConversationsByAgent } =
  useConversationStore();
const { agents } = useAgentStore();

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

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInHours < 48) {
    return "Kemarin";
  } else {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  }
};

const selectConversation = (conversation) => {
  emit("select-conversation", conversation);
};

// Load conversations based on active tab
onMounted(async () => {
  if (props.activeTab === "ai") {
    // Load AI agent conversations
    const aiAgents = agents.value.filter((a) => a.agent_type === "ai");
    if (aiAgents.length > 0) {
      await fetchConversationsByAgent(aiAgents[0].id);
    }
  } else {
    // Load human agent conversations
    const humanAgents = agents.value.filter((a) => a.agent_type === "human");
    if (humanAgents.length > 0) {
      await fetchConversationsByAgent(humanAgents[0].id);
    }
  }
});
</script>
