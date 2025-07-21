<template>
  <div class="flex h-[calc(100vh-40px)]">
    <!-- Sidebar -->
    <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div class="p-5 text-lg font-bold border-b border-gray-200 text-gray-800">
        Agen AI
      </div>
      <div class="flex-1 overflow-y-auto">
        <AgentAIList
          :ai-list="aiAgents"
          :selected="selectedAI"
          @select="onSelectAI"
          @add="onAddAI"
          sidebar
        />
      </div>
    </div>
    <!-- Main Content -->
    <div class="flex-1 flex flex-col bg-gray-100">
      <template v-if="selectedAI && selectedAI.id">
        <div class="px-8 pt-6 flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            {{ selectedAI.name }}
          </h2>
          <div class="flex gap-3 items-center">
            <button
              class="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-2 text-base cursor-pointer flex items-center gap-2"
              @click="onSaveAll"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="lucide"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"
                />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Simpan Semua
            </button>
            <button
              class="bg-blue-700 text-white rounded-lg px-6 py-2 text-base cursor-pointer flex items-center gap-2 ml-4"
              @click="showChatModal = true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="lucide"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4A8.5 8.5 0 0 1 3 12.5c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5Z"
                />
                <path d="M8 12h.01" />
                <path d="M12 12h.01" />
                <path d="M16 12h.01" />
              </svg>
              Chat Agent
            </button>
          </div>
        </div>
        <div
          v-if="showChatModal"
          class="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
        >
          <div
            class="bg-white rounded-xl shadow-lg w-[900px] max-w-[99vw] flex flex-col overflow-hidden"
          >
            <div
              class="px-5 py-4 bg-blue-50 font-semibold flex justify-between items-center border-b border-gray-200"
            >
              <span
                >Chat dengan
                {{ selectedAI && selectedAI.name ? selectedAI.name : "" }}</span
              >
              <button
                class="bg-none border-none text-xl cursor-pointer"
                @click="showChatModal = false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="lucide"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div
              class="p-5 min-h-[120px] flex flex-col gap-3 overflow-y-auto max-h-[300px]"
            >
              <div
                v-if="chatMessages.length === 0 && !chatLoading"
                class="text-gray-400 text-center py-6"
              >
                Belum ada chat
              </div>
              <div
                v-for="(msg, idx) in chatMessages"
                :key="idx"
                :class="[
                  'mb-2',
                  msg.from === 'ai'
                    ? 'flex flex-col items-start'
                    : 'flex flex-col items-end',
                ]"
              >
                <!-- Bubble text -->
                <div
                  :class="[
                    'px-4 py-2 rounded-lg max-w-[70%] break-words',
                    msg.from === 'ai'
                      ? 'bg-blue-50 text-left'
                      : 'bg-blue-100 ml-auto text-right',
                  ]"
                >
                  <div class="whitespace-pre-line">{{ msg.text }}</div>
                </div>
                <!-- Bubble gambar (jika ada) -->
                <div
                  v-if="msg.images && msg.images.length"
                  class="flex flex-wrap gap-2 mt-1"
                  style="max-width: 70%"
                >
                  <div
                    v-for="(img, i) in msg.images"
                    :key="i"
                    class="bg-blue-50 rounded-lg p-2 shadow border max-w-[180px] max-h-[220px] flex items-center justify-center"
                    style="margin-top: 2px"
                  >
                    <img
                      :src="img"
                      class="max-w-[160px] max-h-[180px] rounded"
                      style="display: block; margin: 0 auto"
                      :alt="'Gambar AI ' + (i + 1)"
                    />
                  </div>
                </div>
              </div>
              <div v-if="chatLoading" class="text-blue-500 text-center py-2">
                AI sedang mengetik...
              </div>
            </div>
            <div class="flex gap-2 px-5 py-4 border-t border-gray-200">
              <input
                v-model="chatInput"
                type="text"
                placeholder="Ketik pesan..."
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-base"
                @keyup.enter="sendChat"
              />
              <button
                class="bg-blue-700 text-white rounded-lg px-4 py-2 text-base cursor-pointer"
                @click="sendChat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="lucide"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <!-- Agent Name Display -->
        <div class="px-8 pt-6 pb-2">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm"
            >
              {{
                selectedAI.name ? selectedAI.name.charAt(0).toUpperCase() : "A"
              }}
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">
                {{ selectedAI.name }}
              </h1>
              <p class="text-gray-500 text-sm">
                {{ selectedAI.description || "Tidak ada deskripsi" }}
              </p>
            </div>
          </div>
        </div>

        <div class="px-8 pt-2 flex gap-6 mb-6 border-b border-gray-200">
          <button
            v-for="t in ['gaya', 'pengetahuan', 'edit']"
            :key="t"
            :class="[
              'px-5 py-2 font-medium border-b-2',
              tab === t
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-700 border-transparent',
              'transition-colors duration-200',
            ]"
            @click="tab = t"
          >
            {{ t.charAt(0).toUpperCase() + t.slice(1) }}
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-8 py-4">
          <div v-if="tab === 'gaya'">
            <div class="agentai-subtabs">
              <button
                class="agentai-subtab-btn"
                :class="{ active: subtab === 'gaya' }"
                @click="subtab = 'gaya'"
              >
                Gaya Bicara
              </button>
              <button
                class="agentai-subtab-btn"
                :class="{ active: subtab === 'handover' }"
                @click="subtab = 'handover'"
              >
                Kondisi Handover
              </button>
              <button
                class="agentai-subtab-btn"
                :class="{ active: subtab === 'followup' }"
                @click="subtab = 'followup'"
              >
                Followup
              </button>
              <button
                class="agentai-subtab-btn"
                :class="{ active: subtab === 'kirim' }"
                @click="subtab = 'kirim'"
              >
                Kirim Gambar
              </button>
            </div>
            <div v-if="subtab === 'gaya'">
              <h3 class="font-semibold text-lg mb-2">Gaya bicara Agent</h3>
              <div class="mb-2 text-gray-500">Maximum 28/15000 karakter</div>
              <textarea
                v-model="selectedAI.gayaBicara"
                class="w-full h-30 p-3 text-base border border-gray-300 rounded-lg resize-y"
              ></textarea>
              <div class="mt-2">
                <a href="#" class="text-blue-600 no-underline"
                  >Lihat template gaya bicara agent</a
                >
              </div>
            </div>
            <div v-else-if="subtab === 'handover'">
              <h3 class="font-semibold text-lg mb-2">Buat Kondisi Handover</h3>
              <div class="mb-2">
                Agen AI akan berhenti saat pelanggan mengirim pesan dengan kata
                kunci
              </div>
              <textarea
                v-model="handoverInput"
                placeholder="e.g. saya ingin bicara dengan atasan anda"
                class="w-full h-18 p-3 text-base border border-gray-300 rounded-lg resize-y mb-4"
              ></textarea>
              <button
                @click="addHandover"
                class="bg-blue-700 text-white border-none rounded-xl px-7 py-2.5 text-base cursor-pointer mb-6"
              >
                Tambahkan Kondisi Handover
              </button>
              <div class="mt-4 font-medium">Kondisi Handover</div>
              <div
                v-if="
                  !selectedAI.handoverList ||
                  selectedAI.handoverList.length === 0
                "
                class="text-gray-500 mt-2"
              >
                Belum ada Kondisi Handover
              </div>
              <div v-else class="mt-2 border rounded p-3">
                <div
                  v-for="item in selectedAI.handoverList"
                  :key="item.id"
                  class="mb-2 flex items-center"
                >
                  <span v-if="editingHandoverId !== item.id">
                    Agen AI akan berhenti saat pelanggan mengirim pesan dengan
                    kata kunci <b>{{ item.text }}</b>
                  </span>
                  <span v-else class="flex-1">
                    <input
                      v-model="editingHandoverText"
                      class="border rounded px-2 py-1 w-64 mr-2"
                    />
                    <button
                      @click="saveEditHandover(item)"
                      class="bg-blue-600 text-white px-2 py-1 rounded mr-1"
                    >
                      Simpan
                    </button>
                    <button
                      @click="cancelEditHandover"
                      class="bg-gray-300 text-black px-2 py-1 rounded"
                    >
                      Batal
                    </button>
                  </span>
                  <div
                    v-if="editingHandoverId !== item.id"
                    class="ml-2 flex gap-2"
                  >
                    <button
                      @click="editHandover(item)"
                      class="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Ubah
                    </button>
                    <button
                      @click="deleteHandover(item)"
                      class="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="subtab === 'followup'">
              <h3 class="font-semibold text-lg mb-2">Buat Kondisi Followup</h3>
              <div class="mb-2">
                Saat pelanggan mengirim pesan dengan kata kunci
              </div>
              <textarea
                v-model="selectedAI.followupKeyword"
                placeholder="cth: saya ingin booking"
                class="w-full h-15 p-3 text-base border border-gray-300 rounded-lg resize-y mb-4"
              ></textarea>
              <div class="mb-2">
                Agen AI akan
                <button
                  type="button"
                  class="followup-btn"
                  :class="{ active: selectedAI.followupMode === 'generate' }"
                  @click="selectedAI.followupMode = 'generate'"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="lucide"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3v2" />
                    <path d="m16.6 7 1.4-1.4" />
                    <path d="M19 12h2" />
                    <path d="m16.6 17 1.4 1.4" />
                    <path d="M12 19v2" />
                    <path d="m6.4 17-1.4 1.4" />
                    <path d="M3 12H1" />
                    <path d="m6.4 7-1.4-1.4" />
                    <circle cx="12" cy="12" r="5" />
                  </svg>
                  Generate Balasan
                </button>
                /
                <button
                  type="button"
                  class="followup-btn"
                  :class="{ active: selectedAI.followupMode === 'manual' }"
                  @click="selectedAI.followupMode = 'manual'"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="lucide"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 20h9" />
                    <path
                      d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 2 21l1.5-5L16.5 3.5Z"
                    />
                  </svg>
                  Mengirim Balasan
                </button>
              </div>
              <form @submit.prevent="addFollowup">
                <textarea
                  v-model="selectedAI.followupReply"
                  placeholder="e.g. tanyakan apakah customer masih ingin booking"
                  class="w-full h-15 p-3 text-base border border-gray-300 rounded-lg resize-y mb-4"
                ></textarea>
                <div class="mb-2">apabila pelanggan tidak membalas setelah</div>
                <div class="followup-delay-group">
                  <button
                    v-for="(label, idx) in followupDelays"
                    :key="idx"
                    type="button"
                    class="followup-delay-btn"
                    :class="{ active: selectedAI.followupDelay === label }"
                    @click="selectedAI.followupDelay = label"
                  >
                    {{ label }}
                  </button>
                </div>
                <button
                  type="submit"
                  class="mt-4 bg-blue-700 text-white hover:bg-blue-500 border-none rounded-xl px-6 py-3 text-base flex items-center gap-2"
                >
                  Submit
                </button>
              </form>
              <div class="mt-6 font-medium">Followup</div>
              <div
                v-if="
                  !selectedAI.followupList ||
                  selectedAI.followupList.length === 0
                "
                class="text-gray-500 mt-2"
              >
                Belum ada Kondisi Followup
              </div>
              <div v-else class="mt-2 border rounded p-3">
                <div
                  v-for="(item, idx) in selectedAI.followupList"
                  :key="item.id || idx"
                  class="mb-2 flex items-center gap-2"
                >
                  <div class="flex-1">
                    <b>Kata kunci:</b> {{ item.keyword }}<br />
                    <b>Mode:</b> {{ item.mode }}<br />
                    <b>Reply:</b> {{ item.reply }}<br />
                    <b>Delay:</b> {{ item.delay }}
                  </div>
                  <button
                    class="bg-blue-600 text-white px-3 py-1 rounded"
                    @click="editFollowup(idx)"
                  >
                    Ubah
                  </button>
                  <button
                    class="bg-red-500 text-white px-3 py-1 rounded"
                    @click="deleteFollowup(idx)"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
            <div v-else-if="subtab === 'kirim'">
              <h3 class="font-semibold text-lg mb-2">
                Buat Kondisi Kirim Gambar
              </h3>
              <div class="mb-2">
                Saat pelanggan mengirim pesan dengan kata kunci
              </div>
              <input
                v-model="kirimGambarKeyword"
                placeholder="e.g. boleh minta gambar produknya"
                class="w-full mb-2 px-3 py-2 border rounded"
              />
              <input
                v-model="kirimGambarUrl"
                placeholder="URL gambar"
                class="w-full mb-2 px-3 py-2 border rounded"
              />
              <button
                @click="addKirimGambar"
                class="bg-blue-700 text-white border-none rounded-xl px-4 py-2.5 text-base mb-4 cursor-pointer"
              >
                Tambah Kondisi Kirim Gambar
              </button>
              <div class="mt-6 font-medium">Kondisi Kirim Gambar</div>
              <div
                v-if="
                  !selectedAI.kirimGambarList ||
                  selectedAI.kirimGambarList.length === 0
                "
                class="text-gray-500 mt-2"
              >
                Belum ada Kondisi Kirim Gambar
              </div>
              <div v-else class="mt-2 border rounded p-3">
                <div
                  v-for="item in selectedAI.kirimGambarList"
                  :key="item.id"
                  class="mb-2 flex items-center"
                >
                  <span v-if="editingKirimGambarId !== item.id">
                    <b>{{ item.keyword }}</b> -
                    <a
                      :href="item.imageUrl"
                      target="_blank"
                      class="text-blue-600 underline"
                      >Lihat Gambar</a
                    >
                  </span>
                  <span v-else class="flex-1">
                    <input
                      v-model="editingKirimGambarKeyword"
                      class="border rounded px-2 py-1 w-40 mr-2"
                    />
                    <input
                      v-model="editingKirimGambarUrl"
                      class="border rounded px-2 py-1 w-40 mr-2"
                    />
                    <button
                      @click="saveEditKirimGambar(item)"
                      class="bg-blue-600 text-white px-2 py-1 rounded mr-1"
                    >
                      Simpan
                    </button>
                    <button
                      @click="cancelEditKirimGambar"
                      class="bg-gray-300 text-black px-2 py-1 rounded"
                    >
                      Batal
                    </button>
                  </span>
                  <div
                    v-if="editingKirimGambarId !== item.id"
                    class="ml-2 flex gap-2"
                  >
                    <button
                      @click="editKirimGambar(item)"
                      class="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Ubah
                    </button>
                    <button
                      @click="deleteKirimGambar(item)"
                      class="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="tab === 'pengetahuan'">
            <div class="font-semibold mb-0.5">Pengetahuan Agent</div>
            <div class="text-gray-500 mb-3">
              Tambahkan informasi Produk, Tutorial Penggunaan, SOP, FAQ, dan
              lainnya. Tidak ada limit maximum.
            </div>
            <textarea
              v-model="selectedAI.pengetahuan"
              class="w-full min-h-[180px] p-3 text-base border border-gray-300 rounded-lg resize-y"
              placeholder="Add Agent's knowledege here"
            >
