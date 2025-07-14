<template>
  <div class="p-8">
    <h2 class="mt-0 text-xl font-bold">Channel</h2>
    <button
      @click="showForm = !showForm"
      class="mb-6 px-5 py-2.5 bg-blue-500 text-white rounded-lg cursor-pointer text-base border-none"
    >
      Buat Channel
    </button>
    <ChannelModal :show="showForm" @close="showForm = false">
      <form @submit.prevent="addChannel">
        <input
          v-model="newChannel.name"
          type="text"
          placeholder="Nama Channel"
          required
          class="px-3 mb-3 py-2 text-base border border-gray-300 rounded w-full"
        />
        <select
          v-model="newChannel.type"
          class="px-3 py-2 text-base border border-gray-300 rounded w-full mb-3"
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="messenger">Messenger</option>
        </select>
        <button
          type="submit"
          class="px-4 py-2 ml-2 bg-blue-500 text-white rounded cursor-pointer border-none"
        >
          Simpan
        </button>
      </form>
    </ChannelModal>
    <div class="mt-6">
      <div
        class="flex items-center mb-4 relative cursor-pointer"
        v-for="(channel, idx) in channels"
        :key="idx"
        @click="selectChannel(channel)"
      >
        <img
          :src="channel.icon_url || '/default-channel-icon.png'"
          class="w-10 h-10"
        />
        <div class="ml-4 flex-1">
          <div class="font-medium">{{ channel.name || "Unnamed Channel" }}</div>
          <div class="text-gray-500">
            {{ channel.whatsapp_number || "Belum terhubung" }}
          </div>
        </div>
      </div>
      <div
        v-if="!channels || channels.length === 0"
        class="text-gray-500 text-center py-8"
      >
        No channels found. Create your first channel above.
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useChannelStore } from "~/composables/useChannels";
import ChannelModal from "~/components/ChannelModal.vue";

const {
  channels,
  loading,
  error,
  fetchChannels,
  addChannel: addChannelToDB,
} = useChannelStore();
const showForm = ref(false);
const newChannel = ref({ name: "", type: "whatsapp" });
const emit = defineEmits(["select-channel"]);

async function addChannel() {
  try {
    let iconUrl = "";
    if (newChannel.value.type === "whatsapp") {
      iconUrl = "https://img.icons8.com/color/48/000000/whatsapp--v1.png";
    } else if (newChannel.value.type === "messenger") {
      iconUrl =
        "https://img.icons8.com/color/48/000000/facebook-messenger--v1.png";
    }

    await addChannelToDB({
      name: newChannel.value.name,
      type: newChannel.value.type,
      icon_url: iconUrl,
      whatsapp_number: "",
      takeover_ai: false,
      waktu_takeover: 0,
      limit_balasan_ai: false,
      maksimum_balasan_ai: 0,
    });

    await fetchChannels();

    newChannel.value = { name: "", type: "whatsapp" };
    showForm.value = false;
  } catch (err) {
    console.error("Error adding channel:", err);
    alert("Gagal menambahkan channel");
  }
}

function selectChannel(channel) {
  emit("select-channel", channel);
}

// Function to update WhatsApp number for a channel
async function updateChannelWhatsAppNumber(channelId, whatsappNumber) {
  try {
    const { updateWhatsAppNumber } = useChannelStore();
    await updateWhatsAppNumber(channelId, whatsappNumber);
  } catch (err) {
    console.error("Error updating WhatsApp number:", err);
  }
}

// Expose the update function so it can be called from parent components
defineExpose({
  updateChannelWhatsAppNumber,
});

onMounted(async () => {
  await fetchChannels();
});
</script>
