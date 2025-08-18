<template>
  <div>
    <div
      v-if="selectedConversation"
      class="bg-white rounded-lg shadow p-6 h-[90vh] flex flex-col"
    >
      <div class="flex items-center mb-4">
        <!-- Tombol back hanya di mobile -->
        <button
          class="md:hidden mr-2 p-1 text-gray-700 hover:bg-gray-200 rounded-full"
          @click="$emit('back')"
          aria-label="Kembali ke daftar percakapan"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="w-7 h-7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <img
          class="w-12 h-12 rounded-full mr-4"
          :src="getConversationAvatar(selectedConversation)"
          :alt="getConversationName(selectedConversation)"
        />
        <div>
          <span class="block font-semibold text-lg">{{
            getConversationName(selectedConversation)
          }}</span>
          <span class="text-gray-500 text-sm">{{ 
            getConversationStatus(selectedConversation)
          }}</span>
        </div>
      </div>

      <div v-if="loading" class="text-center py-8 flex-1">
        <div class="text-gray-500">Loading pesan...</div>
      </div>

      <div v-else class="space-y-2 mb-4 flex-1 overflow-y-auto">
        <div
          v-if="displayMessages.length === 0"
          class="text-center py-8 text-gray-400"
        >
          Belum ada pesan dalam percakapan ini
        </div>
        <template v-else>
          <template v-for="(message, idx) in sortedMessages" :key="message.id">
            <template v-if="shouldShowDate(displayMessages, idx)">
              <div class="flex justify-center my-4">
                <span
                  class="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full shadow"
                  >{{ formatDate(message.created_at) }}</span
                >
              </div>
            </template>
            <!-- Bubble chat: kanan jika from == contact, kiri jika from == chanel -->
                        <div
                                      class="w-full flex"
                                      :class="selectedConversation.contact?.phone_number!=message.from ? 'justify-end' : 'justify-start'"
                                    >
                                   
                                      <div
                                        :class="[
                                          'max-w-[70%] px-4 py-2 rounded-lg mb-2 align-top',
                                          selectedConversation.contact?.phone_number!=message.from
                                            ? 'bg-blue-500 text-white ml-auto' // bubble kanan (user)
                                            : 'bg-gray-100 text-gray-900 mr-auto', // bubble kiri (agent)
                                        ]"
                                      >
                                        <div
                                          class="text-xs mb-1"
                                          :class="selectedConversation.contact?.phone_number==message.from  ? 'text-gray-900' : 'text-white'"
                                        >
                                          {{ 
                                            selectedConversation.contact?.phone_number==message.from 
                                              ? selectedConversation.contact?.name ||
                                                selectedConversation.contact?.phone_number ||
                                                "User"
                                              : selectedConversation.agent?.name || "Agent"
                                          }}
                                        </div>
                                        <div v-if="message.media_url" class="mb-2">
                                          <img
                                            :src="message.media_url"
                                            alt="media"
                                            class="max-w-full max-h-60 rounded-lg border"
                                            :class="(selectedConversation.contact?.phone_number!=message.from && selectedConversation.contact?.phone_number!=message.to) ? 'ml-auto' : 'mr-auto'"
                                          />
                                        </div>
                                        <div class="text-sm whitespace-pre-line">
                                          {{ message.content }}
                                        </div>
                                        <div
                                          class="text-xs text-gray-200 mt-1"
                                          v-if="(selectedConversation.contact?.phone_number!=message.from && selectedConversation.contact?.phone_number!=message.to)"
                                        >
                                          {{ formatTime(message.created_at) }}
                                        </div>
                                        <div class="text-xs text-gray-400 mt-1" v-else>
                                          {{ formatTime(message.created_at) }}
                                        </div>
              </div>
            </div>
          </template>
        </template>
      </div>

      <!-- Chat Input untuk Agent Manusia -->
      <div
        v-if="selectedConversation?.agent?.type === 'manusia'"
        class="border-t border-gray-200 pt-4 relative"
      >
        <div class="flex items-center space-x-2">
          <!-- Emoji Picker -->
          <button
            @click="showEmojiPicker = !showEmojiPicker"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            title="Emoji"
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
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </button>

          <!-- Image Attachment -->
          <label
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer"
            title="Attach Image"
          >
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              accept="image/*"
              class="hidden"
            />
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
          </label>

          <!-- Message Input -->
          <div class="flex-1 relative">
            <textarea
              v-model="newMessage"
              @keydown.enter.prevent="sendMessage"
              @keydown.enter.shift.exact="newMessage += '\n'"
              placeholder="Ketik pesan..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="1"
              ref="messageInput"
            ></textarea>
          </div>

          <!-- Send Button -->
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim() && !selectedImage"
            class="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Kirim"
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Image Preview -->
        <div
          v-if="selectedImage && !showCaptionPopup"
          class="mt-2 p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <!-- Image Preview -->
              <img
                :src="imagePreview"
                alt="Preview"
                class="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />

              <!-- File Info -->
              <div>
                <span class="text-sm font-medium text-gray-700">
                  {{ selectedImage.name }}
                </span>
                <div class="flex items-center space-x-2 mt-1">
                  <span v-if="imageCaption" class="text-xs text-gray-500">
                    • {{ imageCaption.length }} characters
                  </span>
                </div>
              </div>
            </div>

            <!-- Remove Button -->
            <button
              @click="removeImage"
              class="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
              title="Remove image"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Caption Popup Modal -->
        <div
          v-if="showCaptionPopup"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click="showCaptionPopup = false"
        >
          <div
            class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            @click.stop
          >
            <!-- Header -->
            <div
              class="flex items-center justify-between p-4 border-b border-gray-200"
            >
              <h3 class="text-lg font-medium text-gray-900">Add Caption</h3>
              <button
                @click="showCaptionPopup = false"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-4">
              <!-- Image Preview in Popup -->
              <div class="flex items-center space-x-3 mb-4">
                <img
                  :src="imagePreview"
                  alt="Preview"
                  class="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <div>
                  <span class="text-sm font-medium text-gray-700">
                    {{ selectedImage.name }}
                  </span>
                  <p class="text-xs text-gray-500">
                    {{ 
                      selectedImage.size
                        ? (selectedImage.size / 1024 / 1024).toFixed(1) + " MB"
                        : ""
                    }}
                  </p>
                </div>
              </div>

              <!-- Caption Input -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Caption (optional)
                </label>
                <textarea
                  v-model="imageCaption"
                  placeholder="Add a caption to your image..."
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                  maxlength="500"
                  ref="captionTextarea"
                ></textarea>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-500">
                    {{ imageCaption.length }}/500 characters
                  </span>
                  <button
                    @click="clearImageCaption"
                    v-if="imageCaption.trim()"
                    class="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div
              class="flex justify-end space-x-3 p-4 border-t border-gray-200"
            >
              <button
                @click="showCaptionPopup = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                @click="sendMessageFromPopup"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  ></path>
                </svg>
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Emoji Picker Popover -->
        <div
          v-if="showEmojiPicker"
          class="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-80"
        >
          <!-- Search bar -->
          <div class="border-b border-gray-200 p-3">
            <div class="relative">
              <svg
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="search emojis"
                class="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                @input="handleSearch"
              />
            </div>
          </div>

          <!-- Emoji content -->
          <div class="p-3 max-h-64 overflow-y-auto">
            <div class="mb-3">
              <h3 class="text-sm font-medium text-gray-700 mb-2">
                Smileys & people
              </h3>
              <div class="grid grid-cols-10 gap-0">
                <button
                  v-for="emoji in currentEmojis"
                  :key="emoji"
                  @click="addEmoji(emoji)"
                  class="p-1.5 hover:bg-gray-100 rounded text-base transition-colors"
                >
                  {{ emoji }}
                </button>
              </div>
            </div>
          </div>

          <!-- Category bar -->
          <div class="border-t border-gray-200 p-2">
            <div class="flex justify-center space-x-4">
              <button
                @click="selectEmojiCategory('smileys')"
                :class="
                  selectedCategory === 'smileys'
                    ? 'text-gray-800 bg-gray-100'
                    : 'text-gray-400 hover:text-gray-600'
                "
                class="p-1.5 rounded transition-colors"
              >
                😀
              </button>
              <button
                @click="selectEmojiCategory('animals')"
                :class="
                  selectedCategory === 'animals'
                    ? 'text-gray-800 bg-gray-100'
                    : 'text-gray-400 hover:text-gray-600'
                "
                class="p-1.5 rounded transition-colors"
              >
                🐻
              </button>
              <button
                @click="selectEmojiCategory('food')"
                :class="
                  selectedCategory === 'food'
                    ? 'text-gray-800 bg-gray-100'
                    : 'text-gray-400 hover:text-gray-600'
                "
                class="p-1.5 rounded transition-colors"
              >
                🍕
              </button>
              <button
                @click="selectEmojiCategory('sports')"
                :class="
                  selectedCategory === 'sports'
                    ? 'text-gray-800 bg-gray-100'
                    : 'text-gray-400 hover:text-gray-600'
                "
                class="p-1.5 rounded transition-colors"
              >
                🏀
              </button>
              <button
                @click="selectEmojiCategory('travel')"
                :class="
                  selectedCategory === 'travel'
                    ? 'text-gray-800 bg-gray-100'
                    : 'text-gray-400 hover:text-gray-600'
                "
                class="p-1.5 rounded transition-colors"
              >
                🚗
              </button>
              <button
                @click="selectEmojiCategory('objects')"
                :class="
                  selectedCategory === 'objects'
                    ? 'text-gray-800 bg-gray-100'
                    : 'text-gray-400 hover:text-gray-600'
                "
                class="p-1.5 rounded transition-colors"
              >
                💡
              </button>
              <button
                @click="selectEmojiCategory('symbols')"
                :class="
                  selectedCategory === 'symbols'
                    ? 'text-gray-800 bg-gray-100'
                    : 'text-gray-400 hover:text-gray-600'
                "
                class="p-1.5 rounded transition-colors"
              >
                ❤️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="p-8 text-gray-400 text-center">
      Pilih percakapan untuk melihat detail chat.
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onBeforeUnmount, computed, nextTick } from "vue";
import { useConversationStore } from "~/composables/useConversationStore";
import { useToast } from "~/composables/useToast";
import { useChanelstore } from "~/composables/useChanels";