Add Agent's knowledege here</textarea
            >
          </div>

          <div v-else-if="tab === 'edit'">
            <h3 class="font-semibold text-lg mb-4">Edit Agen</h3>
            <form @submit.prevent style="max-width: 900px">
              <div style="margin-bottom: 18px">
                <label style="font-weight: 600">Nama</label>
                <input
                  v-model="selectedAI.name"
                  type="text"
                  style="
                    width: 100%;
                    padding: 10px;
                    font-size: 1em;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    margin-top: 4px;
                  "
                  placeholder="Nama Agent"
                />
              </div>
              <div style="margin-bottom: 18px">
                <label style="font-weight: 600">Description</label>
                <input
                  v-model="selectedAI.description"
                  type="text"
                  style="
                    width: 100%;
                    padding: 10px;
                    font-size: 1em;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    margin-top: 4px;
                  "
                  placeholder="Deskripsi Agent"
                />
              </div>
              <div style="margin-bottom: 18px">
                <label style="font-weight: 600">Kepintaran AI</label>
                <select
                  v-model="selectedAI.kepintaran"
                  style="
                    width: 100%;
                    padding: 10px;
                    font-size: 1em;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    margin-top: 4px;
                  "
                >
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </form>
            <div class="mt-8">
              <div class="font-semibold mb-1">Hapus Agen</div>
              <div class="text-gray-500 mb-3">
                Bila dilakukan, tindakan ini tidak bisa dikembalikan
              </div>
              <button
                class="bg-blue-700 text-white border-none rounded-lg px-7 py-2.5 text-base cursor-pointer"
                @click="onDeleteAgent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="lucide"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0v10m4-10v10"
                  />
                </svg>
                Hapus
              </button>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          class="flex flex-1 items-center justify-center text-gray-400 text-xl"
        >
          Pilih agent AI untuk melihat detail
        </div>
      </template>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import AgentAIList from "./AgentAIList.vue";
