<template>
  <div :class="sidebar ? 'p-8' : 'p-8'">
    <button
      @click="showForm = !showForm"
      class="mb-6 px-5 py-2.5 bg-blue-500 text-white rounded-lg cursor-pointer text-base border-none"
      :disabled="loading"
    >
      Buat Agent AI
    </button>
    <ChannelModal :show="showForm" @close="showForm = false">
      <form @submit.prevent="addAI">
        <input
          v-model="newAI.name"
          type="text"
          placeholder="Nama Agent AI"
          required
          class="px-3 mb-3 py-2 text-base border border-gray-300 rounded w-full"
          :disabled="loading"
        />
        <button
          type="submit"
          class="px-4 py-2 my-3 bg-blue-500 text-white rounded cursor-pointer border-none w-full"
          :disabled="loading"
        >
          Simpan
        </button>
      </form>
    </ChannelModal>
    <div v-if="loading" class="flex justify-center my-4">
      <svg
        class="animate-spin h-8 w-8 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        ></path>
      </svg>
    </div>
    <div class="mt-6">
      <div
        v-for="(ai, idx) in props.aiList"
        :key="ai.id || idx"
        @click="emit('select', ai)"
        :class="[
          'flex items-center mb-4 relative rounded-lg transition-colors',
          'cursor-pointer',
          props.selected && ai.id === props.selected.id
            ? 'bg-blue-100 border border-blue-400'
            : 'hover:bg-gray-100',
        ]"
      >
        <div class="ml-4 flex-1">
          <div class="font-medium">{{ ai.name }}</div>
          <div class="text-gray-500">{{ ai.status }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import { useAgentStore } from "~/composables/useAgents";
import ChannelModal from "~/components/ChannelModal.vue";

const props = defineProps({
  aiList: { type: Array, default: () => [] },
  selected: { type: Object, default: null },
  sidebar: { type: Boolean, default: false }, // opsional, untuk styling sidebar
  refreshKey: { type: Number, default: 0 }, // untuk trigger refresh dari parent
});
const emit = defineEmits(["select"]);
const showForm = ref(false);
const newAI = ref({ name: "" });
const loading = ref(false);

const { addAgent, fetchAgentsByType } = useAgentStore();

watch(
  () => props.refreshKey,
  async () => {
    await fetchAgentsByType("ai");
  }
);

async function addAI() {
  loading.value = true;
  try {
    const newAgent = await addAgent({
      name: newAI.value.name,
      type: "ai",
      description: "",
      kepintaran: "Basic",
      is_active: true,
    });

    await fetchAgentsByType("ai"); // reload list after add
    emit("add", newAgent);
    newAI.value = { name: "" };
    showForm.value = false;
  } catch (err) {
    console.error("Error adding AI agent:", err);
    alert("Gagal menambahkan agent AI");
  } finally {
    loading.value = false;
  }
}
</script>
