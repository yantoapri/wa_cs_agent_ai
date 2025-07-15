<template>
  <NuxtLayout>
    <NuxtPage />
    <BaseToast ref="baseToast" />
  </NuxtLayout>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import BaseToast from '~/components/BaseToast.vue';
import { useToast } from '~/composables/useToast';

const baseToast = ref(null);
const { onToast } = useToast();
let off = null;

onMounted(() => {
  off = onToast((payload) => {
    if (baseToast.value) baseToast.value.triggerToast(payload);
  });
});
onUnmounted(() => {
  if (off) off();
});
</script>