import { useAgentStore } from "~/composables/useAgents";
import { useAgentAIStore } from "~/composables/useAgentAI";
import { useChanelstore } from "~/composables/useChanels";
import { useChanelAgentConnectionStore } from "~/composables/useChanelAgentConnections";
import { useToast } from "~/composables/useToast";

const { showToast } = useToast();
// Ambil config WAHA hanya dari import.meta.env
const baseUrl = import.meta.env.VITE_BASE_URL_WAHA;
const wahaApiKey = import.meta.env.VITE_WAHA_API;

const { aiAgents, fetchAgentsByType, updateAgent } = useAgentStore();
const { getAIConfigByAgentId, saveAIConfig } = useAgentAIStore();
const { chanels, fetchchanels } = useChanelstore();
const {
  connections: chanelConnectionsData,
  loading: chanelConnectionsLoading,
  error: chanelConnectionsError,
  connectAgentTochanel,
  disconnectAgentFromchanel,
  isAgentConnectedTochanel,
  getActiveAgentForchanel,
  fetchConnectionsBychanel,
  fetchConnections,
} = useChanelAgentConnectionStore();

// Local state for connection management
const connecting = ref(false);
const chanelConnections = ref([]);
const activeAgentsPerchanel = ref({});

const tab = ref("gaya");
const subtab = ref("gaya");
const selectedAI = ref({});
const emit = defineEmits(["refresh-ai-list"]);

