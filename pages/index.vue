<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <div class="flex items-center bg-white border-b border-gray-200 px-8 h-16">
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
            <AgentManusiaMain :selected-agent="selectedAgent" />
          </div>
        </div>
      </template>
      <template v-else-if="tab === 'channel'">
        <div class="flex flex-1 min-h-0">
          <div
            class="w-80 bg-white border-r border-gray-200 py-6 flex flex-col items-stretch overflow-y-auto"
          >
            <ChannelList
              ref="channelListRef"
              @select-channel="onSelectChannel"
            />
          </div>
          <div class="flex-1 flex flex-col bg-gray-100">
            <ChannelMain
              :channel="selectedChannel"
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
import { ref, onMounted } from "vue";
import { useAgentStore } from "~/composables/useAgents";
import InboxList from "~/components/InboxList.vue";
import KontakList from "~/components/KontakList.vue";
import ChannelList from "~/components/ChannelList.vue";
import AgentAIList from "~/components/AgentAIList.vue";
import AgentManusiaList from "~/components/AgentManusiaList.vue";
import InboxMain from "~/components/InboxMain.vue";
import KontakMain from "~/components/KontakMain.vue";
import ChannelMain from "~/components/ChannelMain.vue";
import AgentAIMain from "~/components/AgentAIMain.vue";
import AgentManusiaMain from "~/components/AgentManusiaMain.vue";

const tabs = [
  { value: "inbox", label: "Inbox" },
  { value: "kontak", label: "Kontak" },
  { value: "channel", label: "Channel" },
  { value: "agent-ai", label: "Agent AI" },
  { value: "agent-manusia", label: "Agent Manusia" },
];

const tab = ref("inbox");
const agentTab = ref("ai");
const selectedConversation = ref(null);
const selectedAgent = ref(null);
const selectedChannel = ref(null);
const selectedContact = ref(null);
const channelListRef = ref(null);
const agentAIListRef = ref(null);
const agentManusiaListRef = ref(null);

const { fetchAgents } = useAgentStore();

function onSelectConversation(conversation) {
  selectedConversation.value = conversation;
}

function onSelectAgent(agent) {
  selectedAgent.value = agent;
}

function onAddAgent() {
  selectedAgent.value = {};
}

function onSelectChannel(channel) {
  selectedChannel.value = channel;
}

function onSelectContact(contact) {
  selectedContact.value = contact;
}

function onUpdateWhatsAppNumber(channelId, whatsappNumber) {
  if (channelListRef.value) {
    channelListRef.value.updateChannelWhatsAppNumber(channelId, whatsappNumber);
  }
}

onMounted(async () => {
  // Load initial data
  await fetchAgents();
});
</script>