const props = defineProps({
  selectedConversation: Object,
});

const {
  messages,
  loading,
  addMessage,
  fetchMessagesByGroupAi,
  fetchMessagesByGroupManusia,
  markMessagesAsRead,
} = useConversationStore();
// Separate message arrays for AI and human agents
const aiMessages = ref([]);
const humanMessages = ref([]);

// Computed property to determine which messages to display based on agent type
const displayMessages = computed(() => {
  if (!props.selectedConversation) return [];
  
  if (props.selectedConversation.agent?.type === "ai") {
    return aiMessages.value;
  } else if (props.selectedConversation.agent?.type === "manusia") {
    return humanMessages.value;
  }
  
  return messages.value; // fallback to original messages array
});

const { getchanelById } = useChanelstore();
const { showToast } = useToast();
const newMessage = ref("");
const sending = ref(false);

// Chat input features
const showEmojiPicker = ref(false);
const showCaptionPopup = ref(false);
const messageInput = ref(null);
const fileInput = ref(null);
const selectedImage = ref(null);
const imagePreview = ref("");
const imageCaption = ref("");
const selectedCategory = ref("smileys");

// Periodic refresh
const refreshInterval = ref(null);

// Emoji categories
const emojiCategories = ref({
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "🤔",
    "🤭",
    "🤫",
    "🤥",
    "😶",
    "😐",
    "😑",
    "😯",
    "😦",
    "😧",
    "😮",
    "😲",
    "🥱",
    "😴",
    "🤤",
    "😪",
    "😵",
    "🤐",
    "🥴",
    "🤢",
    "🤮",
    "🤧",
    "😷",
    "🤒",
    "🤕",
    "🤑",
    "🤠",
    "💩",
    "👻",
    "👽",
    "🤖",
    "😈",
    "👿",
    "👹",
    "👺",
    "💀",
    "☠️",
    "😺",
    "😸",
    "😹",
    "😻",
    "😼",
    "😽",
    "🙀",
    "😿",
    "😾",
    "🙈",
    "🙉",
    "🙊",
  ],
  animals: [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🐣",
    "🦆",
    "🦅",
    "🦉",
    "🦇",
    "🐺",
    "🐗",
    "🐴",
    "🦄",
    "🐝",
    "🐛",
    "🦋",
    "🐌",
    "🐞",
    "🐜",
    "🦟",
    "🦗",
    "🕷️",
    "🕸️",
    "🦂",
    "🐢",
    "🐍",
    "🦎",
    "🦖",
    "🦕",
    "🐙",
    "🦑",
    "🦐",
    "🦞",
    "🦀",
    "🐡",
    "🐠",
    "🐟",
    "🐬",
    "🐳",
    "🐋",
    "🦈",
    "🐊",
    "🐅",
    "🐆",
    "🦓",
    "🦍",
    "🦧",
    "🐘",
    "🦛",
    "🦏",
    "🐪",
    "🐫",
    "🦒",
    "🦘",
    "🐃",
    "🐂",
    "🐄",
    "🐎",
    "🐖",
    "🐏",
    "🐑",
    "🐐",
    "🦌",
    "🐕",
    "🐩",
    "🦮",
    "🐕‍🦺",
    "🐈",
    "🐈‍⬛",
    "🐓",
    "🦃",
    "🦚",
    "🦜",
    "🦢",
    "🦩",
  ],
  food: [
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🫐",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🥑",
    "🥦",
    "🥬",
    "🥒",
    "🌶️",
    "🫑",
    "🌽",
    "🥕",
    "🫒",
    "🧄",
    "🧅",
    "🥔",
    "🍠",
    "🥐",
    "🥯",
    "🍞",
    "🥖",
    "🥨",
    "🧀",
    "🥚",
    "🍳",
    "🧈",
    "🥞",
    "🧇",
    "🥓",
    "🥩",
    "🍗",
    "🍖",
    "🦴",
    "🌭",
    "🍔",
    "🍟",
    "🍕",
    "🥪",
    "🥙",
    "🧆",
    "🌮",
    "🌯",
    "🫔",
    "🥗",
    "🥘",
    "🫕",
    "🥫",
    "🍝",
    "🍜",
    "🍲",
    "🍛",
    "🍣",
    "🍱",
    "🥟",
    "🦪",
    "🍤",
    "🍙",
    "🍚",
    "🍘",
    "🍥",
    "🥠",
    "🥮",
    "🍢",
    "🍡",
    "🍧",
    "🍨",
    "🍦",
    "🥧",
    "🧁",
    "🍰",
    "🎂",
    "🍮",
    "🍭",
    "🍬",
    "🍫",
    "🍿",
    "🍪",
  ],
  sports: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🪀",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🥅",
    "⛳",
    "🪁",
    "🏹",
    "🎣",
    "🤿",
    "🥊",
    "🥋",
    "🎽",
    "🛹",
    "🛷️",
    "⛸️",
    "🥌",
    "🎿",
    "⛷️",
    "🏂",
    "🏋️‍♀️",
    "🏋️‍♂️",
    "🤼‍♀️",
    "🤼‍♂️",
    "🤸‍♀️",
    "🤸‍♂️",
    "⛹️‍♀️",
    "⛹️‍♂️",
    "🤺",
    "🤾‍♀️",
    "🤾‍♂️",
    "🏌️‍♀️",
    "🏌️‍♂️",
    "🏇",
    "🧘‍♀️",
    "🧘‍♂️",
    "🏄‍♀️",
    "🏄‍♂️",
    "🏊‍♀️",
    "🏊‍♂️",
    "🤽‍♀️",
    "🤽‍♂️",
    "🚣‍♀️",
    "🚣‍♂️",
    "🧗‍♀️",
    "🧗‍♂️",
    "🚵‍♀️",
    "🚵‍♂️",
    "🚴‍♀️",
    "🚴‍♂️",
    "🏆",
    "🥇",
    "🥈",
    "🥉",
    "🏅",
    "🎖️",
    "🏵️",
    "🎗️",
    "🎟️",
    "🎫",
    "🎪",
    "🤹‍♀️",
    "🤹‍♂️",
    "🎭",
    "🎨",
    "🎬",
    "🎤",
  ],
  travel: [
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🚚",
    "🚛",
    "🚜",
    "🛴",
    "🛵",
    "🏍️",
    "🛺",
    "🚨",
    "🚔",
    "🚍",
    "🚘",
    "🚖",
    "🚡",
    "🚠",
    "🚟",
    "🚃",
    "🚋",
    "🚞",
    "🚝",
    "🚄",
    "🚅",
    "🚈",
    "🚂",
    "🚆",
    "🚇",
    "🚊",
    "🚉",
    "✈️",
    "🛫",
    "🛬",
    "🛩️",
    "💺",
    "🛰️",
    "🚀",
    "🛸",
    "🚁",
    "🛶",
    "⛵",
    "🚤",
    "🛥️",
    "🛳️",
    "⛴️",
    "🚢",
    "🏗️",
    "🏭",
    "🏢",
    "🏛️",
    "🏣",
    "🏤",
    "🏥",
    "🏦",
    "🏨",
    "🏪",
    "🏫",
    "🏩",
    "💒",
    "⛪",
    "🕌",
    "🕍",
    "🛕",
    "⛩️",
    "🕋",
    "⛲",
    "⛺",
    "🌁",
    "🌃",
    "🏙️",
    "🌄",
    "🌅",
    "🌆",
  ],
  objects: [
    "💡",
    "🔦",
    "🕯️",
    "🪔",
    "🧯",
    "🛢️",
    "💸",
    "💵",
    "💴",
    "💶",
    "💷",
    "🪙",
    "💰",
    "🪙",
    "💳",
    "💎",
    "⚖️",
    "🪜",
    "🧰",
    "🪛",
    "🔧",
    "🔨",
    "⚒️",
    "🛠️",
    "⛏️",
    "🪚",
    "🔩",
    "⚙️",
    "🪤",
    "🧱",
    "⛓️",
    "🪝",
    "🧲",
    "🪜",
    "⚗️",
    "🧪",
    "🧫",
    "🧬",
    "🔬",
    "🔭",
    "📡",
    "💉",
    "🩸",
    "💊",
    "🩹",
    "🩺",
    "🩻",
    "🩼",
    "🩽",
    "🩾",
    "🩿",
    "🪞",
    "🪟",
    "🪠",
    "🪡",
    "🪢",
    "🧿",
    "🪣",
    "🪤",
    "🪥",
    "🪦",
    "🪧",
    "🪨",
    "🪩",
    "🪪",
    "🪫",
    "🪬",
    "🪭",
    "🪮",
    "🪯",
    "🪰",
    "🪱",
    "🪲",
    "🪳",
    "🪴",
    "🪵",
    "🪶",
    "🪷",
    "🪸",
    "🪹",
  ],
  symbols: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
    "✝️",
    "☪️",
    "🕉️",
    "☸️",
    "✡️",
    "🔯",
    "🕎",
    "☯️",
    "☦️",
    "🛐",
    "⛎",
    "♈",
    "♉",
    "♊",
    "♋",
    "♌",
    "♍",
    "♎",
    "♏",
    "♐",
    "♑",
    "♒",
    "♓",
    "🆔",
    "⚛️",
    "🉑",
    "☢️",
    "☣️",
    "📴",
    "📳",
    "🈶",
    "🈚",
    "🈸",
    "🈺",
    "🈷️",
    "✴️",
    "🆚",
    "💮",
    "🉐",
    "㊙️",
    "㊗️",
    "🈴",
    "🈵",
    "🈹",
    "🈲",
    "🅰️",
    "🅱️",
    "🆎",
    "🆑",
    "🅾️",
    "🆘",
    "❌",
    "⭕",
    "🛑",
    "⛔",
    "📛",
    "🚫",
    "💯",
    "💢",
    "♨️",
  ],
});

