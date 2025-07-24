<template>
  <NuxtPage />
  <BaseToast ref="baseToast" />
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import BaseToast from "~/components/BaseToast.vue";
import { useToast } from "~/composables/useToast";
import { useHead } from "#imports";
useHead({
  title: "Nutra AI Chat",
  link: [
    { rel: "icon", type: "image/x-icon", href: "/assets/img/favicon.ico" },
  ],
});

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
