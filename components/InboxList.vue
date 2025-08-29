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
      <div class="text-gray-500 text-sm sm:text-base">Memuat inbox...</div>
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
         
          <div
            class="w-12 h-12 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-blue-200 text-blue-800 font-bold text-lg sm:text-xl flex-shrink-0 select-none"
          >
            {{ agentData.contact_name?.substring(0,2)||agentData.contact_phone_number?.substring(0,2)  }}
          </div>
          <div class="flex-1 min-w-0 overflow-hidden w-full">
            <div class="flex items-center justify-between mb-1 w-full">
              <span class="font-semibold text-sm sm:text-base text-gray-900 truncate max-w-[50%] flex-shrink-1">{{
                agentData.contact_name || "-"
              }}</span>
              <div class="flex flex-col items-end text-right flex-shrink-0 min-w-[70px] max-w-[80px]">
                <span class="text-xs text-green-600 font-medium whitespace-nowrap truncate">{{ formatTimeOrDate(agentData.lastActivity) }}</span>
                <span class="text-xs text-gray-500 whitespace-nowrap truncate">{{ agentData.totalMessages }} pesan</span>
              </div>
            </div>
            <div class="text-xs text-gray-400 truncate">
                <span class="max-w-[70%] mr-2 flex items-center gap-1">
                  <svg v-if="agentData.agent_type === 'ai'" xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="4" y="4" width="16" height="16" rx="4" stroke-width="2"/>
                    <circle cx="9" cy="10" r="1" fill="currentColor"/>
                    <circle cx="15" cy="10" r="1" fill="currentColor"/>
                    <rect x="8" y="14" width="8" height="2" rx="1" fill="currentColor"/>
                  </svg>
                  <svg v-else-if="agentData.agent_type === 'manusia'" xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 15c0-1.104.896-2 2-2h4c1.104 0 2 .896 2 2v1H8v-1zm4-7a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                  </svg>
                  {{ agentData.agent_name }}
                </span>

                <span v-if="agentData.chanel_name" class="hidden sm:inline flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.5 17.5a16 16 0 0 1 19 0M6 13a10 10 0 0 1 12 0M9.5 9.5a4 4 0 0 1 5 0"/>
                    <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
                  </svg>
                  {{ agentData.chanel_name }}
                </span>
            </div>
            <div class="text-xs text-gray-500 truncate leading-tight">
              <span class="inline-block max-w-full truncate">{{ 
                agentData.content ? 
                  (agentData.content.length > 40 ? agentData.content.slice(0, 40) + '...' : agentData.lastMessage) : 
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
  // Map agent, contact, chanel as objects for InboxMain.vue compatibility
  const agent = agentData.agent || {
    id: agentData.agent_id,
    name: agentData.agent_name,
    type: agentData.agent_type
  };
  const contact = agentData.contact || {
    id: agentData.contact_id,
    name: agentData.contact_name,
    phone_number: agentData.contact_phone_number
  };
  const chanel = agentData.chanel || {
    id: agentData.chanel_id,
    name: agentData.chanel_name
  };
  emit("select-conversation", {
    agent,
    contact,
    chanel
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
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diff < 1000 * 60 * 60 * 48) {
    return "Kemarin";
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