// Search functionality
const searchQuery = ref("");

// Emoji search keywords (for better search)
const emojiKeywords = {
  "😀": ["smile", "happy", "grin", "face"],
  "😃": ["smile", "happy", "grin", "face"],
  "😄": ["smile", "happy", "grin", "face"],
  "😁": ["smile", "happy", "grin", "face"],
  "😆": ["laugh", "happy", "face"],
  "😅": ["sweat", "happy", "face"],
  "😂": ["laugh", "joy", "face"],
  "🤣": ["laugh", "joy", "face"],
  "😊": ["smile", "happy", "face"],
  "😇": ["angel", "happy", "face"],
  "🙂": ["smile", "happy", "face"],
  "🙃": ["upside", "down", "face"],
  "😉": ["wink", "face"],
  "😌": ["relieved", "face"],
  "😍": ["heart", "eyes", "love", "face"],
  "🥰": ["love", "face"],
  "😘": ["kiss", "love", "face"],
  "😗": ["kiss", "face"],
  "😙": ["kiss", "face"],
  "😚": ["kiss", "face"],
  "😋": ["tongue", "face"],
  "😛": ["tongue", "face"],
  "😝": ["tongue", "face"],
  "😜": ["tongue", "wink", "face"],
  "🤪": ["crazy", "face"],
  "🤨": ["suspicious", "face"],
  "🧐": ["monocle", "face"],
  "🤓": ["nerd", "face"],
  "😎": ["cool", "sunglasses", "face"],
  "🤩": ["star", "eyes", "face"],
  "🥳": ["party", "face"],
  "😏": ["smirk", "face"],
  "😒": ["unamused", "face"],
  "😞": ["disappointed", "face"],
  "😔": ["sad", "face"],
  "😟": ["worried", "face"],
  "😕": ["confused", "face"],
  "🙁": ["sad", "face"],
  "☹️": ["sad", "face"],
  "😣": ["sad", "face"],
  "😖": ["sad", "face"],
  "😫": ["tired", "face"],
  "😩": ["tired", "face"],
  "🥺": ["pleading", "face"],
  "😢": ["cry", "sad", "face"],
  "😭": ["cry", "sad", "face"],
  "😤": ["triumph", "face"],
  "😠": ["angry", "face"],
  "😡": ["angry", "face"],
  "🤬": ["angry", "face"],
  "🤯": ["exploding", "head", "face"],
  "😳": ["shocked", "face"],
  "🥵": ["hot", "face"],
  "🥶": ["cold", "face"],
  "😱": ["scream", "face"],
  "😨": ["fear", "face"],
  "😰": ["anxious", "face"],
  "😥": ["sad", "face"],
  "😓": ["sad", "face"],
  "🤗": ["hug", "face"],
  "🤔": ["thinking", "face"],
  "🤭": ["giggle", "face"],
  "🤫": ["shush", "face"],
  "🤥": ["lying", "face"],
  "😶": ["silent", "face"],
  "😐": ["neutral", "face"],
  "😑": ["expressionless", "face"],
  "😯": ["surprised", "face"],
  "😦": ["sad", "face"],
  "😧": ["anguished", "face"],
  "😮": ["surprised", "face"],
  "😲": ["astonished", "face"],
  "🥱": ["yawning", "face"],
  "😴": ["sleeping", "face"],
  "🤤": ["drooling", "face"],
  "😪": ["sleepy", "face"],
  "😵": ["dizzy", "face"],
  "🤐": ["zipper", "face"],
  "🥴": ["woozy", "face"],
  "🤢": ["nauseated", "face"],
  "🤮": ["vomiting", "face"],
  "🤧": ["sneezing", "face"],
  "😷": ["mask", "face"],
  "🤒": ["sick", "face"],
  "🤕": ["injured", "face"],
  "🤑": ["money", "face"],
  "🤠": ["cowboy", "face"],
  "💩": ["poop", "face"],
  "👻": ["ghost", "face"],
  "👽": ["alien", "face"],
  "🤖": ["robot", "face"],
  "😈": ["devil", "face"],
  "👿": ["angry", "devil", "face"],
  "👹": ["ogre", "face"],
  "👺": ["goblin", "face"],
  "💀": ["skull", "face"],
  "☠️": ["skull", "face"],
  "😺": ["cat", "smile", "face"],
  "😸": ["cat", "grin", "face"],
  "😹": ["cat", "joy", "face"],
  "😻": ["cat", "heart", "face"],
  "😼": ["cat", "smirk", "face"],
  "😽": ["cat", "kiss", "face"],
  "🙀": ["cat", "scream", "face"],
  "😿": ["cat", "cry", "face"],
  "😾": ["cat", "pout", "face"],
  "🙈": ["monkey", "see", "face"],
  "🙉": ["monkey", "hear", "face"],
  "🙊": ["monkey", "speak", "face"],
  "❤️": ["heart", "love", "red"],
  "🧡": ["heart", "love", "orange"],
  "💛": ["heart", "love", "yellow"],
  "💚": ["heart", "love", "green"],
  "💙": ["heart", "love", "blue"],
  "💜": ["heart", "love", "purple"],
  "🖤": ["heart", "love", "black"],
  "🤍": ["heart", "love", "white"],
  "🤎": ["heart", "love", "brown"],
  "💔": ["heart", "broken", "love"],
  "❣️": ["heart", "love"],
  "💕": ["heart", "love"],
  "💞": ["heart", "love"],
  "💓": ["heart", "love"],
  "💗": ["heart", "love"],
  "💖": ["heart", "love"],
  "💘": ["heart", "love"],
  "💝": ["heart", "love"],
  "💟": ["heart", "love"],
  "🐶": ["dog", "animal", "pet"],
  "🐱": ["cat", "animal", "pet"],
  "🐭": ["mouse", "animal"],
  "🐹": ["hamster", "animal"],
  "🐰": ["rabbit", "animal"],
  "🦊": ["fox", "animal"],
  "🐻": ["bear", "animal"],
  "🐼": ["panda", "animal"],
  "🐨": ["koala", "animal"],
  "🐯": ["tiger", "animal"],
  "🦁": ["lion", "animal"],
  "🐮": ["cow", "animal"],
  "🐷": ["pig", "animal"],
  "🐸": ["frog", "animal"],
  "🐵": ["monkey", "animal"],
  "🍕": ["pizza", "food"],
  "🍔": ["burger", "food"],
  "🍟": ["fries", "food"],
  "🌭": ["hotdog", "food"],
  "🍿": ["popcorn", "food"],
  "🍪": ["cookie", "food"],
  "🍰": ["cake", "food"],
  "🍦": ["ice", "cream", "food"],
  "🍩": ["donut", "food"],
  "🍺": ["beer", "drink"],
  "🍷": ["wine", "drink"],
  "☕": ["coffee", "drink"],
  "🍵": ["tea", "drink"],
  "🏀": ["basketball", "sport"],
  "⚽": ["football", "soccer", "sport"],
  "🏈": ["football", "sport"],
  "⚾": ["baseball", "sport"],
  "🎾": ["tennis", "sport"],
  "🚗": ["car", "vehicle", "transport"],
  "🚕": ["taxi", "vehicle", "transport"],
  "🚙": ["car", "vehicle", "transport"],
  "🚌": ["bus", "vehicle", "transport"],
  "✈️": ["plane", "airplane", "transport"],
  "🚀": ["rocket", "transport"],
  "🚁": ["helicopter", "transport"],
  "💡": ["lightbulb", "idea", "light"],
  "🔦": ["flashlight", "light"],
  "💰": ["money", "cash"],
  "💳": ["credit", "card", "money"],
  "💎": ["diamond", "gem"],
  "🎁": ["gift", "present"],
  "🎈": ["balloon", "party"],
  "🎉": ["party", "celebration"],
  "🎊": ["party", "celebration"],
  "🎋": ["bamboo", "tree"],
  "🎍": ["pine", "decoration"],
  "🎎": ["doll", "japanese"],
  "🎏": ["carp", "banner"],
  "🎐": ["wind", "chime"],
  "🎑": ["moon", "viewing"],
  "🎀": ["ribbon", "bow"],
  "🎗️": ["ribbon", "remembrance"],
  "🎟️": ["ticket", "admission"],
  "🎫": ["ticket"],
  "🎪": ["circus", "tent"],
  "🎭": ["performing", "arts"],
  "🎨": ["art", "palette"],
  "🎬": ["clapper", "board"],
  "🎤": ["microphone", "karaoke"],
  "🎧": ["headphones", "music"],
  "🎼": ["musical", "score"],
  "🎹": ["piano", "musical"],
  "🎸": ["guitar", "musical"],
  "🎺": ["trumpet", "musical"],
  "🎻": ["violin", "musical"],
  "🥁": ["drum", "musical"],
  "📱": ["phone", "mobile", "device"],
  "📲": ["phone", "mobile", "device"],
  "💻": ["computer", "laptop", "device"],
  "🖥️": ["computer", "desktop", "device"],
  "🖨️": ["printer", "device"],
  "⌨️": ["keyboard", "device"],
  "🖱️": ["mouse", "computer", "device"],
  "🖲️": ["trackball", "device"],
  "💽": ["disk", "storage"],
  "💾": ["floppy", "disk", "storage"],
  "💿": ["cd", "disk", "storage"],
  "📀": ["dvd", "disk", "storage"],
  "🎥": ["movie", "camera"],
  "📺": ["tv", "television"],
  "📷": ["camera", "photo"],
  "📸": ["camera", "flash", "photo"],
  "📹": ["video", "camera"],
  "📼": ["vhs", "video"],
  "🔍": ["magnifying", "glass", "search"],
  "🔎": ["magnifying", "glass", "search"],
  "🔏": ["lock", "security"],
  "🔐": ["lock", "security"],
  "🔑": ["key", "security"],
  "🗝️": ["key", "old", "security"],
  "🔨": ["hammer", "tool"],
  "🪛": ["screwdriver", "tool"],
  "🔧": ["wrench", "tool"],
  "🪜": ["ladder", "tool"],
  "⚙️": ["gear", "mechanical"],
  "🗜️": ["compression", "tool"],
  "⚖️": ["balance", "scale", "justice"],
  "🦯": ["probing", "cane", "accessibility"],
  "🔗": ["link", "chain"],
  "⛓️": ["chains", "link"],
  "🧰": ["toolbox", "tools"],
  "🧲": ["magnet", "attraction"],
  "⚗️": ["alembic", "chemistry"],
  "🧪": ["test", "tube", "chemistry"],
  "🧫": ["petri", "dish", "biology"],
  "🧬": ["dna", "helix", "biology"],
  "🔬": ["microscope", "science"],
  "🔭": ["telescope", "science"],
  "📡": ["satellite", "antenna"],
  "💉": ["syringe", "medical"],
  "🩸": ["drop", "blood", "medical"],
  "💊": ["pill", "medicine", "medical"],
  "🩹": ["bandage", "medical"],
  "🩺": ["stethoscope", "medical"],
  "🩻": ["x-ray", "medical"],
  "🩼": ["crutch", "medical"],
  "🩽": ["medical", "device"],
  "🩾": ["medical", "device"],
  "🩿": ["medical", "device"],
  "🪞": ["mirror", "reflection"],
  "🪟": ["window", "glass"],
  "🪠": ["plunger", "toilet"],
  "🪡": ["sewing", "needle"],
  "🪢": ["knot", "rope"],
  "🧿": ["nazar", "amulet", "protection"],
  "🪣": ["bucket", "container"],
  "🪤": ["mouse", "trap"],
  "🪥": ["toothbrush", "hygiene"],
  "🪦": ["headstone", "grave"],
  "🪧": ["placard", "sign"],
  "🪨": ["rock", "stone"],
  "🪩": ["mirror", "ball", "disco"],
  "🪪": ["identity", "card"],
  "🪫": ["battery", "low"],
  "🪬": ["hamsa", "hand", "protection"],
  "🪭": ["fan", "folding"],
  "🪮": ["hair", "pick"],
  "🪯": ["khanda", "sword"],
  "🪰": ["fly", "insect"],
  "🪱": ["worm", "invertebrate"],
  "🪲": ["beetle", "insect"],
  "🪳": ["cockroach", "insect"],
  "🪴": ["potted", "plant"],
  "🪵": ["wood", "log"],
  "🪶": ["feather", "bird"],
  "🪷": ["lotus", "flower"],
  "🪸": ["coral", "ocean"],
  "🪹": ["nest", "bird"],
  "🪺": ["egg", "nest"],
  "🪻": ["hyacinth", "flower"],
  "🪼": ["jellyfish", "ocean"],
  "🪽": ["wing", "bird"],
  "🪾": ["flamingo", "bird"],
  "🪿": ["goose", "bird"],
  "🫀": ["anatomical", "heart"],
  "🫁": ["lungs", "anatomy"],
  "🫂": ["people", "hugging"],
  "🫃": ["pregnant", "man"],
  "🫄": ["pregnant", "person"],
  "🫅": ["person", "crown"],
  "🫆": ["person", "mouth"],
  "🫇": ["person", "ear"],
  "🫈": ["person", "nose"],
  "🫉": ["person", "eye"],
  "🫊": ["person", "brain"],
  "🫋": ["person", "heart"],
  "🫌": ["person", "lungs"],
  "🫍": ["person", "kidney"],
  "🫎": ["person", "liver"],
  "🫏": ["person", "stomach"],
  "🫐": ["blueberries", "fruit"],
  "🫑": ["bell", "pepper", "vegetable"],
  "🫒": ["olive", "fruit"],
  "🫓": ["flatbread", "food"],
  "🫔": ["tamale", "food"],
  "🫕": ["fondue", "food"],
  "🫖": ["teapot", "drink"],
  "🫗": ["pouring", "liquid"],
  "🫘": ["beans", "legume"],
  "🫙": ["jar", "container"],
  "🫚": ["ginger", "root"],
  "🫛": ["pea", "pod", "vegetable"],
  "🫜": ["leaf", "vegetable"],
  "🫝": ["lotus", "root", "vegetable"],
  "🫞": ["cheese", "wedge"],
  "🫟": ["cheese", "string"],
  "🫠": ["melting", "face"],
  "🫡": ["saluting", "face"],
  "🫢": ["face", "with", "peeking", "eye"],
  "🫣": ["face", "with", "peeking", "eye"],
  "🫤": ["face", "with", "diagonal", "mouth"],
  "🫥": ["dotted", "line", "face"],
  "🫦": ["biting", "lip", "face"],
  "🫧": ["bubbles", "soap"],
  "🫨": ["shaking", "face"],
  "🫩": ["head", "shaking", "horizontally"],
  "🫪": ["head", "shaking", "vertically"],
  "🫫": ["rolling", "eyes", "face"],
  "🫬": ["face", "with", "spiral", "eyes"],
  "🫭": ["face", "with", "crossed", "out", "eyes"],
  "🫮": ["face", "with", "crossed", "out", "mouth"],
  "🫯": ["face", "with", "crossed", "out", "nose"],
  "🫰": ["hand", "with", "index", "finger", "and", "thumb", "crossed"],
  "🫱": ["rightwards", "hand"],
  "🫲": ["leftwards", "hand"],
  "🫳": ["palm", "down", "hand"],
  "🫴": ["palm", "up", "hand"],
  "🫵": ["index", "pointing", "at", "viewer"],
  "🫶": ["heart", "hands"],
  "🫷": ["leftwards", "pushing", "hand"],
  "🫸": ["rightwards", "pushing", "hand"],
  "🫹": ["pinching", "hand"],
  "🫺": ["hand", "with", "index", "finger", "and", "thumb", "crossed"],
  "🫻": ["hand", "with", "index", "finger", "and", "thumb", "crossed"],
  "🫼": ["hand", "with", "index", "finger", "and", "thumb", "crossed"],
  "🫽": ["hand", "with", "index", "finger", "and", "thumb", "crossed"],
  "🫾": ["hand", "with", "index", "finger", "and", "thumb", "crossed"],
  "🫿": ["hand", "with", "index", "finger", "and", "thumb", "crossed"],
};

