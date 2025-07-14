<template>
  <div>
    <div v-if="selectedContact" class="bg-white rounded-lg shadow p-6">
      <!-- Contact Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center">
          <img
            class="w-12 h-12 rounded-full mr-4"
            :src="
              selectedContact.avatar ||
              `https://ui-avatars.com/api/?name=${selectedContact.name}&background=random`
            "
            :alt="selectedContact.name"
          />
          <div>
            <span class="block font-semibold text-lg">{{
              selectedContact.name
            }}</span>
            <span class="text-gray-500 text-sm">{{
              selectedContact.phone_number
            }}</span>
            <span
              v-if="selectedContact.email"
              class="block text-gray-400 text-sm"
              >{{ selectedContact.email }}</span
            >
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="showEditModal = true"
            class="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit kontak"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              ></path>
            </svg>
          </button>
          <button
            @click="showContactDetails = !showContactDetails"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Detail kontak"
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Contact Details -->
      <div v-if="showContactDetails" class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="font-medium text-gray-700 mb-3">Detail Kontak</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Nama:</span>
            <span class="ml-2 font-medium">{{ selectedContact.name }}</span>
          </div>
          <div>
            <span class="text-gray-500">Telepon:</span>
            <span class="ml-2 font-medium">{{
              selectedContact.phone_number
            }}</span>
          </div>
          <div v-if="selectedContact.email">
            <span class="text-gray-500">Email:</span>
            <span class="ml-2 font-medium">{{ selectedContact.email }}</span>
          </div>
          <div v-if="selectedContact.channel_id">
            <span class="text-gray-500">Channel:</span>
            <span class="ml-2 font-medium">{{
              getChannelName(selectedContact.channel_id)
            }}</span>
          </div>
          <div v-if="selectedContact.notes" class="col-span-2">
            <span class="text-gray-500">Catatan:</span>
            <p class="mt-1 text-gray-700">{{ selectedContact.notes }}</p>
          </div>
          <div class="col-span-2">
            <span class="text-gray-500">Bergabung sejak:</span>
            <span class="ml-2 font-medium">{{
              formatDate(selectedContact.created_at)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Messages Section -->
      <div v-if="loading" class="text-center py-8">
        <div class="text-gray-500">Loading pesan...</div>
      </div>

      <div v-else class="space-y-2 mb-4 max-h-96 overflow-y-auto">
        <div
          v-if="messages.length === 0"
          class="text-center py-8 text-gray-400"
        >
          Belum ada pesan dengan kontak ini
          <div class="mt-2">
            <button
              @click="startConversation"
              class="text-blue-600 hover:text-blue-700 text-sm"
            >
              Mulai percakapan
            </button>
          </div>
        </div>
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'px-4 py-2 rounded-lg max-w-[70%]',
            message.direction === 'outbound'
              ? 'bg-blue-50 ml-auto'
              : 'bg-gray-100',
          ]"
        >
          <div class="text-sm">{{ message.content }}</div>
          <div class="text-xs text-gray-400 mt-1">
            {{ formatTime(message.created_at) }}
            <span v-if="message.direction === 'outbound'" class="ml-2">
              {{ message.is_read ? "✓✓" : "✓" }}
            </span>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Ketik pesan..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-base"
          @keyup.enter="sendMessage"
          :disabled="sending"
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim() || sending"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {{ sending ? "Mengirim..." : "Kirim" }}
        </button>
      </div>
    </div>
    <div v-else class="p-8 text-gray-400 text-center">
      Pilih kontak untuk melihat detail chat.
    </div>

    <!-- Edit Contact Modal -->
    <ChannelModal :show="showEditModal" @close="showEditModal = false">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Edit Kontak</h3>

        <form @submit.prevent="updateContactData">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nama *
              </label>
              <input
                v-model="editForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama kontak"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon *
              </label>
              <input
                v-model="editForm.phone_number"
                type="tel"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+62 812-3456-7890"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                v-model="editForm.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="kontak@email.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Avatar URL
              </label>
              <input
                v-model="editForm.avatar"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Channel
              </label>
              <select
                v-model="editForm.channel_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih channel</option>
                <option
                  v-for="channel in channels"
                  :key="channel.id"
                  :value="channel.id"
                >
                  {{ channel.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Catatan
              </label>
              <textarea
                v-model="editForm.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Catatan tambahan tentang kontak ini..."
              ></textarea>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {{ saving ? "Menyimpan..." : "Update" }}
            </button>
            <button
              type="button"
              @click="showEditModal = false"
              :disabled="saving"
              class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </ChannelModal>
  </div>
</template>
<script setup>
import { ref, watch, reactive, onMounted } from "vue";
import { useConversationStore } from "~/composables/useConversationStore";
import { useContactStore } from "~/composables/useContacts";
import { useChannelStore } from "~/composables/useChannels";
import ChannelModal from "~/components/ChannelModal.vue";

const props = defineProps({
  selectedContact: Object,
});

const { messages, loading, addMessage, fetchMessages, createConversation } =
  useConversationStore();
const { updateContact } = useContactStore();
const { channels, fetchChannels } = useChannelStore();

const newMessage = ref("");
const sending = ref(false);
const currentConversationId = ref(null);
const showEditModal = ref(false);
const showContactDetails = ref(false);
const saving = ref(false);

// Edit form
const editForm = reactive({
  name: "",
  phone_number: "",
  email: "",
  avatar: "",
  channel_id: "",
  notes: "",
});

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getChannelName = (channelId) => {
  const channel = channels.value.find((c) => c.id === channelId);
  return channel ? channel.name : "Unknown Channel";
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentConversationId.value) return;

  sending.value = true;
  try {
    await addMessage({
      conversation_id: currentConversationId.value,
      content: newMessage.value.trim(),
      direction: "outbound",
      message_type: "text",
      is_read: true,
    });
    newMessage.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    sending.value = false;
  }
};

const startConversation = async () => {
  if (!props.selectedContact) return;

  try {
    const conversation = await createConversation({
      contact_id: props.selectedContact.id,
      contact_name: props.selectedContact.name,
      contact_phone: props.selectedContact.phone_number,
      channel_id: props.selectedContact.channel_id,
      status: "active",
      unread_count: 0,
    });

    currentConversationId.value = conversation.id;
    await fetchMessages(conversation.id);
  } catch (error) {
    console.error("Error creating conversation:", error);
  }
};

const updateContactData = async () => {
  if (!props.selectedContact) return;

  saving.value = true;
  try {
    await updateContact(props.selectedContact.id, {
      name: editForm.name,
      phone_number: editForm.phone_number,
      email: editForm.email || null,
      avatar: editForm.avatar || null,
      channel_id: editForm.channel_id || null,
      notes: editForm.notes || null,
    });

    // Update the selected contact in parent component
    Object.assign(props.selectedContact, {
      name: editForm.name,
      phone_number: editForm.phone_number,
      email: editForm.email || null,
      avatar: editForm.avatar || null,
      channel_id: editForm.channel_id || null,
      notes: editForm.notes || null,
    });

    showEditModal.value = false;
  } catch (error) {
    console.error("Error updating contact:", error);
  } finally {
    saving.value = false;
  }
};

// Watch for contact changes and load messages
watch(
  () => props.selectedContact,
  async (newContact) => {
    if (newContact) {
      // Populate edit form
      editForm.name = newContact.name || "";
      editForm.phone_number = newContact.phone_number || "";
      editForm.email = newContact.email || "";
      editForm.avatar = newContact.avatar || "";
      editForm.channel_id = newContact.channel_id || "";
      editForm.notes = newContact.notes || "";

      // For now, we'll create a simple conversation ID based on contact
      // In a real app, you'd want to get or create the actual conversation
      currentConversationId.value = `conv_${newContact.id}`;
      await fetchMessages(currentConversationId.value);
    } else {
      currentConversationId.value = null;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await fetchChannels();
});
</script>
