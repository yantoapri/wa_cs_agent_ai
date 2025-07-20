<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <div
      class="flex items-center justify-between bg-white border-b border-gray-200 px-8 h-16"
    >
      <div class="flex items-center">
        <div class="text-lg font-bold text-gray-800 mr-8">OsmoChat</div>
        <div class="flex gap-1">
          <button
            v-for="t in tabs"
            :key="t.value"
            class="px-6 py-2 text-base font-medium rounded-t-md border-b-2 transition-colors duration-200 focus:outline-none"
            :class="
              tab === t.value
                ? 'text-blue-600 border-blue-600 bg-white'
                : 'text-gray-700 border-transparent bg-gray-100 hover:bg-gray-200'
            "
            @click="tab = t.value"
          >
            {{ t.label }}
          </button>
        </div>
      </div>

      <!-- User Profile Section -->
      <div class="flex items-center gap-3 relative" ref="userMenuRef">
        <button
          @click="toggleDropdown"
          class="flex items-center gap-2 focus:outline-none"
        >
          <img
            :src="userAvatar"
            :alt="userName"
            class="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
          />
          <span class="text-sm font-medium text-gray-700">{{ userName }}</span>
          <svg
            class="w-4 h-4 ml-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          v-if="dropdownOpen"
          class="fixed right-8 top-16 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        >
          <button
            class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            @click="closeDropdown"
          >
            My Profile
          </button>
          <button
            class="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
    <div class="flex flex-1 min-h-0">
      <template v-if="tab === 'inbox'">
        <div class="flex flex-1 min-h-0">
          <div
            class="w-80 bg-white border-r border-gray-200 py-6 flex flex-col items-stretch overflow-y-auto"
          >
            <div class="flex gap-2 mb-4">
              <button
                class="flex-1 py-2 text-base font-medium rounded-t border-b-2 border-transparent text-gray-700 hover:bg-gray-100 hover:text-blue-600 hover:border-blue-600 transition-colors duration-200"
                :class="
                  agentTab === 'ai'
                    ? 'text-blue-600 border-blue-600 bg-white'
                    : ''
                "
                @click="agentTab = 'ai'"
              >
                Agent AI
              </button>
              <button
                class="flex-1 py-2 text-base font-medium rounded-t border-b-2 border-transparent text-gray-700 hover:bg-gray-100 hover:text-blue-600 hover:border-blue-600 transition-colors duration-200"
                :class="
                  agentTab === 'manusia'
                    ? 'text-blue-600 border-blue-600 bg-white'
                    : ''
                "
                @click="agentTab = 'manusia'"
              >
                Agent Manusia
              </button>
            </div>
            <div class="flex-1 min-h-0">
              <InboxList
                :active-tab="agentTab"
                :selected-conversation="selectedConversation"
                @select-conversation="onSelectConversation"
              />
            </div>
          </div>
          <div class="flex-1 flex flex-col bg-gray-100">
            <InboxMain :selected-conversation="selectedConversation" />
          </div>
        </div>
      </template>
      <template v-else-if="tab === 'agent-ai'">
        <div class="flex flex-1 min-h-0">
          <div class="flex-1 flex flex-col bg-gray-100">
            <AgentAIMain :selected-agent="selectedAgent" />
          </div>
        </div>
      </template>
      <template v-else-if="tab === 'agent-manusia'">
        <div class="flex flex-1 min-h-0">
          <div
            class="w-80 bg-white border-r border-gray-200 py-6 flex flex-col items-stretch overflow-y-auto"
          >
            <AgentManusiaList
              ref="agentManusiaListRef"
              @select-agent="onSelectAgent"
              @add-agent="onAddAgent"
            />
          </div>
          <div class="flex-1 flex flex-col bg-gray-100">
            <AgentManusiaMain
              :selected-agent="selectedAgent"
              @refresh-list="onRefreshAgentManusiaList"
              @clear-selected="onClearSelectedAgent"
            />
          </div>
        </div>
      </template>
      <template v-else-if="tab === 'chanel'">
        <div class="flex flex-1 min-h-0">
          <div
            class="w-80 bg-white border-r border-gray-200 py-6 flex flex-col items-stretch overflow-y-auto"
          >
            <ChanelList ref="chanelListRef" @select-chanel="onSelectchanel" />
          </div>
          <div class="flex-1 flex flex-col bg-gray-100">
            <ChanelMain
              :chanel="selectedchanel"
              @update-whatsapp-number="onUpdateWhatsAppNumber"
            />
          </div>
        </div>
      </template>
      <template v-else-if="tab === 'kontak'">
        <div class="flex flex-1 min-h-0">
          <div
            class="w-80 bg-white border-r border-gray-200 py-6 flex flex-col items-stretch overflow-y-auto"
          >
            <KontakList @select-contact="onSelectContact" />
          </div>
          <div class="flex-1 flex flex-col bg-gray-100">
            <KontakMain :selected-contact="selectedContact" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: "auth" });