// Current emojis based on selected category and search
const currentEmojis = computed(() => {
  let emojis =
    emojiCategories.value[selectedCategory.value] ||
    emojiCategories.value.smileys;

  // Filter by search query if provided
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    // Search through all categories when searching
    const allEmojis = Object.values(emojiCategories.value).flat();
    emojis = allEmojis.filter((emoji) => {
      // Check if emoji has keywords and if any keyword matches the search
      const keywords = emojiKeywords[emoji];
      if (keywords) {
        return keywords.some((keyword) => keyword.includes(query));
      }
      // If no keywords, just return the emoji (fallback)
      return true;
    });
  }

  return emojis;
});

let isMounted = true;
onBeforeUnmount(() => {
  isMounted = false;
});

const getConversationName = (conversation) => {
  return (
    conversation.contact?.name ||
    conversation.contact?.phone_number ||
    "Unknown Contact"
  );
};

const getConversationAvatar = (conversation) => {
  return (
    conversation.contact?.avatar_url ||
    `https://ui-avatars.com/api/?name=${getConversationName(
      conversation
    )}&background=random`
  );
};

// Reactive variable to store current channel status
const channelStatus = ref("Connected");

// Function to fetch and update channel status
const updateChannelStatus = async (conversation) => {
  if (!conversation || !conversation.chanel || !conversation.chanel.id) {
    channelStatus.value = "Not Connected";
    return;
  }

  try {
    const chanelData = await getchanelById(conversation.chanel.id);
    if (chanelData && chanelData.is_active) {
      channelStatus.value = "Connected";
    } else {
      channelStatus.value = "Not Connected";
    }
  } catch (error) {
    console.error("Error fetching channel status:", error);
    channelStatus.value = "Not Connected";
  }
};

