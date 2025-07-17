<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/25"
    @click.self="close"
  >
    <div
      class="bg-white p-8 rounded-xl min-w-[300px] max-w-[400px] w-[90vw] shadow-xl relative"
    >
      <button
        class="absolute right-4 top-3 bg-none border-none text-2xl text-gray-400 hover:text-gray-600 cursor-pointer"
        @click="close"
      >
        &times;
      </button>
      <div class="py-2">
        <slot />
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({ show: Boolean });
const emit = defineEmits(["close"]);
function close() {
  emit("close");
}
</script>