import { ref, computed } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useSupabaseUser, useSupabaseClient } from "#imports";
import { useRouter } from "vue-router";
import InboxList from "~/components/InboxList.vue";
import KontakList from "~/components/KontakList.vue";
import ChanelList from "~/components/ChanelList.vue";
import AgentAIList from "~/components/AgentAIList.vue";
import AgentManusiaList from "~/components/AgentManusiaList.vue";
import InboxMain from "~/components/InboxMain.vue";
import KontakMain from "~/components/KontakMain.vue";
import ChanelMain from "~/components/ChanelMain.vue";
import AgentAIMain from "~/components/AgentAIMain.vue";
import AgentManusiaMain from "~/components/AgentManusiaMain.vue";

const tabs = [
  { value: "inbox", label: "Inbox" },
  { value: "kontak", label: "Kontak" },
  { value: "chanel", label: "chanel" },
  { value: "agent-ai", label: "Agent AI" },
  { value: "agent-manusia", label: "Agent Manusia" },
];
const runtimeConfig = useRuntimeConfig();
const tab = ref("inbox");
const agentTab = ref("ai");
const selectedConversation = ref(null);
const selectedAgent = ref(null);
const selectedchanel = ref(null);
const selectedContact = ref(null);
const chanelListRef = ref(null);
const agentAIListRef = ref(null);
const agentManusiaListRef = ref(null);

// User authentication
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const router = useRouter();
const logoutLoading = ref(false);

// Computed properties for user info
const userName = computed(() => {
  if (!user.value) return "User";
  return (
    user.value.user_metadata?.name || user.value.email?.split("@")[0] || "User"
  );
});

const userAvatar = computed(() => {
  if (!user.value)
    return "https://ui-avatars.com/api/?name=User&background=random";
  return (
    user.value.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${userName.value}&background=random`
  );
});

// Logout function
const handleLogout = async () => {
  logoutLoading.value = true;
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    } else {
      await router.push("/login");
    }
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    logoutLoading.value = false;
  }
};

function onSelectConversation(conversation) {
  selectedConversation.value = conversation;
}

function onSelectAgent(agent) {
  selectedAgent.value = agent;
}

function onAddAgent() {
  selectedAgent.value = {};
}

function onSelectchanel(chanel) {
  selectedchanel.value = chanel;
}

function onSelectContact(contact) {
  selectedContact.value = contact;
}

function onUpdateWhatsAppNumber(chanelId, whatsappNumber) {
  if (chanelListRef.value) {
    chanelListRef.value.updatechanelWhatsAppNumber(chanelId, whatsappNumber);
  }
}

function onRefreshAgentManusiaList() {
  console.log("Parent: Refreshing agent manusia list...");
  if (agentManusiaListRef.value) {
    agentManusiaListRef.value.refreshList();
  } else {
    console.error("Parent: agentManusiaListRef is null");
  }
}

function onClearSelectedAgent() {
  selectedAgent.value = null;
}

const dropdownOpen = ref(false);
const userMenuRef = ref(null);

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
}

function closeDropdown() {
  dropdownOpen.value = false;
}

onClickOutside(userMenuRef, closeDropdown);

onMounted(async () => {
  console.log("env import", import.meta.env);
  console.log("env runtimeConfig", runtimeConfig);
});
</script>
