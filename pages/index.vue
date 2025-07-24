<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <div
      class="flex items-center justify-between bg-white border-b border-gray-200 px-8 h-16"
    >
      <div class="flex items-center">
        <div class="text-lg font-bold text-gray-800 mr-8">
          <img src="/assets/img/nutra.png" class="h-8 w-[80px]" />
        </div>
        <div class="gap-1 items-center hidden md:flex">
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
      <div class="hidden md:flex items-center gap-3 relative" ref="userMenuRef">
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
            @click="goToDoc"
          >
            Doc
          </button>
          <button
            class="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
      <!-- Hamburger (mobile only) -->
      <button
        class="md:hidden p-2 ml-2"
        @click="showSidebar = true"
        aria-label="Open menu"
      >
        <svg
          class="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>

    <!-- SIDEBAR (mobile only) -->
    <transition name="fade">
      <div v-if="showSidebar" class="fixed inset-0 z-50 flex md:hidden">
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-black bg-opacity-30"
          @click="showSidebar = false"
        ></div>
        <!-- Sidebar -->
        <aside
          class="relative w-64 max-w-full bg-blue-50 h-full shadow-lg z-50 p-6"
        >
          <!-- User Profile Section (mobile only) -->
          <div class="flex flex-col items-center gap-2 mb-8">
            <button
              @click="toggleDropdown"
              class="flex flex-col items-center gap-1 focus:outline-none"
            >
              <img
                :src="userAvatar"
                :alt="userName"
                class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
              <span class="text-base font-medium text-gray-700">{{
                userName
              }}</span>
              <svg
                class="w-4 h-4 text-gray-500"
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
              class="absolute left-6 top-24 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            >
              <button
                class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                @click="goToDoc"
              >
                Doc
              </button>
              <button
                class="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                @click="handleLogout"
              >
                Logout
              </button>
            </div>
          </div>

          <!-- Menu List -->
          <nav class="flex flex-col gap-4">
            <button
              v-for="t in tabs"
              :key="t.value"
              class="flex items-center gap-3 text-lg py-2 px-2 rounded hover:bg-blue-100"
              :class="
                tab === t.value ? 'font-bold text-blue-600' : 'text-gray-700'
              "
              @click="
                tab = t.value;
                showSidebar = false;
              "
            >
              <!-- Icon placeholder, bisa diganti sesuai kebutuhan -->
              <span>{{ t.label }}</span>
            </button>
          </nav>
        </aside>
      </div>
    </transition>
    <div class="flex flex-1 min-h-0 pb-14 md:pb-0">
      <!-- INBOX -->
      <template v-if="tab === 'inbox'">
        <!-- MOBILE: hanya salah satu yang tampil -->
        <template v-if="!isDesktop">
          <div
            v-if="!selectedConversation"
            class="w-full bg-white flex flex-col items-stretch overflow-y-auto"
          >
            <InboxList
              v-model:activeTab="agentTab"
              @update:activeTab="
                (val) => {
                  console.log('parent menerima update:activeTab', val);
                  agentTab = val;
                }
              "
              :selected-conversation="selectedConversation"
              @select-conversation="onSelectConversation"
            />
          </div>
          <div v-else class="w-full flex flex-col bg-gray-100">
            <InboxMain
              :selected-conversation="selectedConversation"
              @back="selectedConversation = null"
            />
          </div>
        </template>
        <!-- DESKTOP: tampil berdampingan -->
        <template v-else>
          <div
            class="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col items-stretch overflow-y-auto md:block"
          >
            <div class="flex-1 min-h-0">
              <InboxList
                v-model:activeTab="agentTab"
                @update:activeTab="
                  (val) => {
                    console.log(
                      'parent (desktop) menerima update:activeTab',
                      val
                    );
                    agentTab = val;
                  }
                "
                :selected-conversation="selectedConversation"
                @select-conversation="onSelectConversation"
              />
            </div>
          </div>
          <div class="flex-1 flex flex-col bg-gray-100 w-full">
            <InboxMain :selected-conversation="selectedConversation" />
          </div>
        </template>
      </template>
      <template v-else-if="tab === 'my-profile'">
        <div
          class="flex flex-1 min-h-0 justify-center items-center bg-gray-100"
        >
          <MyProfile />
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
        <!-- MOBILE: hanya salah satu yang tampil -->
        <template v-if="!isDesktop">
          <div
            v-if="!selectedAgent"
            class="w-full bg-white flex flex-col items-stretch overflow-y-auto"
          >
            <AgentManusiaList
              ref="agentManusiaListRef"
              :selected-agent="selectedAgent"
              @select-agent="onSelectAgent"
              @add-agent="onAddAgent"
            />
          </div>
          <div v-else class="w-full flex flex-col bg-gray-100">
            <AgentManusiaMain
              :selected-agent="selectedAgent"
              @refresh-list="onRefreshAgentManusiaList"
              @clear-selected="onClearSelectedAgent"
              @back="selectedAgent = null"
            />
          </div>
        </template>
        <!-- DESKTOP: tampil berdampingan -->
        <template v-else>
          <div
            class="w-80 bg-white border-r border-gray-200 py-6 flex flex-col items-stretch overflow-y-auto"
          >
            <AgentManusiaList
              ref="agentManusiaListRef"
              :selected-agent="selectedAgent"
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
        </template>
      </template>
      <template v-else-if="tab === 'chanel'">
        <!-- MOBILE: hanya salah satu yang tampil -->
        <template v-if="!isDesktop">
          <div
            v-if="!selectedchanel"
            class="w-full bg-white flex flex-col items-stretch overflow-y-auto"
          >
            <ChanelList ref="chanelListRef" @select-chanel="onSelectchanel" />
          </div>
          <div v-else class="w-full flex flex-col bg-gray-100">
            <ChanelMain
              :chanel="selectedchanel"
              @update-whatsapp-number="onUpdateWhatsAppNumber"
              @back="selectedchanel = null"
            />
          </div>
        </template>
        <!-- DESKTOP: tampil berdampingan -->
        <template v-else>
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
        </template>
      </template>
      <template v-else-if="tab === 'kontak'">
        <!-- MOBILE: hanya salah satu yang tampil -->
        <template v-if="!isDesktop">
          <div
            v-if="!selectedContact"
            class="w-full bg-white flex flex-col items-stretch overflow-y-auto"
          >
            <KontakList @select-contact="onSelectContact" />
          </div>
          <div v-else class="w-full flex flex-col bg-gray-100">
            <KontakMain
              :selected-contact="selectedContact"
              @back="selectedContact = null"
            />
          </div>
        </template>
        <!-- DESKTOP: tampil berdampingan -->
        <template v-else>
          <div
            class="w-80 bg-white border-r border-gray-200 py-6 flex flex-col items-stretch overflow-y-auto"
          >
            <KontakList @select-contact="onSelectContact" />
          </div>
          <div class="flex-1 flex flex-col bg-gray-100">
            <KontakMain :selected-contact="selectedContact" />
          </div>
        </template>
      </template>
    </div>
    <!-- More Tabs Modal -->
    <transition name="fade">
      <div v-if="showMoreTabs" class="fixed inset-0 z-50 flex flex-col">
        <div
          class="flex-1 bg-black bg-opacity-30"
          @click="showMoreTabs = false"
        ></div>
        <div class="bg-white p-4 border-t">
          <button
            v-for="t in moreTabs"
            :key="t.value"
            class="block w-full text-left px-4 py-3 text-base border-b last:border-b-0"
            :class="
              tab === t.value ? 'text-blue-600 font-bold' : 'text-gray-700'
            "
            @click="
              tab = t.value;
              showMoreTabs = false;
            "
          >
            {{ t.label }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
definePageMeta({ middleware: "auth" });
import { ref, computed, onMounted, watch } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useSupabaseUser, useSupabaseClient } from "#imports";
import { useRouter } from "vue-router";
import InboxList from "~/components/InboxList.vue";
import KontakList from "~/components/KontakList.vue";
import ChanelList from "~/components/ChanelList.vue";
import AgentManusiaList from "~/components/AgentManusiaList.vue";
import InboxMain from "~/components/InboxMain.vue";
import KontakMain from "~/components/KontakMain.vue";
import ChanelMain from "~/components/ChanelMain.vue";
import AgentAIMain from "~/components/AgentAIMain.vue";
import AgentManusiaMain from "~/components/AgentManusiaMain.vue";
import MyProfile from "~/components/MyProfile.vue";

const tabs = [
  { value: "inbox", label: "Inbox" },
  { value: "kontak", label: "Kontak" },
  { value: "chanel", label: "Chanel" },
  { value: "agent-ai", label: "Agent AI" },
  { value: "agent-manusia", label: "Agent Manusia" },
  { value: "my-profile", label: "My Profile" },
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

function goToProfile() {
  closeDropdown();
  router.push("/my-profile");
}

function goToDoc() {
  closeDropdown();
  window.open("/doc", "_blank");
}

onClickOutside(userMenuRef, closeDropdown);

const showSidebar = ref(false);
const showMainSidebar = ref(false);
const showMoreTabs = ref(false);
const maxTabs = 4;
const visibleTabs = computed(() => tabs.slice(0, maxTabs));
const moreTabs = computed(() => tabs.slice(maxTabs));
const hasMoreTabs = computed(() => tabs.length > maxTabs);

const isDesktop = ref(false);
function checkDesktop() {
  isDesktop.value = window.innerWidth >= 768;
}
onMounted(() => {
  checkDesktop();
  window.addEventListener("resize", checkDesktop);
});

watch(agentTab, (val) => {
  console.log("agentTab berubah:", val);
});
</script>
