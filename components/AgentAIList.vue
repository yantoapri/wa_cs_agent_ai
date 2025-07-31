<template>
  <div class="flex flex-col h-[100vh]">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-800">Agent AI</h3>
        <button
          @click="showForm = !showForm"
          class="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          :disabled="loading"
          title="Buat Agent AI"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
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
    <div v-if="loading" class="flex justify-center my-4 px-6">
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
    <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="p-4 space-y-3">
        <div
          v-for="(ai, idx) in props.aiList"
          :key="ai.id || idx"
          @click="emit('select', ai)"
          :class="[
            'flex items-center p-3 relative rounded-lg transition-all duration-200 cursor-pointer border border-transparent',
            props.selected && ai.id === props.selected.id
              ? 'bg-blue-50 border-blue-200 shadow-md scale-[1.02]'
              : 'hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:scale-[1.02]',
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
