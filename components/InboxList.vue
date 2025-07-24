<template>
  <div>
    <!-- Tab Switcher Agent AI / Agent Manusia -->
    <div
      class="grid grid-cols-2 gap-0 mb-4 overflow-hidden border border-gray-200"
    >
      <button
        :class="[
          'py-2 font-semibold transition-colors',
          activeTab === 'ai'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        ]"
        @click="
          () => {
            console.log('emit update:activeTab ai');
            $emit('update:activeTab', 'ai');
          }
        "
      >
        Agent AI
      </button>
      <button
        :class="[
          'py-2 font-semibold transition-colors',
          activeTab === 'manusia'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        ]"
        @click="
          () => {
            console.log('emit update:activeTab manusia');
            $emit('update:activeTab', 'manusia');
          }
        "
      >
        Agent Manusia
      </button>
    </div>
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
        v-for="(agentData, index) in currentAgentConversations"
        :key="
          agentData.agent?.id +
          '-' +
          agentData.contact?.id +
          '-' +
          agentData.chanel?.id +
          '-' +
          index
        "
        class="cursor-pointer"
      >
        <div
          class="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg border-b border-gray-100"
          @click="handleAgentHeaderClick(agentData)"
        >
          <img
            class="w-12 h-12 rounded-full object-cover"
            :src="
              agentData.agent.avatar_url ||
              `https://ui-avatars.com/api/?name=${agentData.agent.name}&background=random`
            "
            :alt="agentData.agent.name"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-base text-gray-900 truncate">{{
                agentData.agent.name || "-"
              }}</span>
              <div class="flex flex-col items-end ml-2">
                <span
                  class="text-xs text-green-600 font-medium whitespace-nowrap"
                  >{{ formatTimeOrDate(agentData.lastActivity) }}</span
                >
                <span class="text-xs text-gray-500 mt-1"
                  >{{ agentData.totalMessages }} pesan</span
                >
              </div>
            </div>
            <div class="text-xs text-gray-400 truncate">
              {{
                agentData.contact?.name ||
                agentData.contact?.phone_number ||
                "-"
              }}<span v-if="agentData.chanel?.name">
                • {{ agentData.chanel.name }}</span
              >
            </div>
            <div class="text-sm text-gray-500 truncate">
              {{ agentData.lastMessage || "—" }}
            </div>
          </div>
          <div v-if="agentData.unreadCount > 0" class="ml-2 flex-shrink-0">
            <span
              class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-sm font-bold"
              >{{ agentData.unreadCount }}</span
            >
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

const emit = defineEmits(["select-conversation", "update:activeTab"]);
const props = defineProps({
  selectedConversation: Object,
  activeTab: String,
});

const {
  loading,
  error,
  fetchAIAgentConversations,
  fetchHumanAgentConversations,
  messages,
} = useConversationStore();

const aiAgentConversations = ref([]);
const humanAgentConversations = ref([]);
const currentAgentConversations = computed(() => {
  const rawResult =
    props.activeTab === "ai"
      ? aiAgentConversations.value
      : humanAgentConversations.value;

  // Additional deduplication at UI level to ensure no duplicates
  if (rawResult && rawResult.length > 0) {
    const seen = new Set();
    const duplicates = [];
    const uniqueKeys = new Set();
    const deduplicatedResult = [];

    rawResult.forEach((item, index) => {
      const key = `${item.agent?.id}-${item.contact?.id}-${item.chanel?.id}`;
      uniqueKeys.add(key);

      if (seen.has(key)) {
        duplicates.push({
          index,
          key,
          item: {
            agent_name: item.agent?.name,
            contact_name: item.contact?.name || item.contact?.phone_number,
            chanel_name: item.chanel?.name,
            totalMessages: item.totalMessages,
          },
        });
        console.warn(
          `[InboxList] Duplicate found at index ${index}, skipping:`,
          key
        );
      } else {
        seen.add(key);
        deduplicatedResult.push(item);
        console.log(`[InboxList] Added unique item at index ${index}:`, key);
      }
    });

    // CATATAN: Agar lastMessage selalu muncul, pastikan fetchAIAgentConversations/fetchHumanAgentConversations mengisi field lastMessage pada setiap item.
    return deduplicatedResult;
  }

  return rawResult || [];
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
  console.log("[InboxList] Loading conversations for tab:", props.activeTab);

  if (props.activeTab === "ai") {
    try {
      console.log("[InboxList] Fetching AI agent conversations...");
      const result = await fetchAIAgentConversations();
      console.log("[InboxList] AI Agent conversations result:", result);
      console.log("[InboxList] AI result length:", result?.length);
      if (result && result.length > 0) {
        console.log("[InboxList] First AI conversation:", {
          agent_name: result[0].agent?.name,
          contact_name: result[0].contact?.name,
          chanel_name: result[0].chanel?.name,
          totalMessages: result[0].totalMessages,
        });
      }
      aiAgentConversations.value = result;
    } catch (err) {
      console.error("Error loading AI agent conversations:", err);
    }
  } else if (props.activeTab === "manusia") {
    // Perbaiki: ganti "human" menjadi "manusia"
    try {
      console.log("[InboxList] [DEBUG] Fetching Human agent conversations...");
      const result = await fetchHumanAgentConversations();
      console.log(
        "[InboxList] [DEBUG] Human Agent conversations result:",
        result
      );
      console.log("[InboxList] [DEBUG] Human result length:", result?.length);
      if (result && result.length > 0) {
        console.log("[InboxList] [DEBUG] First Human conversation:", {
          agent_name: result[0].agent?.name,
          contact_name: result[0].contact?.name,
          chanel_name: result[0].chanel?.name,
          totalMessages: result[0].totalMessages,
        });
      }
      humanAgentConversations.value = result;
    } catch (err) {
      console.error(
        "[InboxList] [DEBUG] Error loading Human agent conversations:",
        err
      );
    }
  }
};

// Tambahkan fungsi formatTimeOrDate
function formatTimeOrDate(ts) {
  if (!ts) return "";
  const date = new Date(ts);
  const now = new Date();
  const diff = now - date;
  if (diff < 1000 * 60 * 60 * 24) {
    // < 1 hari
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diff < 1000 * 60 * 60 * 48) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  }
}
</script>
