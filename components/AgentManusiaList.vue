<template>
  <div class="flex flex-col h-[100vh]">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-800">Agent Manusia</h3>
        <button
          @click="onAddAgent"
          class="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          title="Tambah Agent Manusia"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="p-4 space-y-3">
        <div
          class="group flex items-center p-3 relative cursor-pointer rounded-lg transition-all duration-200 border border-transparent"
          :class="[
            props.selectedAgent && props.selectedAgent.id === manusia.id
              ? 'bg-blue-50 border-blue-200 shadow-md scale-[1.02]'
              : 'hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:scale-[1.02]',
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
  await fetchAgentsByType("manusia");
}

onMounted(async () => {
  await fetchAgentsByType("manusia");
});

// Expose refreshList method to parent
defineExpose({
  refreshList,
});
</script>
