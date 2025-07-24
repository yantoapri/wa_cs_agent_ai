<template>
  <div :class="sidebar ? 'p-8' : 'p-8'">
    <div class="flex justify-between items-center mb-6">
      <h2 class="mt-0 text-xl font-bold">Agent AI</h2>
      <button
        @click="showForm = !showForm"
        class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center"
        :disabled="loading"
        title="Buat Agent AI"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
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
    <ChanelModal :show="showForm" @close="showForm = false">
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
    </ChanelModal>
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
          'flex items-center mb-4 py-3 relative rounded-lg transition-colors',
          'cursor-pointer',
          props.selected && ai.id === props.selected.id
            ? 'bg-blue-100 border border-blue-400'
            : 'hover:bg-gray-100',
        ]"
      >
        <img
          :src="
            ai.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              ai.name
            )}&background=random`
          "
          class="w-12 h-12 rounded-full object-cover mr-4"
          :alt="ai.name"
        />
        <div class="ml-0 flex-1">
          <div class="font-medium">{{ ai.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import { useAgentStore } from "~/composables/useAgents";
import ChanelModal from "~/components/ChanelModal.vue";

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