// Load AI agents from database
onMounted(async () => {
  await fetchAgentsByType("ai");
  // chanel connections will be loaded only when an agent is selected
});

// Helper functions for chanel connections
const getchanelConnectionStatus = (chanelId) => {
  return chanelConnections.value.some(
    (conn) =>
      conn.chanel_id === chanelId &&
      conn.agent_id === selectedAI.value.id &&
      conn.is_active
  );
};

const hasActiveAgentInchanel = (chanelId) => {
  return (
    activeAgentsPerchanel.value[chanelId] &&
    activeAgentsPerchanel.value[chanelId] !== selectedAI.value.id
  );
};

const loadActiveAgentsForchanels = async () => {
  try {
    const allConnections = await fetchConnections();
    const connections = Array.isArray(allConnections) ? allConnections : [];

    // Group active agents by chanel
    const activeAgents = {};
    connections.forEach((conn) => {
      if (conn.is_active) {
        activeAgents[conn.chanel_id] = conn.agent_id;
      }
    });

    activeAgentsPerchanel.value = activeAgents;
  } catch (error) {
    console.error("Error loading active agents:", error);
  }
};

const getchanelName = (chanelId) => {
  const chanel = (chanels.value || []).find((c) => c.id === chanelId);
  return chanel ? chanel.name : "Unknown chanel";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const connectTochanel = async (chanelId) => {
  if (!selectedAI.value.id) return;

  connecting.value = true;
  try {
    await connectAgentTochanel(chanelId, selectedAI.value.id);
    // Refresh connections and active agents
    await Promise.all([loadAgentConnections(), loadActiveAgentsForchanels()]);
  } catch (error) {
    console.error("Error connecting agent to chanel:", error);
  } finally {
    connecting.value = false;
  }
};

const disconnectFromchanel = async (chanelId) => {
  if (!selectedAI.value.id) return;

  connecting.value = true;
  try {
    await disconnectAgentFromchanel(chanelId, selectedAI.value.id);
    // Refresh connections and active agents
    await Promise.all([loadAgentConnections(), loadActiveAgentsForchanels()]);
  } catch (error) {
    console.error("Error disconnecting agent from chanel:", error);
  } finally {
    connecting.value = false;
  }
};

const loadAgentConnections = async () => {
  if (!selectedAI.value.id) return;

  try {
    // Get all connections to show status for all chanels
    const allConnections = await fetchConnections();

    // Create connections for all chanels, showing if this agent is connected
    const chanelConnectionsList = (chanels.value || []).map((chanel) => {
      const existingConnection = (allConnections || []).find(
        (conn) =>
          conn.chanel_id === chanel.id && conn.agent_id === selectedAI.value.id
      );

      return {
        id: existingConnection?.id || `temp_${chanel.id}`,
        chanel_id: chanel.id,
        agent_id: selectedAI.value.id,
        is_active: existingConnection?.is_active || false,
        created_at: existingConnection?.created_at || null,
        updated_at: existingConnection?.updated_at || null,
        chanel_name: chanel.name,
      };
    });

    chanelConnections.value = chanelConnectionsList;
  } catch (error) {
    console.error("Error loading agent connections:", error);
  }
};

async function onSelectAI(ai) {
  selectedAI.value = { ...ai };
  console.log(ai);

  // Load AI config from database
  try {
    const aiConfig = await getAIConfigByAgentId(ai.id);
    if (aiConfig) {
      selectedAI.value = {
        ...selectedAI.value,
        gayaBicara: aiConfig.gaya_bicara || "",
        pengetahuan: aiConfig.pengetahuan || "",
        handoverList: aiConfig.handover_conditions || [],
        followupConfigs: aiConfig.followup_configs || [],
        kirim_gambar_configs: aiConfig.kirim_gambar_configs || [],
      };
      // Mapping seluruh followup_configs ke followupList
      selectedAI.value.followupList = aiConfig.followup_configs || [];
      // Reset input followup ke default kosong
      selectedAI.value.followupKeyword = "";
      selectedAI.value.followupMode = "generate";
      selectedAI.value.followupReply = "";
      selectedAI.value.followupDelay = "1 menit";
      // Mapping kirim gambar configs ke list
      selectedAI.value.kirimGambarList = aiConfig.kirim_gambar_configs || [];
    }
  } catch (err) {
    console.error("Error loading AI config:", err);
  }

  // Load chanel_agent_connection data only when agent is selected
  await fetchchanels();
  await Promise.all([loadAgentConnections(), loadActiveAgentsForchanels()]);
}

async function onAddAI() {
  await fetchAgentsByType("ai");
}
const handoverInput = ref("");
const handoverList = ref([]);
const followupDelays = ref(["5 detik", "10 detik", "30 detik", "1 menit"]);
const followupInput = ref({
  keyword: "",
  mode: "generate",
  reply: "",
  delay: "1 menit",
});
const kirimGambarInput = ref({
  keyword: "",
});
const showChatModal = ref(false);
const chatInput = ref("");
const chatMessages = ref([]);
const chatLoading = ref(false);

// Tambah di data
const editingHandoverId = ref(null);
const editingHandoverText = ref("");

async function sendChat() {
  if (chatInput.value.trim() !== "") {
    chatMessages.value.push({ from: "user", text: chatInput.value });
    const userMsg = chatInput.value;
    chatInput.value = "";
    // Build full agent config knowledge
    const agentKnowledge = JSON.stringify({
      gayaBicara: selectedAI.value.gayaBicara,
      pengetahuan: selectedAI.value.pengetahuan,
      handoverList: selectedAI.value.handoverList,
      followupList: selectedAI.value.followupList,
      kirimGambarList: selectedAI.value.kirimGambarList,
      description: selectedAI.value.description,
      kepintaran: selectedAI.value.kepintaran,
      no_hp: selectedAI.value.no_hp,
      name: selectedAI.value.name,
    });
    // Cek jika pesan mengandung followup keyword
    if (
      selectedAI.value.followupKeyword &&
      userMsg
        .toLowerCase()
        .includes((selectedAI.value.followupKeyword || "").toLowerCase())
    ) {
      if (selectedAI.value.followupMode === "manual") {
        // Balas sesuai input followupReply
        chatMessages.value.push({
          from: "ai",
          text: selectedAI.value.followupReply || "...",
        });
        return;
      } else if (selectedAI.value.followupMode === "generate") {
        // Generate balasan AI seperti biasa
        chatLoading.value = true;
        try {
          const res = await fetch("/api/openrouter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: userMsg,
              knowledge: agentKnowledge,
            }),
          });
          const data = await res.json();
          if (data.result) {
            chatMessages.value.push({
              from: "ai",
              text: data.result,
              images: data.images || [],
            });
          } else {
            chatMessages.value.push({
              from: "ai",
              text: "Gagal mendapatkan jawaban AI.",
              images: [],
            });
          }
        } catch (e) {
          chatMessages.value.push({
            from: "ai",
            text: "Error: " + e.message,
            images: [],
          });
        }
        chatLoading.value = false;
        return;
      }
    }
    // Jika tidak mengandung followup keyword, balas seperti biasa
    chatLoading.value = true;
    try {
      const res = await fetch("/api/openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg,
          knowledge: agentKnowledge,
        }),
      });
      const data = await res.json();
      if (data.result) {
        chatMessages.value.push({
          from: "ai",
          text: data.result,
          images: data.images || [],
        });
      } else {
        chatMessages.value.push({
          from: "ai",
          text: "Gagal mendapatkan jawaban AI.",
          images: [],
        });
      }
    } catch (e) {
      chatMessages.value.push({
        from: "ai",
        text: "Error: " + e.message,
        images: [],
      });
    }
    chatLoading.value = false;
  }
}
// Tambahkan property untuk edit agent
if (selectedAI.value) {
  if (!selectedAI.value.description) selectedAI.value.description = "";
  if (!selectedAI.value.kepintaran) selectedAI.value.kepintaran = "Basic";
}

