<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Desktop Sidebar -->
    <div
      class="hidden md:flex md:flex-col md:w-16 md:bg-white md:border-r md:border-gray-200"
    >
      <!-- Logo -->
      <div
        class="flex items-center justify-center h-16 border-b border-gray-200"
      >
        <img src="/assets/img/nutra.png" class="h-8 w-8" />
      </div>

      <!-- Navigation Icons -->
      <nav class="flex-1 flex flex-col items-center py-4 space-y-2">
        <div v-for="t in tabs" :key="t.value" class="relative group">
          <NuxtLink
            :to="`/views/${t.value}`"
            class="w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none"
            :class="
              currentTab === t.value
                ? 'text-blue-600 bg-blue-50 border border-blue-200'
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border hover:border-blue-200'
            "
          >
            <span v-html="t.icon"></span>
          </NuxtLink>

          <!-- Tooltip -->
          <div
            class="absolute left-full ml-2 px-3 py-2 bg-blue-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 top-1/2 transform -translate-y-1/2"
          >
            {{ t.label }}
          </div>
        </div>
      </nav>

      <!-- User Profile Section -->
      <div class="border-t border-gray-200 p-4">
        <div class="relative flex justify-center">
          <button
            @click="toggleDropdown"
            class="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-50 focus:outline-none"
          >
            <img
              :src="userAvatar"
              :alt="userName"
              class="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
            />
          </button>

          <!-- User Dropdown -->
          <div
            v-if="dropdownOpen"
            class="absolute left-full ml-2 top-0 w-40 border border-gray-200 rounded-lg shadow-lg z-50 bg-white"
          >
            <button
              class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
              @click="goToDoc"
            >
              Doc
            </button>
            <button
              class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
              @click="handleLogout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex flex-1 min-h-0 flex-col">
      <!-- Mobile Header -->
      <div
        class="md:hidden flex items-center justify-between border-b border-gray-200 px-4 h-16 bg-white"
      >
        <div class="flex items-center">
          <div class="text-lg font-bold text-gray-800 mr-4">
            <img src="/assets/img/nutra.png" class="h-8 w-[80px]" />
          </div>
        </div>

        <!-- Mobile User Profile -->
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
            <span class="text-sm font-medium text-gray-700">{{
              userName
            }}</span>
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
            class="absolute right-0 top-12 w-40 border border-gray-200 rounded-lg shadow-lg z-50 bg-white"
          >
            <button
              class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
              @click="goToDoc"
            >
              Doc
            </button>
            <button
              class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
              @click="handleLogout"
            >
              Logout
            </button>
          </div>
        </div>

        <!-- Hamburger (mobile only) -->
        <button
          class="p-2 ml-2"
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
            class="fixed inset-0 bg-black bg-opacity-50"
            @click="showSidebar = false"
          ></div>
          <!-- Sidebar -->
          <aside
            class="relative w-64 max-w-full h-full shadow-xl z-50 p-6 bg-white border-r border-gray-200"
          >
            <!-- Close Button -->
            <div class="flex justify-end mb-6">
              <button
                @click="showSidebar = false"
                class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <svg
                  class="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

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
                class="absolute left-6 top-24 w-40 border border-gray-200 rounded-lg shadow-lg z-50 bg-white"
              >
                <button
                  class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                  @click="goToDoc"
                >
                  Doc
                </button>
                <button
                  class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
                  @click="handleLogout"
                >
                  Logout
                </button>
              </div>
            </div>

            <!-- Menu List -->
            <nav class="flex flex-col gap-4">
              <NuxtLink
                v-for="t in tabs"
                :key="t.value"
                :to="`/views/${t.value}`"
                class="flex items-center gap-3 text-lg py-3 px-3 rounded-lg transition-colors"
                :class="
                  currentTab === t.value
                    ? 'font-bold text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-50'
                "
                @click="showSidebar = false"
              >
                <span v-html="t.icon"></span>
                <span>{{ t.label }}</span>
              </NuxtLink>
            </nav>
          </aside>
        </div>
      </transition>

      <!-- Content Area -->
      <div class="flex-1 min-h-0">
        <!-- DASHBOARD -->
        <template v-if="currentTab === 'dashboard'">
          <DashboardMain />
        </template>

        <!-- INBOX -->
        <template v-else-if="currentTab === 'inbox'">
          <!-- MOBILE: hanya salah satu yang tampil -->
          <template v-if="!isDesktop">
            <div
              v-if="!selectedConversation"
              class="w-full h-full bg-white flex flex-col"
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
            <div v-else class="w-full h-full flex flex-col bg-gray-100">
              <InboxMain
                :selected-conversation="selectedConversation"
                @back="selectedConversation = null"
              />
            </div>
          </template>
          <!-- DESKTOP: tampil berdampingan -->
          <template v-else>
            <div class="flex h-full">
              <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
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
              <div class="flex-1 flex flex-col bg-gray-100 h-full">
                <InboxMain :selected-conversation="selectedConversation" />
              </div>
            </div>
          </template>
        </template>
        <template v-else-if="currentTab === 'my-profile'">
          <div
            class="flex flex-1 min-h-0 justify-center items-center bg-gray-100"
          >
            <MyProfile />
          </div>
        </template>
        <template v-else-if="currentTab === 'agent-ai'">
          <div class="flex flex-1 min-h-0 bg-gray-100">
            <div class="flex-1 flex flex-col">
              <AgentAIMain :selected-agent="selectedAgent" />
            </div>
          </div>
        </template>
        <template v-else-if="currentTab === 'agent-manusia'">
          <!-- MOBILE: hanya salah satu yang tampil -->
          <template v-if="!isDesktop">
            <div
              v-if="!selectedAgent"
              class="w-full h-full bg-white flex flex-col"
            >
              <AgentManusiaList
                ref="agentManusiaListRef"
                :selected-agent="selectedAgent"
                @select-agent="onSelectAgent"
                @add-agent="onAddAgent"
              />
            </div>
            <div v-else class="w-full h-full flex flex-col bg-gray-100">
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
            <div class="flex h-full">
              <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
                <AgentManusiaList
                  ref="agentManusiaListRef"
                  :selected-agent="selectedAgent"
                  @select-agent="onSelectAgent"
                  @add-agent="onAddAgent"
                />
              </div>
              <div class="flex-1 flex flex-col bg-gray-100 h-full">
                <AgentManusiaMain
                  :selected-agent="selectedAgent"
                  @refresh-list="onRefreshAgentManusiaList"
                  @clear-selected="onClearSelectedAgent"
                />
              </div>
            </div>
          </template>
        </template>
        <template v-else-if="currentTab === 'chanel'">
          <!-- MOBILE: hanya salah satu yang tampil -->
          <template v-if="!isDesktop">
            <div
              v-if="!selectedchanel"
              class="w-full h-full bg-white flex flex-col"
            >
              <ChanelList ref="chanelListRef" @select-chanel="onSelectchanel" />
            </div>
            <div v-else class="w-full h-full flex flex-col bg-gray-100">
              <ChanelMain
                :chanel="selectedchanel"
                @update-whatsapp-number="onUpdateWhatsAppNumber"
                @back="selectedchanel = null"
              />
            </div>
          </template>
          <!-- DESKTOP: tampil berdampingan -->
          <template v-else>
            <div class="flex h-full">
              <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
                <ChanelList
                  ref="chanelListRef"
                  @select-chanel="onSelectchanel"
                />
              </div>
              <div class="flex-1 flex flex-col bg-gray-100 h-full">
                <ChanelMain
                  :chanel="selectedchanel"
                  @update-whatsapp-number="onUpdateWhatsAppNumber"
                />
              </div>
            </div>
          </template>
        </template>
        <template v-else-if="currentTab === 'chat'">
          <!-- MOBILE: hanya salah satu yang tampil -->
          <template v-if="!isDesktop">
            <!-- Chat List -->
            <div
              v-if="!selectedBroadcast && !selectedAutoMessage && !showChatForm"
              class="w-full h-full bg-white flex flex-col"
            >
              <ChatList
                ref="chatListRef"
                v-model:activeSubTab="chatSubTab"
                :selected-broadcast="selectedBroadcast"
                :selected-auto-message="selectedAutoMessage"
                @select-broadcast="onSelectBroadcast"
                @select-auto-message="onSelectAutoMessage"
                @add-broadcast="onAddBroadcast"
                @add-auto-message="onAddAutoMessage"
              />
            </div>
            <!-- Chat Main -->
            <div v-else class="w-full h-full flex flex-col bg-gray-100">
              <ChatMain
                :selected-broadcast="selectedBroadcast"
                :selected-auto-message="selectedAutoMessage"
                :show-form="showChatForm"
                :form-type="chatFormType"
                :form-edit-data="chatFormEditData"
                @back="onBackFromChat"
                @edit="onEditChatItem"
                @form-saved="onChatFormSaved"
                @refresh-list="onRefreshChatList"
              />
            </div>
          </template>
          <!-- DESKTOP: tampil berdampingan -->
          <template v-else>
            <div class="flex h-full">
              <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
                <ChatList
                  ref="chatListRef"
                  v-model:activeSubTab="chatSubTab"
                  :selected-broadcast="selectedBroadcast"
                  :selected-auto-message="selectedAutoMessage"
                  @select-broadcast="onSelectBroadcast"
                  @select-auto-message="onSelectAutoMessage"
                  @add-broadcast="onAddBroadcast"
                  @add-auto-message="onAddAutoMessage"
                />
              </div>
              <div class="flex-1 flex flex-col bg-gray-100 h-full">
                <ChatMain
                  :selected-broadcast="selectedBroadcast"
                  :selected-auto-message="selectedAutoMessage"
                  :show-form="showChatForm"
                  :form-type="chatFormType"
                  :form-edit-data="chatFormEditData"
                  @back="onBackFromChat"
                  @edit="onEditChatItem"
                  @form-saved="onChatFormSaved"
                  @refresh-list="onRefreshChatList"
                />
              </div>
            </div>
          </template>
        </template>

        <!-- Product Tab -->
        <template v-else-if="currentTab === 'produk'">
          <!-- Product List and Main -->
          <!-- MOBILE: hanya salah satu yang tampil -->
          <template v-if="!isDesktop">
            <div
              v-if="!selectedProduct"
              class="w-full h-full bg-white flex flex-col"
            >
              <ProductList
                ref="productListRef"
                :selected-product="selectedProduct"
                @select-product="onSelectProduct"
                @add-product="onAddProduct"
              />
            </div>
            <div v-else class="w-full h-full flex flex-col bg-gray-100">
              <ProductMain
                :selected-product="selectedProduct"
                :show-form="productFormInMain"
                :form-edit-data="productFormEditData"
                @back="onBackFromProduct"
                @edit-product="onEditProduct"
                @form-saved="onProductFormSaved"
                @refresh-list="onRefreshProductList"
              />
            </div>
          </template>
          <!-- DESKTOP: tampil berdampingan -->
          <template v-else>
            <div class="flex h-full">
              <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
                <ProductList
                  ref="productListRef"
                  :selected-product="selectedProduct"
                  @select-product="onSelectProduct"
                  @add-product="onAddProduct"
                />
              </div>
              <div class="flex-1 flex flex-col bg-gray-100 h-full">
                <ProductMain
                  :selected-product="selectedProduct"
                  :show-form="productFormInMain"
                  :form-edit-data="productFormEditData"
                  @back="onBackFromProduct"
                  @edit-product="onEditProduct"
                  @form-saved="onProductFormSaved"
                  @refresh-list="onRefreshProductList"
                />
              </div>
            </div>
          </template>
        </template>

        <template v-else-if="currentTab === 'kontak'">
          <!-- MOBILE: hanya salah satu yang tampil -->
          <template v-if="!isDesktop">
            <div
              v-if="!selectedContact"
              class="w-full h-full bg-white flex flex-col"
            >
              <KontakList @select-contact="onSelectContact" />
            </div>
            <div v-else class="w-full h-full flex flex-col bg-gray-100">
              <KontakMain
                :selected-contact="selectedContact"
                @back="selectedContact = null"
              />
            </div>
          </template>
          <!-- DESKTOP: tampil berdampingan -->
          <template v-else>
            <div class="flex h-full">
              <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
                <KontakList @select-contact="onSelectContact" />
              </div>
              <div class="flex-1 flex flex-col bg-gray-100 h-full">
                <KontakMain :selected-contact="selectedContact" />
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>

    <!-- More Tabs Modal -->
    <transition name="fade">
      <div v-if="showMoreTabs" class="fixed inset-0 z-50 flex flex-col">
        <div
          class="flex-1 bg-black bg-opacity-30"
          @click="showMoreTabs = false"
        ></div>
        <div class="bg-white p-4 border-t">
          <NuxtLink
            v-for="t in moreTabs"
            :key="t.value"
            :to="`/views/${t.value}`"
            class="block w-full text-left px-4 py-3 text-base border-b last:border-b-0"
            :class="
              currentTab === t.value ? 'text-blue-600 font-bold' : 'text-gray-700'
            "
            @click="showMoreTabs = false"
          >
            {{ t.label }}
          </NuxtLink>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
