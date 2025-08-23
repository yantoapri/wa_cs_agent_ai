<template>
  <div class="flex flex-col h-[100vh] w-full max-w-full overflow-hidden bg-white">
    <!-- Tab Switcher Agent AI / Agent Manusia -->
    <div
      class="grid grid-cols-2 gap-0 mb-2 sm:mb-4 overflow-hidden border border-gray-200 rounded-lg mx-2 sm:mx-0 bg-white flex-shrink-0"
    >
      <button
        :class="[
          'py-3 px-3 text-xs sm:text-sm md:text-base font-semibold transition-colors rounded-none',
          activeTab === 'ai'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        ]"
        @click="
          () => {
            $emit('update:activeTab', 'ai');
          }
        "
      >
        Agent AI
      </button>
      <button
        :class="[
          'py-3 px-3 text-xs sm:text-sm md:text-base font-semibold transition-colors rounded-none',
          activeTab === 'manusia'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        ]"
        @click="
          () => {
            $emit('update:activeTab', 'manusia');
          }
        "
      >
        Agent Manusia
      </button>
    </div>
    <div
      v-if="loading"
      class="text-center py-4 sm:py-8 flex-1 flex items-center justify-center"
    >
      <div class="text-gray-500 text-sm sm:text-base">Loading inbox...</div>
    </div>
    <div
      v-else-if="currentAgentConversations.length === 0"
      class="text-center py-4 sm:py-8 flex-1 flex items-center justify-center"
    >
      <div class="text-gray-500 text-sm sm:text-base px-4">
        {{
          activeTab === "ai"
            ? "Belum ada percakapan AI Agent"
            : "Belum ada percakapan Human Agent"
        }}
      </div>
    </div>
    <div v-else class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 sm:px-0 w-full">
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
        class="cursor-pointer w-full max-w-full"
      >
        <div
          class="flex items-center gap-2 sm:gap-3 px-2 py-3 sm:py-3 rounded-lg border-b border-gray-100 transition-all duration-200 border border-transparent hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm sm:hover:shadow-md hover:scale-[1.01] sm:hover:scale-[1.02] mx-1 sm:mx-0 w-full max-w-full overflow-hidden min-w-0"
          @click="handleAgentHeaderClick(agentData)"
        >
          <img
            class="w-12 h-12 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
            :src="
              agentData.agent.avatar_url ||
              `https://ui-avatars.com/api/?name=${agentData.agent.name}&background=random`
            "
            :alt="agentData.agent.name"
          />
          <div class="flex-1 min-w-0 overflow-hidden w-full">
            <div class="flex items-center justify-between mb-1 w-full">
              <span class="font-semibold text-sm sm:text-base text-gray-900 truncate max-w-[50%] flex-shrink-1">{{
                agentData.agent.name || "-"
              }}</span>
              <div class="flex flex-col items-end text-right flex-shrink-0 min-w-[70px] max-w-[80px]">
                <span class="text-xs text-green-600 font-medium whitespace-nowrap truncate">{{ formatTimeOrDate(agentData.lastActivity) }}</span>
                <span class="text-xs text-gray-500 whitespace-nowrap truncate">{{ agentData.totalMessages }} pesan</span>
              </div>
            </div>
            <div class="text-xs text-gray-400 truncate">
              <span class="inline-block max-w-[70%] truncate">{{
                agentData.contact?.name ||
                agentData.contact?.phone_number ||
                "-"
              }}</span><span v-if="agentData.chanel?.name" class="hidden sm:inline">
                • {{ agentData.chanel.name }}</span
              >
            </div>
            <div class="text-xs text-gray-500 truncate leading-tight">
              <span class="inline-block max-w-full truncate">{{ 
                agentData.lastMessage ? 
                  (agentData.lastMessage.length > 40 ? agentData.lastMessage.slice(0, 40) + '...' : agentData.lastMessage) : 
                  "—" 
              }}</span>
            </div>
          </div>
          <div v-if="agentData.unreadCount > 0" class="ml-2 flex-shrink-0">
            <span
              class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold min-w-[24px]"
              >{{ agentData.unreadCount > 99 ? '99+' : agentData.unreadCount }}</span
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
import { useRouter } from 'vue-router'
import { useSupabaseUser, useSupabaseClient } from "#imports";

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter();

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

      } else {
        seen.add(key);
        deduplicatedResult.push(item);
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  }
};

const selectConversation = (conversation) => {
  emit("select-conversation", conversation);
};

const handleAgentHeaderClick = (agentData) => {
  emit("select-conversation", {
    agent: agentData.agent,
    contact: agentData.contact,
    chanel: agentData.chanel,
  });
};

const checkExpired=async () => {
  
  const {data:userData}=await supabase
    .from("users")
    .select("end_at")
    .eq("auth_id", user.value.id)
    .single();
  if(new Date().getTime()>=new Date(userData.end_at).getTime()){
    router.push("/views/dashboard")
  }
};
// Load agent conversations based on active tab
onMounted(async () => {
  checkExpired()
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
      if (result && result.length > 0) {
      }
      aiAgentConversations.value = result;
    } catch (err) {
      console.error("Error loading AI agent conversations:", err);
    }
  } else if (props.activeTab === "manusia") {
    // Perbaiki: ganti "human" menjadi "manusia"
    try {
      const result = await fetchHumanAgentConversations();
      if (result && result.length > 0) {
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  }
}
</script>

<style scoped>
/* Mobile-first responsive design */
@media (max-width: 640px) {
  .cursor-pointer {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Ensure proper text wrapping on mobile */
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
}

/* Smooth transitions for better mobile experience */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Better touch targets for mobile */
@media (max-width: 640px) {
  .cursor-pointer {
    min-height: 60px;
  }
}
</style>