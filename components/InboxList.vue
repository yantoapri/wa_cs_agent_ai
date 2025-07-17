<template>
  <div>
    <div v-if="loading" class="text-center py-8">
      <div class="text-gray-500">Loading inbox...</div>
    </div>
    <div
      v-else-if="currentAgentConversations.length === 0"
      class="text-center py-8"
    >
      <div class="text-gray-500">
        {{
          activeTab === "ai"
            ? "Belum ada percakapan AI Agent"
            : "Belum ada percakapan Human Agent"
        }}
      </div>
    </div>
    <div v-else>
      <div
        v-for="agentData in currentAgentConversations"
        :key="agentData.agent.id"
        class="mb-6"
      >
        <!-- Agent Header -->
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
          <img
            class="w-10 h-10 rounded-full"
            :src="
              agentData.agent.avatar_url ||
              `https://ui-avatars.com/api/?name=${agentData.agent.name}&background=random`
            "
            :alt="agentData.agent.name"
          />
          <div class="flex-1">
            <div class="font-medium text-gray-900">
              {{ agentData.agent.name }}
            </div>
            <div class="text-xs text-gray-400">
              Chanel: {{ agentData.chanel?.name || "-" }}<br />
              Kontak:
              {{
                agentData.contact?.name ||
                agentData.contact?.phone_number ||
                "-"
              }}
            </div>
            <div class="text-sm text-gray-500">
              {{ agentData.totalMessages }} pesan
            </div>
          </div>
        </div>

        <!-- Conversations for this agent -->
        <div
          v-for="conversation in agentData.conversations"
          :key="conversation.id"
          @click="selectConversation(conversation)"
          :class="[
            'flex items-center gap-4 p-4 rounded-lg cursor-pointer mb-2 transition ml-4',
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
  </div>
</template>
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useConversationStore } from "~/composables/useConversationStore";
import { onClickOutside } from "@vueuse/core";

const emit = defineEmits(["select-conversation"]);
const props = defineProps({
  selectedConversation: Object,
  activeTab: String,
});

const {
  loading,
  error,
  fetchAIAgentConversations,
  fetchHumanAgentConversations,
} = useConversationStore();

const aiAgentConversations = ref([]);
const humanAgentConversations = ref([]);
const currentAgentConversations = computed(() => {
  return props.activeTab === "ai"
    ? aiAgentConversations.value
    : humanAgentConversations.value;
});

const getConversationName = (conversation) => {
  if (conversation.contact_name) {
    return conversation.contact_name;
  }
  return conversation.contact_phone || "Unknown Contact";
};

const getConversationAvatar = (conversation) => {
  if (conversation.contact_avatar) {
    return conversation.contact_avatar;
  }
  return `https://ui-avatars.com/api/?name=${getConversationName(
    conversation
  )}&background=random`;
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

// Load agent conversations based on active tab
onMounted(async () => {
  await loadAgentConversations();
});

// Watch for activeTab changes
watch(
  () => props.activeTab,
  async (newTab) => {
    await loadAgentConversations();
  }
);

// Function to load appropriate agent conversations
const loadAgentConversations = async () => {
  if (props.activeTab === "ai") {
    try {
      const result = await fetchAIAgentConversations();
      aiAgentConversations.value = result;
    } catch (err) {
      console.error("Error loading AI agent conversations:", err);
    }
  } else if (props.activeTab === "human") {
    try {
      const result = await fetchHumanAgentConversations();
      humanAgentConversations.value = result;
    } catch (err) {
      console.error("Error loading Human agent conversations:", err);
    }
  }
};
</script>