definePageMeta({ middleware: "auth" });
import { ref, computed, onMounted, watch, reactive } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useSupabaseUser, useSupabaseClient } from "#imports";
import { useRouter, useRoute } from "vue-router";
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
import ChatList from "~/components/ChatList.vue";
import ChatMain from "~/components/ChatMain.vue";
import ChatForm from "~/components/ChatForm.vue";
import ProductList from "~/components/ProductList.vue";
import ProductMain from "~/components/ProductMain.vue";
import DashboardMain from "~/components/DashboardMain.vue";

const tabs = [
  {
    value: "dashboard",
    label: "Dashboard",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>`,
  },
  {
    value: "inbox",
    label: "Inbox",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
    </svg>`,
  },
  {
    value: "kontak",
    label: "Kontak",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
    </svg>`,
  },
  {
    value: "chanel",
    label: "Chanel",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
    </svg>`,
  },
  {
    value: "chat",
    label: "Chat",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    </svg>`,
  },
  {
    value: "produk",
    label: "Produk",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>`,
  },
  {
    value: "agent-ai",
    label: "Agent AI",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>`,
  },
  {
    value: "agent-manusia",
    label: "Agent Manusia",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>`,
  },
  {
    value: "my-profile",
    label: "My Profile",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>`,
  },
];

const route = useRoute();
const currentTab = computed(() => {
  const t = route.params.tab;
  return typeof t === 'string' ? t : 'dashboard';
});

const agentTab = ref("ai");
const selectedConversation = ref(null);
const selectedAgent = ref(null);
const selectedchanel = ref(null);
const selectedContact = ref(null);
const chanelListRef = ref(null);
const agentAIListRef = ref(null);
const agentManusiaListRef = ref(null);

// Chat sub tabs
const chatSubTabs = [
  { value: "broadcast", label: "Broadcast" },
  { value: "auto-message", label: "Pesan Otomatis" },
];
const chatSubTab = ref("broadcast");
const selectedBroadcast = ref(null);
const selectedAutoMessage = ref(null);
const showChatForm = ref(false);
const chatFormType = ref("broadcast");
const chatFormEditData = ref(null);

// Product state
const selectedProduct = ref(null);
const productFormEditData = ref(null);
const productFormInMain = ref(false);
const productListRef = ref(null);

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

// Chat functions
function onSelectBroadcast(broadcast) {
  selectedBroadcast.value = broadcast;
  selectedAutoMessage.value = null;
}

function onSelectAutoMessage(autoMessage) {
  selectedAutoMessage.value = autoMessage;
  selectedBroadcast.value = null;
}

function onAddBroadcast() {
  showChatForm.value = true;
  chatFormType.value = "broadcast";
  chatFormEditData.value = null;
  selectedBroadcast.value = null;
  selectedAutoMessage.value = null;
}

function onAddAutoMessage() {
  showChatForm.value = true;
  chatFormType.value = "auto-message";
  chatFormEditData.value = null;
  selectedBroadcast.value = null;
  selectedAutoMessage.value = null;
}

function onBackFromChat() {
  selectedBroadcast.value = null;
  selectedAutoMessage.value = null;
  showChatForm.value = false;
  chatFormEditData.value = null;
}

function onChatFormSaved() {
  showChatForm.value = false;
  chatFormEditData.value = null;
}

function onEditChatItem(item) {
  showChatForm.value = true;
  chatFormEditData.value = item;
  chatFormType.value = item.scheduledAt ? "auto-message" : "broadcast";
  selectedBroadcast.value = null;
  selectedAutoMessage.value = null;
}

const chatListRef = ref(null);

function onRefreshChatList() {
  console.log("Parent: Refreshing chat list...");
  if (chatListRef.value) {
    chatListRef.value.fetchBroadcastMessages();
    chatListRef.value.fetchAutoMessages();
  } else {
    console.error("Parent: chatListRef is null");
  }
}

// Product functions
function onSelectProduct(product) {
  selectedProduct.value = product;
}

function onAddProduct() {
  productFormInMain.value = true;
  productFormEditData.value = null;
  selectedProduct.value = null;
}

function onEditProduct(product) {
  productFormInMain.value = true;
  productFormEditData.value = product;
  selectedProduct.value = null;
}

function onBackFromProduct() {
  selectedProduct.value = null;
  productFormInMain.value = false;
  productFormEditData.value = null;
}

function onProductFormSaved() {
  productFormInMain.value = false;
  productFormEditData.value = null;
}

function onRefreshProductList() {
  console.log("Parent: Refreshing product list...");
  if (productListRef.value) {
    productListRef.value.fetchProducts();
  } else {
    console.error("Parent: productListRef is null");
  }
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
  router.push("/views/my-profile");
}

function goToDoc() {
  closeDropdown();
  window.open("/doc", "_blank");
}

function goUpgrade() {
  router.push('/pricing/payment?plan=pro');
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

// Hapus seluruh state dan pemanggilan API Dashboard dari file views.
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
