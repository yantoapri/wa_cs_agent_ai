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
        :key="
          agentData.agent.id +
          '-' +
          agentData.contact?.id +
          '-' +
          agentData.chanel?.id
        "
        class="mb-6 cursor-pointer"
      >
        <!-- Agent Header (klik untuk pilih percakapan) -->
        <div
          class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3 cursor-pointer"
          @click="handleAgentHeaderClick(agentData)"
        >
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

const selectConversationWithContext = (conversation, agentData) => {
  console.log("[InboxList] Clicked conversation:", conversation, agentData);
  emit("select-conversation", {
    ...conversation,
    agent: agentData.agent,
    contact: agentData.contact,
    chanel: agentData.chanel,
  });
};

const handleAgentHeaderClick = (agentData) => {
  emit("select-conversation", {
    agent: agentData.agent,
    contact: agentData.contact,
    chanel: agentData.chanel,
  });
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
