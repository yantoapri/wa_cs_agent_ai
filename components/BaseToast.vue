<template>
  <div
    v-if="show"
    :class="[
      'fixed top-6 left-1/2 z-[9999] px-6 py-3 rounded shadow-lg text-white text-base font-semibold transition-all duration-300',
      type === 'success' ? 'bg-green-600' : '',
      type === 'error' ? 'bg-red-600' : '',
      type === 'info' ? 'bg-blue-600' : '',
      type === 'warning' ? 'bg-yellow-500 text-black' : '',
    ]"
    style="transform: translateX(-50%); min-width: 220px; max-width: 90vw"
  >
    {{ message }}
  </div>
</template>
<script setup>
import { ref } from "vue";
const show = ref(false);
const message = ref("");
const type = ref("info");
let timeout = null;

function triggerToast({ message: msg, type: t = "info", duration = 2500 }) {
  message.value = msg;
  type.value = t;
  show.value = true;
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    show.value = false;
  }, duration);
}

defineExpose({ triggerToast });
</script>