// Ubah addHandover agar simpan objek {id, text}
function addHandover() {
  if (!selectedAI.value.handoverList) selectedAI.value.handoverList = [];
  const newText = handoverInput.value.trim();
  if (newText !== "") {
    // Validasi duplikat (case-insensitive, trim)
    const isDuplicate = selectedAI.value.handoverList.some(
      (h) => h.text.trim().toLowerCase() === newText.toLowerCase()
    );
    if (isDuplicate) {
      showToast({ message: "Kondisi handover sudah ada!", type: "info" });
      return;
    }
    // Auto increment id
    const nextId =
      selectedAI.value.handoverList.length > 0
        ? Math.max(...selectedAI.value.handoverList.map((h) => h.id)) + 1
        : 1;
    selectedAI.value.handoverList.push({ id: nextId, text: newText });
    handoverInput.value = "";
    saveHandoverToLocal();
  }
}

function editHandover(item) {
  editingHandoverId.value = item.id;
  editingHandoverText.value = item.text;
}

function saveEditHandover(item) {
  const idx = selectedAI.value.handoverList.findIndex((h) => h.id === item.id);
  if (idx !== -1) {
    selectedAI.value.handoverList[idx].text = editingHandoverText.value;
    editingHandoverId.value = null;
    editingHandoverText.value = "";
    saveHandoverToLocal();
  }
}