const getConversationStatus = (conversation) => {
  // Update channel status asynchronously
  updateChannelStatus(conversation);
  // Return the current cached status
  return channelStatus.value;
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: undefined,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function shouldShowDate(messages, idx) {
  if (idx === 0) return true;
  const prev = messages[idx - 1];
  const curr = messages[idx];
  return formatDate(prev.created_at) !== formatDate(curr.created_at);
}

function normalizePhone(num) {
  if (!num) return "";
  return String(num)
    .replace(/^\+?0?/, "")
    .replace(/[^0-9]/g, "");
}

// Emoji functions
function addEmoji(emoji) {
  newMessage.value += emoji;
  showEmojiPicker.value = false;
  messageInput.value?.focus();
}

function selectEmojiCategory(category) {
  selectedCategory.value = category;
  // Clear search when changing category
  searchQuery.value = "";
}

function handleSearch() {
  // Search functionality is handled by the computed property
  // This function can be used for additional search logic if needed
}

// Image attachment functions
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    selectedImage.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
      // Automatically show caption popup when image is selected
      showCaptionPopup.value = true;
    };
    reader.readAsDataURL(file);
  }
}

function removeImage() {
  selectedImage.value = null;
  imagePreview.value = "";
  imageCaption.value = "";
  showCaptionPopup.value = false;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

function clearImageCaption() {
  imageCaption.value = "";
}

function sendMessageFromPopup() {
  showCaptionPopup.value = false;
  sendMessage();
}

const sendMessage = async () => {
  if (
    !props.selectedConversation ||
    (!String(newMessage.value).trim() && !selectedImage.value)
  )
    return;

  sending.value = true;
  try {
    let mediaUrl = null;

    // Upload image to Supabase first if selected
    if (selectedImage.value) {
      const formData = new FormData();
      formData.append("image", selectedImage.value);

      try {
        const uploadResponse = await $fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.error) {
          throw new Error(uploadResponse.message || "Failed to upload image");
        }

        mediaUrl = uploadResponse.url;
      } catch (error) {
        console.error("Error uploading image to Supabase:", error);
        throw new Error(
          "Gagal mengupload gambar ke Supabase: " + error.message
        );
      }
    }

    // Now send message with image URL to WAHA
    await addMessage({
      agent_id: props.selectedConversation.agent.id,
      contact_id: props.selectedConversation.contact.id,
      chanel_id: props.selectedConversation.chanel.id,
      content: selectedImage.value
        ? imageCaption.value.trim() || newMessage.value.trim()
        : newMessage.value.trim(),
      direction: "outbound",
      message_type: selectedImage.value ? "image" : "text",
      media_url: mediaUrl,
      is_read: true,
    });

    // Clear inputs
    newMessage.value = "";
    removeImage();
    
    // Add message to the correct local array
    if (props.selectedConversation?.agent?.type === "ai") {
      // For AI agents, we need to fetch the message again as it might have been processed
      const aiMsgs = await fetchMessagesByGroupAi(
        props.selectedConversation.agent.id,
        props.selectedConversation.contact.id,
        props.selectedConversation.chanel.id
      );
      aiMessages.value = aiMsgs || [];
    } else if (props.selectedConversation?.agent?.type === "manusia") {
      // For human agents, add the message to the local array
      // Note: We're not directly adding to humanMessages.value here because
      // the periodic refresh will update it, but we could also add it directly
      const humanMsgs = await fetchMessagesByGroupManusia(
        props.selectedConversation.agent.id,
        props.selectedConversation.contact.id,
        props.selectedConversation.chanel.id
      );
      humanMessages.value = humanMsgs || [];
    }
    
    showToast({ message: "Pesan berhasil dikirim", type: "success" });
  } catch (error) {
    console.error("Error sending message:", error);
    showToast({
      message: error.message || "Gagal mengirim pesan",
      type: "error",
    });
  } finally {
    sending.value = false;
  }
};

