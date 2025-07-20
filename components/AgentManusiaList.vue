<template>
  <div class="p-8">
    <button
      @click="onAddAgent"
      class="mb-6 px-5 py-2.5 bg-blue-500 text-white rounded-lg cursor-pointer text-base border-none hover:bg-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md"
    >
      Buat Agent Manusia
    </button>
    <div class="mt-6">
      <div
        class="group flex items-center mb-4 relative cursor-pointer p-3 rounded-lg transition-all duration-200 border border-transparent"
        :class="[
          props.selectedAgent && props.selectedAgent.id === manusia.id
            ? 'bg-blue-50 border-blue-200 shadow-md scale-[1.02]'
            : 'hover:bg-gray-50 hover:shadow-md hover:scale-[1.02] hover:border-gray-200',
        ]"
        v-for="(manusia, idx) in humanAgents"
        :key="manusia.id"
        @click="selectManusia(manusia)"
      >
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4 shadow-sm transition-all duration-200"
          :class="[
            props.selectedAgent && props.selectedAgent.id === manusia.id
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg'
              : 'bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 hover:shadow-lg',
          ]"
        >
          {{ manusia.name ? manusia.name.charAt(0).toUpperCase() : "A" }}
        </div>
        <div class="ml-2 flex-1">
          <div
            class="font-medium transition-colors duration-200"
            :class="[
              props.selectedAgent && props.selectedAgent.id === manusia.id
                ? 'text-blue-700'
                : 'text-gray-800 hover:text-blue-600',
            ]"
          >
            {{ manusia.name }}
          </div>
          <div
            class="text-sm transition-colors duration-200"
            :class="[
              props.selectedAgent && props.selectedAgent.id === manusia.id
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            {{ manusia.phone }}
          </div>
        </div>
        <div
          class="transition-all duration-200"
          :class="[
            props.selectedAgent && props.selectedAgent.id === manusia.id
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100',
          ]"
        >
          <svg
            class="w-5 h-5 transition-colors duration-200"
            :class="[
              props.selectedAgent && props.selectedAgent.id === manusia.id
                ? 'text-blue-500'
                : 'text-gray-400 group-hover:text-blue-500',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useAgentStore } from "~/composables/useAgents";

const props = defineProps({
  selectedAgent: {
    type: Object,
    default: null,
  },
});

const { humanAgents, fetchAgentsByType } = useAgentStore();
const emit = defineEmits(["select-agent", "add-agent"]);

function selectManusia(manusia) {
  emit("select-agent", manusia);
}

function onAddAgent() {
  emit("add-agent");
}

// Method to refresh the list - can be called from parent
async function refreshList() {
  console.log("AgentManusiaList: Refreshing list...");
  await fetchAgentsByType("manusia");
  console.log(
    "AgentManusiaList: List refreshed, current agents:",
    humanAgents.value
  );
}

onMounted(async () => {
  await fetchAgentsByType("manusia");
});

// Expose refreshList method to parent
defineExpose({
  refreshList,
});
</script>