function cancelEditHandover() {
  editingHandoverId.value = null;
  editingHandoverText.value = "";
}

function deleteHandover(item) {
  selectedAI.value.handoverList = selectedAI.value.handoverList.filter(
    (h) => h.id !== item.id
  );
  saveHandoverToLocal();
}

async function saveHandoverToLocal() {
  if (selectedAI.value.id) {
    try {
      await saveAIConfig(selectedAI.value.id, {
        handover_conditions: selectedAI.value.handoverList || [],
      });
    } catch (err) {
      console.error("Error saving handover conditions:", err);
    }
  }
}
async function onDeleteAgent() {
  if (
    confirm(
      "Yakin ingin menghapus agent ini beserta seluruh data terkait? Tindakan ini tidak bisa dikembalikan."
    )
  ) {
    if (selectedAI.value.id) {
      try {
        const res = await fetch(`/api/agent/${selectedAI.value.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!data.error) {
          showToast({
            message: "Agent dan seluruh data terkait berhasil dihapus!",
            type: "success",
          });
          selectedAI.value = {};
          emit("refresh-ai-list"); // trigger refresh list di parent
        } else {
          showToast({
            message: "Gagal menghapus agent: " + data.message,
            type: "error",
          });
        }
      } catch (err) {
        showToast({ message: "Gagal menghapus agent", type: "error" });
        console.error("Error deleting agent:", err);
      }
    } else {
      selectedAI.value = {};
    }
  }
}
async function onSaveAll() {
  // Simpan perubahan selectedAI ke database
  if (!selectedAI.value.id) {
    showToast({ message: "Pilih agent terlebih dahulu!", type: "info" });
    return;
  }

  try {
    // Build followup_configs array dari followupList
    selectedAI.value.followupConfigs = selectedAI.value.followupList || [];
    // Build kirim_gambar_configs dari list
    selectedAI.value.kirimGambarConfigs =
      selectedAI.value.kirimGambarList || [];

    // Simpan ke tabel agents
    await updateAgent(selectedAI.value.id, {
      name: selectedAI.value.name,
      description: selectedAI.value.description,
      kepintaran: selectedAI.value.kepintaran,
      no_hp: selectedAI.value.no_hp,
    });

    // Simpan ke tabel agent_ai_configs
    await saveAIConfig(selectedAI.value.id, {
      gaya_bicara: selectedAI.value.gayaBicara || "",
      pengetahuan: selectedAI.value.pengetahuan || "",
      handover_conditions: selectedAI.value.handoverList || [],
      followup_configs: selectedAI.value.followupConfigs,
      kirim_gambar_configs: selectedAI.value.kirimGambarConfigs,
    });

    showToast({
      message: "Semua perubahan agent telah disimpan!",
      type: "success",
    });
  } catch (err) {
    console.error("Error saving AI config:", err);
    showToast({ message: "Gagal menyimpan perubahan agent", type: "error" });
  }
}

// Tambah di data
const kirimGambarKeyword = ref("");
const kirimGambarUrl = ref("");
const editingKirimGambarId = ref(null);
const editingKirimGambarKeyword = ref("");
const editingKirimGambarUrl = ref("");

function addKirimGambar() {
  if (!selectedAI.value.kirimGambarList) selectedAI.value.kirimGambarList = [];
  const keyword = kirimGambarKeyword.value.trim();
  const url = kirimGambarUrl.value.trim();
  if (keyword && url) {
    // Validasi duplikat keyword
    const isDuplicate = selectedAI.value.kirimGambarList.some(
      (k) => k.keyword.trim().toLowerCase() === keyword.toLowerCase()
    );
    if (isDuplicate) {
      showToast({ message: "Kondisi kirim gambar sudah ada!", type: "info" });
      return;
    }
    const nextId =
      selectedAI.value.kirimGambarList.length > 0
        ? Math.max(...selectedAI.value.kirimGambarList.map((k) => k.id)) + 1
        : 1;
    selectedAI.value.kirimGambarList.push({
      id: nextId,
      keyword,
      imageUrl: url,
    });
    kirimGambarKeyword.value = "";
    kirimGambarUrl.value = "";
    saveKirimGambarToLocal();
  }
}
function editKirimGambar(item) {
  editingKirimGambarId.value = item.id;
  editingKirimGambarKeyword.value = item.keyword;
  editingKirimGambarUrl.value = item.imageUrl;
}
function saveEditKirimGambar(item) {
  const idx = selectedAI.value.kirimGambarList.findIndex(
    (k) => k.id === item.id
  );
  if (idx !== -1) {
    selectedAI.value.kirimGambarList[idx].keyword =
      editingKirimGambarKeyword.value;
    selectedAI.value.kirimGambarList[idx].imageUrl =
      editingKirimGambarUrl.value;
    editingKirimGambarId.value = null;
    editingKirimGambarKeyword.value = "";
    editingKirimGambarUrl.value = "";
    saveKirimGambarToLocal();
  }
}
function cancelEditKirimGambar() {
  editingKirimGambarId.value = null;
  editingKirimGambarKeyword.value = "";
  editingKirimGambarUrl.value = "";
}
function deleteKirimGambar(item) {
  selectedAI.value.kirimGambarList = selectedAI.value.kirimGambarList.filter(
    (k) => k.id !== item.id
  );
  saveKirimGambarToLocal();
}
async function saveKirimGambarToLocal() {
  if (selectedAI.value.id) {
    try {
      await saveAIConfig(selectedAI.value.id, {
        kirim_gambar_configs: selectedAI.value.kirimGambarList || [],
      });
    } catch (err) {
      console.error("Error saving kirim gambar configs:", err);
    }
  }
}

// Tambahkan state untuk editing followup
const editingFollowupIdx = ref(null);

function addFollowup() {
  if (!selectedAI.value.followupList) selectedAI.value.followupList = [];
  const newItem = {
    id:
      editingFollowupIdx.value !== null
        ? selectedAI.value.followupList[editingFollowupIdx.value].id
        : Date.now(),
    keyword: selectedAI.value.followupKeyword,
    mode: selectedAI.value.followupMode,
    reply: selectedAI.value.followupReply,
    delay: selectedAI.value.followupDelay || "1 menit",
  };
  if (editingFollowupIdx.value !== null) {
    selectedAI.value.followupList.splice(editingFollowupIdx.value, 1, newItem);
    editingFollowupIdx.value = null;
  } else {
    selectedAI.value.followupList.push(newItem);
  }
  // Reset input setelah submit
  selectedAI.value.followupKeyword = "";
  selectedAI.value.followupReply = "";
  selectedAI.value.followupDelay = "1 menit";
  selectedAI.value.followupMode = "generate";
}

function editFollowup(idx) {
  const item = selectedAI.value.followupList[idx];
  selectedAI.value.followupKeyword = item.keyword;
  selectedAI.value.followupMode = item.mode;
  selectedAI.value.followupReply = item.reply;
  selectedAI.value.followupDelay = item.delay;
  editingFollowupIdx.value = idx;
}
function deleteFollowup(idx) {
  selectedAI.value.followupList.splice(idx, 1);
  // Jika sedang edit item yang dihapus, reset input
  if (editingFollowupIdx.value === idx) {
    selectedAI.value.followupKeyword = "";
    selectedAI.value.followupReply = "";
    selectedAI.value.followupDelay = "1 menit";
    selectedAI.value.followupMode = "generate";
    editingFollowupIdx.value = null;
  }
}
</script>
<style scoped>
.agentai-main-layout {
  display: flex;
  height: calc(100vh - 40px);
}
.agentai-sidebar {
  width: 320px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}
.agentai-sidebar-title {
  padding: 20px;
  font-size: 1.3em;
  font-weight: 700;
  border-bottom: 1px solid #e0e0e0;
  color: #2d3436;
}
.agentai-sidebar-list {
  flex: 1;
  overflow-y: auto;
}
.agentai-sidebar-item {
  padding: 18px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  background: #f1f2f6;
}
.agentai-sidebar-item.active {
  background: #f1f2f6;
}
.agentai-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f6fa;
}
.agentai-main-header {
  padding: 24px 32px 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.agentai-tabs {
  padding: 0 32px;
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}
.agentai-tab-btn {
  padding: 10px 18px;
  border: none;
  background: none;
  font-size: 1em;
  font-weight: 500;
  color: #222;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}
.agentai-tab-btn.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}
.agentai-tab-content {
  padding: 0 32px;
}
.agentai-subtabs {
  display: flex;
  gap: 24px;
  margin-bottom: 18px;
  background: #fafbfc;
  border-radius: 8px 8px 0 0;
  padding: 8px 18px 0 18px;
}
.agentai-subtab-btn {
  background: none;
  border: none;
  color: #222;
  font-size: 1em;
  font-weight: 500;
  padding: 10px 18px 8px 18px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}
.agentai-subtab-btn.active {
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
  background: #fff;
}
.followup-btn {
  background: #e3f2fd;
  color: #1976d2;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.9em;
  cursor: pointer;
  margin-right: 8px;
}
.followup-btn.active {
  background: #1976d2;
  color: #fff;
}
.followup-delay-group {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.followup-delay-btn {
  background: #e3f2fd;
  color: #1976d2;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.9em;
  cursor: pointer;
}
.followup-delay-btn.active {
  background: #1976d2;
  color: #fff;
}
.kirim-gambar-upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1em;
  color: #222;
  margin-bottom: 18px;
  cursor: not-allowed;
}
.chat-agent-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-size: 1em;
  cursor: pointer;
  margin-left: 18px;
}
.save-all-btn {
  background: #43a047;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-size: 1em;
  cursor: pointer;
}
.save-all-btn:hover {
  background: #388e3c;
}
.chat-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-modal {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  width: 370px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-modal-header {
  padding: 16px 18px;
  background: #f4faff;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}
.chat-modal-close {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
}
.chat-modal-body {
  padding: 18px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chat-bubble {
  max-width: 80%;
  padding: 10px 16px;
  border-radius: 16px;
  font-size: 1em;
  margin-bottom: 4px;
  word-break: break-word;
}
.chat-bubble.agent {
  background: #f4faff;
  align-self: flex-start;
}
.chat-bubble.user {
  background: #1976d2;
  color: #fff;
  align-self: flex-end;
}
.chat-modal-footer {
  display: flex;
  gap: 8px;
  padding: 12px 18px 16px 18px;
  border-top: 1px solid #e0e0e0;
}
.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
}
.chat-send-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1em;
  cursor: pointer;
}
</style>