const sortedMessages = computed(() => {
  return [...displayMessages.value].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
});

// Auto-resize textarea
watch(newMessage, () => {
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = "auto";
      messageInput.value.style.height = messageInput.value.scrollHeight + "px";
    }
  });
});

// Watch for conversation changes and load messages
watch(
  () => props.selectedConversation,
  async (newConversation) => {
    // Clear any existing interval
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
      refreshInterval.value = null;
    }
    
    if (!isMounted) return;
    try {
      if (newConversation) {
        if (newConversation.agent.type === "ai") {
          const aiMsgs = await fetchMessagesByGroupAi(
            newConversation.agent.id,
            newConversation.contact.id,
            newConversation.chanel.id
          );
          aiMessages.value = aiMsgs || [];
        }
        if (newConversation.agent.type === "manusia") {
          const humanMsgs = await fetchMessagesByGroupManusia(
            newConversation.agent.id,
            newConversation.contact.id,
            newConversation.chanel.id
          );
          humanMessages.value = humanMsgs || [];
          
          // Set up periodic refresh if channel is active
          // First check the current channel status from database
          try {
            const chanelData = await getchanelById(newConversation.chanel.id);
            if (chanelData && chanelData.is_active) {
              refreshInterval.value = setInterval(async () => {
                if (isMounted && props.selectedConversation) {
                  try {
                    const humanMsgs = await fetchMessagesByGroupManusia(
                      props.selectedConversation.agent.id,
                      props.selectedConversation.contact.id,
                      props.selectedConversation.chanel.id
                    );
                    humanMessages.value = humanMsgs || [];
                    
                    // Update humanMessages with read status for inbound messages
                    humanMessages.value = humanMessages.value.map(msg => ({
                      ...msg,
                      is_read: msg.direction === "inbound" ? true : msg.is_read
                    }));
                  } catch (err) {
                    console.error("[InboxMain] Error refreshing messages:", err);
                  }
                }
              }, 30000); // 30 seconds
            }
          } catch (error) {
            console.error("Error checking channel status for refresh:", error);
          }
        }
        if (!isMounted) return;
        await markMessagesAsRead(
          newConversation.agent.id,
          newConversation.contact.id,
          newConversation.chanel.id
        );
        
        // Update our local arrays with the read status
        if (newConversation.agent.type === "ai") {
          // Update aiMessages with read status
          aiMessages.value = aiMessages.value.map(msg => ({
            ...msg,
            is_read: msg.direction === "inbound" ? true : msg.is_read
          }));
        } else if (newConversation.agent.type === "manusia") {
          // Update humanMessages with read status
          humanMessages.value = humanMessages.value.map(msg => ({
            ...msg,
            is_read: msg.direction === "inbound" ? true : msg.is_read
          }));
        }
        if (!isMounted) return;
      }
    } catch (err) {
      console.error("[InboxMain] Error in watcher:", err);
    }
  },
  { immediate: true }
);

// Clear interval on unmount
onBeforeUnmount(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
  isMounted = false;
});
</script>