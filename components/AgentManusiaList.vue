<template>
  <div class="p-8">
    <button
      @click="onAddAgent"
      class="mb-6 px-5 py-2.5 bg-blue-500 text-white rounded-lg cursor-pointer text-base border-none"
    >
      Buat Agent Manusia
    </button>
    <div class="mt-6">
      <div
        class="flex items-center mb-4 relative cursor-pointer"
        v-for="(manusia, idx) in humanAgents"
        :key="manusia.id"
        @click="selectManusia(manusia)"
      >
        <img :src="manusia.avatar_url" class="w-10 h-10" />
        <div class="ml-4 flex-1">
          <div class="font-medium">{{ manusia.name }}</div>
          <div class="text-gray-500">{{ manusia.status }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useAgentStore } from "~/composables/useAgents";

const { humanAgents, fetchAgentsByType } = useAgentStore();
const emit = defineEmits(["select-agent", "add-agent"]);

function selectManusia(manusia) {
  emit("select-agent", manusia);
}

function onAddAgent() {
  emit("add-agent");
}

onMounted(async () => {
  await fetchAgentsByType("manusia");
});
</script>
