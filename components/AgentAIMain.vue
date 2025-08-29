<template>
  <div class="flex flex-col md:flex-row h-full min-w-0 overflow-hidden">
    <!-- Mobile: Show list full screen when no agent selected -->
    <div
      v-if="!selectedAI || !selectedAI.id"
      class="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col md:block"
    >
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

    <!-- Desktop: Always show sidebar -->
    <div
      v-else
      class="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col md:block hidden"
    >
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

    <!-- Main Content - Hidden on mobile when no agent selected -->
    <div
      v-if="selectedAI && selectedAI.id"
      class="flex-1 flex flex-col bg-gray-100 min-w-0 h-full overflow-hidden"
    >
      <template v-if="selectedAI && selectedAI.id">
        <div
          class="px-2 md:px-8 pt-4 md:pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <!-- Mobile back button -->
            <button
              @click="selectedAI = {}"
              class="md:hidden bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors flex-shrink-0"
              title="Kembali ke daftar"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <!-- Agent Name Display with Avatar -->
            <div class="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <div
                class="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-lg shadow-sm flex-shrink-0"
              >
                {{
                  selectedAI.name
                    ? selectedAI.name.charAt(0).toUpperCase()
                    : "A"
                }}
              </div>
              <div class="min-w-0 flex-1">
                <h1 class="text-lg md:text-2xl font-bold text-gray-800 truncate">
                  {{ selectedAI.name }}
                </h1>
                <p class="text-gray-500 text-xs md:text-sm truncate">
                  {{ selectedAI.description || "Tidak ada deskripsi" }}
                </p>
              </div>
            </div>
          </div>
          <div class="flex gap-2 md:gap-3 items-center flex-shrink-0">
            <button
              class="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 md:px-6 py-2 text-sm md:text-base cursor-pointer flex items-center gap-1 md:gap-2"
              @click="onSaveAll"
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
                <path
                  d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"
                />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span class="hidden sm:inline">Simpan Semua</span>
              <span class="sm:hidden">Simpan</span>
            </button>
            <!-- <button
              class="bg-blue-700 text-white rounded-lg px-4 md:px-6 py-2 text-base cursor-pointer flex items-center gap-2 ml-2 md:ml-4"
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
            </button> -->
          </div>
        </div>
        <!-- Modal responsif -->
        <div
          v-if="showChatModal"
          class="fixed inset-0 bg-black/20 z-50 flex items-center justify-center px-2 md:px-0"
        >
          <div
            class="bg-white rounded-xl shadow-lg w-full max-w-full md:max-w-2xl flex flex-col overflow-hidden"
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
                  class="flex flex-wrap gap-2 mt-1 max-w-xs md:max-w-md min-w-0"
                >
                  <div
                    v-for="(img, i) in msg.images"
                    :key="i"
                    class="bg-blue-50 rounded-lg p-2 shadow border max-w-[180px] max-h-[220px] flex items-center justify-center mt-0.5"
                  >
                    <img
                      :src="img"
                      class="max-w-[160px] max-h-[180px] rounded block mx-auto"
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

        <div
          class="px-2 md:px-8 pt-2 flex gap-2 md:gap-6 mb-4 md:mb-6 border-b border-gray-200 overflow-x-auto"
        >
          <button
            v-for="t in ['gaya', 'pengetahuan', 'edit']"
            :key="t"
            :class="[
              'px-2 md:px-5 py-2 font-medium border-b-2 whitespace-nowrap text-sm md:text-base',
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
        <div class="flex-1 overflow-y-auto px-2 md:px-8 py-4 h-full min-w-0">
          <div v-if="tab === 'gaya'" class="min-w-0">
            <div class="agentai-subtabs overflow-x-auto">
              <div class="flex gap-1 md:gap-6 min-w-max">
                <button
                  class="agentai-subtab-btn whitespace-nowrap text-xs md:text-sm"
                  :class="{ active: subtab === 'gaya' }"
                  @click="subtab = 'gaya'"
                >
                  Gaya Bicara
                </button>
                <button
                  class="agentai-subtab-btn whitespace-nowrap text-xs md:text-sm"
                  :class="{ active: subtab === 'handover' }"
                  @click="subtab = 'handover'"
                >
                  Kondisi Handover
                </button>
                <button
                  class="agentai-subtab-btn whitespace-nowrap text-xs md:text-sm"
                  :class="{ active: subtab === 'followup' }"
                  @click="subtab = 'followup'"
                >
                  Followup
                </button>
                <button
                  class="agentai-subtab-btn whitespace-nowrap text-xs md:text-sm"
                  :class="{ active: subtab === 'kirim' }"
                  @click="subtab = 'kirim'"
                >
                  Kirim Gambar
                </button>
              </div>
            </div>
            <div v-if="subtab === 'gaya'" class="h-full flex flex-col min-w-0">
              <h3 class="font-semibold text-base md:text-lg mb-2">Gaya bicara Agent</h3>
              <div class="mb-2 text-gray-500 text-sm">Maximum 28/15000 karakter</div>
              <textarea
                v-model="selectedAI.gayaBicara"
                class="w-full flex-1 min-h-0 p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg resize-none"
                placeholder="Masukkan gaya bicara agent..."
              ></textarea>
              <div class="mt-2">
                <a href="#" class="text-blue-600 no-underline text-sm md:text-base"
                  >Lihat template gaya bicara agent</a
                >
              </div>
            </div>
            <div v-else-if="subtab === 'handover'" class="h-full flex flex-col min-w-0">
              <h3 class="font-semibold text-base md:text-lg mb-2">Buat Kondisi Handover</h3>
              <div class="mb-2 text-sm md:text-base">
                Agen AI akan berhenti saat pelanggan mengirim pesan dengan kata
                kunci
              </div>
              <textarea
                v-model="handoverInput"
                placeholder="e.g. saya ingin bicara dengan atasan anda"
                class="w-full h-16 md:h-20 p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg resize-y mb-4"
              ></textarea>
              <button
                @click="addHandover"
                class="bg-blue-700 text-white border-none rounded-xl px-4 md:px-7 py-2 md:py-2.5 text-sm md:text-base cursor-pointer mb-6"
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
            <div v-else-if="subtab === 'followup'" class="h-full flex flex-col min-w-0">
              <h3 class="font-semibold text-base md:text-lg mb-2">Buat Kondisi Followup</h3>
              <div class="mb-2 text-sm md:text-base">
                Saat pelanggan mengirim pesan dengan kata kunci
              </div>
              <textarea
                v-model="selectedAI.followupKeyword"
                placeholder="cth: saya ingin booking"
                class="w-full h-16 md:h-20 p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg resize-y mb-4"
              ></textarea>
              <div class="mb-2 text-sm md:text-base">
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
                  class="w-full h-16 md:h-15 p-3 text-base border border-gray-300 rounded-lg resize-y mb-4"
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
                  Kirim
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
            <div v-else-if="subtab === 'kirim'" class="h-full flex flex-col min-w-0">
              <h3 class="font-semibold text-base md:text-lg mb-2">
                Buat Kondisi Kirim Gambar
              </h3>
              <div class="mb-2 text-sm md:text-base">
                Saat pelanggan mengirim pesan dengan kata kunci
              </div>
              <input
                v-model="kirimGambarKeyword"
                placeholder="e.g. boleh minta gambar produknya"
                class="w-full mb-2 px-2 md:px-3 py-2 text-sm md:text-base border rounded min-w-0"
              />

              <!-- Image Upload Section -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Upload Gambar
                </label>
                <div class="flex items-center space-x-4">
                  <label
                    class="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 flex items-center space-x-2"
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <span>Pilih Gambar</span>
                    <input
                      type="file"
                      ref="kirimGambarFileInput"
                      @change="handleKirimGambarUpload"
                      accept="image/*"
                      class="hidden"
                    />
                  </label>
                  <button
                    v-if="kirimGambarPreview"
                    @click="removeKirimGambarImage"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    Hapus Gambar
                  </button>
                </div>

                <!-- Image Preview -->
                <div v-if="kirimGambarPreview" class="mt-3">
                  <div class="relative inline-block">
                    <img
                      :src="kirimGambarPreview"
                      alt="Preview"
                      class="max-w-xs max-h-48 rounded-lg border border-gray-200"
                    />
                    <div
                      class="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
                    >
                      {{ kirimGambarFileName }}
                    </div>
                  </div>
                </div>
              </div>

              <button
                @click="addKirimGambar"
                :disabled="!kirimGambarKeyword.trim() || !kirimGambarFile"
                class="bg-blue-700 text-white border-none rounded-xl px-4 py-2.5 text-base mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  class="mb-4 p-3 border rounded-lg"
                >
                  <div v-if="editingKirimGambarId !== item.id">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="mb-2">
                          <strong>Kata kunci:</strong> {{ item.keyword }}
                        </div>
                        <div class="flex items-center space-x-2">
                          <img
                            :src="item.imageUrl"
                            alt="Gambar"
                            class="w-16 h-16 object-cover rounded border"
                          />
                          <div class="text-sm text-gray-600">
                            {{ item.fileName || "Gambar" }}
                          </div>
                        </div>
                      </div>
                      <div class="ml-4 flex gap-2">
                        <button
                          @click="editKirimGambar(item)"
                          class="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Ubah
                        </button>
                        <button
                          @click="deleteKirimGambar(item)"
                          class="bg-red-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="space-y-3">
                    <input
                      v-model="editingKirimGambarKeyword"
                      placeholder="Kata kunci"
                      class="w-full px-3 py-2 border rounded"
                    />

                    <!-- Edit Image Upload -->
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Upload Gambar Baru
                      </label>
                      <div class="flex items-center space-x-4">
                        <label
                          class="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 flex items-center space-x-2"
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
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                          </svg>
                          <span>Pilih Gambar</span>
                          <input
                            type="file"
                            ref="editKirimGambarFileInput"
                            @change="handleEditKirimGambarUpload"
                            accept="image/*"
                            class="hidden"
                          />
                        </label>
                      </div>

                      <!-- Edit Image Preview -->
                      <div v-if="editingKirimGambarPreview" class="mt-3">
                        <div class="relative inline-block">
                          <img
                            :src="editingKirimGambarPreview"
                            alt="Preview"
                            class="max-w-xs max-h-48 rounded-lg border border-gray-200"
                          />
                          <div
                            class="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
                          >
                            {{ editingKirimGambarFileName }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        @click="saveEditKirimGambar(item)"
                        class="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Simpan
                      </button>
                      <button
                        @click="cancelEditKirimGambar"
                        class="bg-gray-300 text-black px-3 py-1 rounded text-sm"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="tab === 'pengetahuan'" class="h-full flex flex-col">
            <div class="agentai-subtabs overflow-x-auto">
              <div class="flex gap-2 md:gap-6 min-w-max">
                <button
                  class="agentai-subtab-btn whitespace-nowrap"
                  :class="{ active: pengetahuanSubtab === 'umum' }"
                  @click="pengetahuanSubtab = 'umum'"
                >
                  Pengetahuan Umum
                </button>
                <button
                  class="agentai-subtab-btn whitespace-nowrap"
                  :class="{ active: pengetahuanSubtab === 'produk' }"
                  @click="pengetahuanSubtab = 'produk'"
                >
                  Produk
                </button>
                <button
                  class="agentai-subtab-btn whitespace-nowrap"
                  :class="{ active: pengetahuanSubtab === 'ongkir' }"
                  @click="pengetahuanSubtab = 'ongkir'"
                >
                  Integrasi Ongkir
                </button>
              </div>
            </div>

            <!-- Pengetahuan Umum Subtab -->
            <div
              v-if="pengetahuanSubtab === 'umum'"
              class="flex-1 flex flex-col"
            >
              <div class="font-semibold mb-0.5">Pengetahuan Agent</div>
              <div class="text-gray-500 mb-3">
                Tambahkan informasi Produk, Tutorial Penggunaan, SOP, FAQ, dan
                lainnya. Tidak ada limit maximum.
              </div>
              <textarea
                v-model="selectedAI.pengetahuan"
                class="w-full flex-1 min-h-0 p-3 text-base border border-gray-300 rounded-lg resize-none"
                placeholder="Add Agent's knowledge here"
              ></textarea>
            </div>

            <!-- Produk Subtab -->
            <div v-else-if="pengetahuanSubtab === 'produk'" class="overflow-y-scroll xs:h-[320px]">
              <div class="flex justify-between items-center mb-4  ">
                <h3 class="font-semibold text-lg">Produk</h3>
                <button
                  @click="openProductSelectionModal"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                  Tambah Produk
                </button>
              </div>

              <!-- Product Cards Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                <div
                  v-for="(product, index) in selectedAI.products || []"
                  :key="product.id"
                  class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <!-- Product Header -->
                  <div
                    class="flex justify-between items-center p-3 border-b border-gray-100"
                  >
                    <span class="font-bold text-gray-700"
                      ># {{ index + 1 }}</span
                    >
                    <button
                      @click="deleteProduct(product.id)"
                      class="text-red-500 hover:text-red-700 transition-colors"
                      title="Hapus produk"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <!-- Product Image -->
                  <div class="relative">
                    <div
                      class="w-full h-48 bg-gray-100 flex items-center justify-center"
                    >
                      <img
                        v-if="product.image"
                        :src="product.image"
                        :alt="product.name"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="text-gray-400 text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-16 w-16 mx-auto mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p class="text-sm">No Image</p>
                      </div>
                    </div>
                  </div>

                  <!-- Product Details -->
                  <div class="p-4">
                    <h4 class="font-medium text-gray-900 mb-2">
                      {{ product.name }}
                    </h4>
                    <p class="text-gray-600 mb-2">
                      Rp {{ formatPrice(product.price) }}
                    </p>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-500"
                        >Stok: {{ product.stock }}</span
                      >
                      <span v-if="product.weight" class="text-sm text-gray-500">
                        Berat: {{ product.weight }} {{ product.weight_unit }}
                      </span>
                      <span
                        v-if="product.discount > 0"
                        class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                      >
                        {{ product.discount }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div
                v-if="!selectedAI.products || selectedAI.products.length === 0"
                class="text-center py-8 text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-16 w-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <p class="text-lg font-medium mb-2">Belum ada produk</p>
                <p class="text-sm">
                  Klik "Tambah Produk" untuk menambahkan produk ke agent
                </p>
              </div>
            </div>

            <!-- Integrasi Ongkir Subtab -->
            <div v-else-if="pengetahuanSubtab === 'ongkir'">
              <div class="font-semibold mb-4">Konfigurasi Pengiriman</div>
              <div class="text-gray-500 mb-6">
                Atur informasi pengirim dan jasa pengiriman yang tersedia
              </div>

              <div class="space-y-6">
                <!-- Pengirim Information -->
                <div class="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 class="font-semibold text-lg mb-4">Informasi Pengirim</h4>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Provinsi Pengirim
                      </label>
                      <input
                        v-model="ongkirConfig.provinsiPengirim"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: DKI Jakarta"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Kota Pengirim
                      </label>
                      <input
                        v-model="ongkirConfig.kotaPengirim"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: Jakarta Selatan"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Kecamatan Pengirim
                      </label>
                      <input
                        v-model="ongkirConfig.kecamatanPengirim"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: Kebayoran Baru"
                      />
                    </div>
                  </div>
                </div>

                <!-- Tarif Ongkir -->
                <div class="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 class="font-semibold text-lg mb-4">Tarif Ongkir</h4>
                  <div class="text-gray-600 mb-4">
                    Atur tarif ongkir per kilogram untuk setiap jasa pengiriman:
                  </div>
                  <div class="space-y-3">
                    <div
                      v-for="jasa in jasaPengirimanOptions"
                      :key="jasa.value"
                      class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      :class="{
                        'bg-blue-50 border-blue-300':
                          ongkirConfig.jasaPengiriman.includes(jasa.value),
                      }"
                    >
                      <div class="flex items-center">
                        <input
                          type="checkbox"
                          :value="jasa.value"
                          v-model="ongkirConfig.jasaPengiriman"
                          class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <div class="font-medium text-sm">
                            {{ jasa.label }}
                          </div>
                          <div class="text-xs text-gray-500">
                            {{ jasa.description }}
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="ongkirConfig.jasaPengiriman.includes(jasa.value)"
                        class="flex items-center gap-2"
                      >
                        <span class="text-sm text-gray-600">Rp</span>
                        <input
                          v-model="ongkirConfig.tarifPerKg[jasa.value]"
                          type="number"
                          min="0"
                          class="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                        <span class="text-sm text-gray-600">/kg</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Save Button -->
                <div class="flex justify-end">
                  <div class="text-sm text-gray-500">
                    Konfigurasi ongkir akan disimpan saat klik "Simpan Semua"
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="tab === 'edit'" class="h-full flex flex-col min-w-0">
            <h3 class="font-semibold text-base md:text-lg mb-4">Edit Agen</h3>
            <form @submit.prevent class="w-full max-w-2xl min-w-0">
              <div class="mb-4">
                <label class="block font-semibold text-sm md:text-base mb-1">Nama</label>
                <input
                  v-model="selectedAI.name"
                  type="text"
                  class="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg min-w-0"
                  placeholder="Nama Agent"
                />
              </div>
              <div class="mb-4">
                <label class="block font-semibold text-sm md:text-base mb-1">Description</label>
                <input
                  v-model="selectedAI.description"
                  type="text"
                  class="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg min-w-0"
                  placeholder="Deskripsi Agent"
                />
              </div>
              <div class="mb-4">
                <label class="block font-semibold text-sm md:text-base mb-1">Kepintaran AI</label>
                <select
                  v-model="selectedAI.kepintaran"
                  class="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg min-w-0"
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

    <!-- Desktop: Show empty state when no agent selected -->
    <div
      v-else
      class="hidden md:flex flex-1 items-center justify-center text-gray-400 text-xl bg-gray-100"
    >
      <div class="text-center">
        <div class="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 mx-auto text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p class="text-lg font-medium text-gray-500 mb-2">Pilih Agent AI</p>
        <p class="text-sm text-gray-400">
          Pilih agent dari daftar untuk melihat detail
        </p>
      </div>
    </div>

    <!-- Product Modal -->
    <ChanelModal :show="showProductModal" @close="closeProductModal">
      <div class="p-6 max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">
          {{ editingProduct ? "Edit Produk" : "Tambah Produk Baru" }}
        </h3>

        <form @submit.prevent="saveProduct">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk *
              </label>
              <input
                v-model="productForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama produk"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Harga *
              </label>
              <input
                v-model="productForm.price"
                type="number"
                required
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Stok *
              </label>
              <input
                v-model="productForm.stock"
                type="number"
                required
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Diskon (%)
              </label>
              <input
                v-model="productForm.discount"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                v-model="productForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Deskripsi produk..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Gambar Produk
              </label>
              <div class="flex items-center space-x-4">
                <label
                  class="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 flex items-center space-x-2"
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <span>Pilih Gambar</span>
                  <input
                    type="file"
                    ref="productImageInput"
                    @change="handleProductImageUpload"
                    accept="image/*"
                    class="hidden"
                  />
                </label>
                <button
                  v-if="productForm.image"
                  @click="removeProductImage"
                  type="button"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  Hapus Gambar
                </button>
              </div>

              <!-- Image Preview -->
              <div v-if="productForm.image" class="mt-3">
                <div class="relative inline-block">
                  <img
                    :src="productForm.image"
                    alt="Pratinjau"
                    class="max-w-xs max-h-48 rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              type="submit"
              :disabled="savingProduct"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {{
                savingProduct
                  ? "Menyimpan..."
                  : editingProduct
                  ? "Perbarui"
                  : "Simpan"
              }}
            </button>
            <button
              type="button"
              @click="closeProductModal"
              :disabled="savingProduct"
              class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </ChanelModal>

    <!-- Product Selection Modal -->
    <ChanelModal
      :show="showProductSelectionModal"
      @close="closeProductSelectionModal"
    >
      <div class="p-6 max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">Pilih Produk</h3>
        <p class="text-gray-600 mb-4">
          Pilih produk yang akan ditambahkan ke pengetahuan agent:
        </p>

        <!-- Loading State -->
        <div v-if="modalLoading" class="text-center py-8">
          <div class="text-gray-500">Memuat produk...</div>
        </div>

        <!-- Product List -->
        <div v-else class="space-y-3">
          <div
            v-for="product in allProducts"
            :key="product.id"
            class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              :value="product.id"
              v-model="selectedProductIds"
              class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div class="flex items-center flex-1">
              <!-- Product Image -->
              <div
                class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3"
              >
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.name"
                  class="w-10 h-10 object-cover rounded"
                />
                <svg
                  v-else
                  class="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <!-- Product Info -->
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ product.name }}</h4>
                <p class="text-sm text-gray-600">
                  Rp {{ formatPrice(product.price) }}
                </p>
                <p v-if="product.weight" class="text-xs text-gray-500 mt-1">
                  Berat: {{ product.weight }} {{ product.weight_unit }}
                </p>
                <p
                  v-if="product.description"
                  class="text-xs text-gray-500 mt-1"
                >
                  {{ product.description.substring(0, 50)
                  }}{{ product.description.length > 50 ? "..." : "" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="!modalLoading && allProducts.length === 0"
          class="text-center py-8"
        >
          <div class="text-gray-500">Belum ada produk tersedia</div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 mt-6">
          <button
            @click="saveSelectedProducts"
            :disabled="selectedProductIds.length === 0"
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Gunakan Produk ({{ selectedProductIds.length }} produk)
          </button>
          <button
            @click="closeProductSelectionModal"
            class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </ChanelModal>
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
import { useProducts } from "~/composables/useProducts";
import Swal from "sweetalert2";

const { showToast } = useToast();
// Ambil config WAHA hanya dari import.meta.env
const baseUrl = import.meta.env.VITE_BASE_URL_WAHA;
const wahaApiKey = import.meta.env.VITE_WAHA_API;

const { aiAgents, fetchAgentsByType, updateAgent } = useAgentStore();
const { getAIConfigByAgentId, saveAIConfig } = useAgentAIStore();
const { chanels, fetchchanels } = useChanelstore();
const { products: allProducts, fetchProducts, loading } = useProducts();
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

// Pengetahuan sub-tabs
const pengetahuanSubtab = ref("umum");

// Product management
const products = ref([]);
const showProductModal = ref(false);
const editingProduct = ref(null);
const savingProduct = ref(false);
const productForm = ref({
  name: "",
  price: "",
  stock: "",
  discount: "",
  description: "",
  image: "",
});
const productImageInput = ref(null);

// Ongkir configuration
const ongkirConfig = ref({
  provinsiPengirim: "",
  kotaPengirim: "",
  kecamatanPengirim: "",
  jasaPengiriman: [],
  tarifPerKg: {}, // Tambahkan field tarif per kg
});

const jasaPengirimanOptions = ref([
  { value: "pos", label: "POS Indonesia", description: "Layanan Pos" },
  { value: "sicepat", label: "SiCepat", description: "Ekspedisi SiCepat" },
  { value: "jnt", label: "J&T Express", description: "Ekspedisi J&T" },
  { value: "jne", label: "JNE", description: "Ekspedisi JNE" },
  { value: "spx", label: "SiPaling", description: "Ekspedisi SiPaling" },
]);

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
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year} ${hours}:${minutes}`;
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
        products: aiConfig.products || [], // Load products from database
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

  // Load ongkir config
  await loadOngkirConfig();

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
      products: selectedAI.value.products || [],
      ongkir_config: ongkirConfig.value,
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
      products: selectedAI.value.products || [], // Save products to database
      ongkir_config: ongkirConfig.value, // Save ongkir config to database
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

// New image upload variables for kirim gambar
const kirimGambarFile = ref(null);
const kirimGambarPreview = ref("");
const kirimGambarFileName = ref("");
const kirimGambarFileInput = ref(null);
const editKirimGambarFileInput = ref(null);
const editingKirimGambarFile = ref(null);
const editingKirimGambarPreview = ref("");
const editingKirimGambarFileName = ref("");

function addKirimGambar() {
  if (!selectedAI.value.kirimGambarList) selectedAI.value.kirimGambarList = [];
  const keyword = kirimGambarKeyword.value.trim();

  if (keyword && kirimGambarFile.value) {
    // Validasi duplikat keyword
    const isDuplicate = selectedAI.value.kirimGambarList.some(
      (k) => k.keyword.trim().toLowerCase() === keyword.toLowerCase()
    );
    if (isDuplicate) {
      showToast({ message: "Kondisi kirim gambar sudah ada!", type: "info" });
      return;
    }

    // Upload image first
    uploadKirimGambarImage().then((imageUrl) => {
      if (imageUrl) {
        const nextId =
          selectedAI.value.kirimGambarList.length > 0
            ? Math.max(...selectedAI.value.kirimGambarList.map((k) => k.id)) + 1
            : 1;
        selectedAI.value.kirimGambarList.push({
          id: nextId,
          keyword,
          imageUrl: imageUrl,
          fileName: kirimGambarFileName.value,
        });
        clearKirimGambarInputs();
        saveKirimGambarToLocal();
      }
    });
  }
}

async function uploadKirimGambarImage() {
  if (!kirimGambarFile.value) return null;

  try {
    const formData = new FormData();
    formData.append("image", kirimGambarFile.value);

    const response = await $fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    return response.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    showToast({ message: "Gagal upload gambar", type: "error" });
    return null;
  }
}

function handleKirimGambarUpload(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    kirimGambarFile.value = file;
    kirimGambarFileName.value = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      kirimGambarPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function removeKirimGambarImage() {
  kirimGambarFile.value = null;
  kirimGambarPreview.value = "";
  kirimGambarFileName.value = "";
  if (kirimGambarFileInput.value) {
    kirimGambarFileInput.value.value = "";
  }
}

function clearKirimGambarInputs() {
  kirimGambarKeyword.value = "";
  removeKirimGambarImage();
}

function editKirimGambar(item) {
  editingKirimGambarId.value = item.id;
  editingKirimGambarKeyword.value = item.keyword;
  editingKirimGambarFile.value = null;
  editingKirimGambarPreview.value = "";
  editingKirimGambarFileName.value = "";
}

async function saveEditKirimGambar(item) {
  const idx = selectedAI.value.kirimGambarList.findIndex(
    (k) => k.id === item.id
  );
  if (idx !== -1) {
    let imageUrl = item.imageUrl; // Keep existing image if no new one uploaded

    // If new image is uploaded, upload it first
    if (editingKirimGambarFile.value) {
      try {
        const formData = new FormData();
        formData.append("image", editingKirimGambarFile.value);

        const response = await $fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        imageUrl = response.url;
      } catch (error) {
        console.error("Error uploading image:", error);
        showToast({ message: "Gagal upload gambar", type: "error" });
        return;
      }
    }

    selectedAI.value.kirimGambarList[idx].keyword =
      editingKirimGambarKeyword.value;
    selectedAI.value.kirimGambarList[idx].imageUrl = imageUrl;
    if (editingKirimGambarFileName.value) {
      selectedAI.value.kirimGambarList[idx].fileName =
        editingKirimGambarFileName.value;
    }

    editingKirimGambarId.value = null;
    editingKirimGambarKeyword.value = "";
    editingKirimGambarFile.value = null;
    editingKirimGambarPreview.value = "";
    editingKirimGambarFileName.value = "";
    saveKirimGambarToLocal();
  }
}

function handleEditKirimGambarUpload(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    editingKirimGambarFile.value = file;
    editingKirimGambarFileName.value = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      editingKirimGambarPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function cancelEditKirimGambar() {
  editingKirimGambarId.value = null;
  editingKirimGambarKeyword.value = "";
  editingKirimGambarFile.value = null;
  editingKirimGambarPreview.value = "";
  editingKirimGambarFileName.value = "";
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

// Product management functions
const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID").format(price || 0);
};

const resetProductForm = () => {
  productForm.value = {
    name: "",
    price: "",
    stock: "",
    discount: "",
    description: "",
    image: "",
  };
  editingProduct.value = null;
};

const closeProductModal = () => {
  showProductModal.value = false;
  resetProductForm();
};

const handleProductImageUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      productForm.value.image = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeProductImage = () => {
  productForm.value.image = "";
  if (productImageInput.value) {
    productImageInput.value.value = "";
  }
};

const saveProduct = async () => {
  savingProduct.value = true;
  try {
    const productData = {
      name: productForm.value.name,
      price: parseInt(productForm.value.price) || 0,
      stock: parseInt(productForm.value.stock) || 0,
      discount: parseInt(productForm.value.discount) || 0,
      description: productForm.value.description,
      image: productForm.value.image,
    };

    if (editingProduct.value) {
      // Update existing product
      const index = products.value.findIndex(
        (p) => p.id === editingProduct.value.id
      );
      if (index !== -1) {
        products.value[index] = { ...products.value[index], ...productData };
      }
    } else {
      // Add new product
      const newProduct = {
        id: Date.now(), // Simple ID generation
        ...productData,
      };
      products.value.push(newProduct);
    }

    showToast({
      message: editingProduct.value
        ? "Produk berhasil diupdate"
        : "Produk berhasil ditambahkan",
      type: "success",
    });

    closeProductModal();
  } catch (error) {
    console.error("Error saving product:", error);
    showToast({
      message: "Gagal menyimpan produk",
      type: "error",
    });
  } finally {
    savingProduct.value = false;
  }
};

const deleteProduct = async (productId) => {
  const product = selectedAI.value.products.find((p) => p.id === productId);

  // Define showAlert function at the component level
  const showAlert = async ({title, message = ''}) => {
    return await Swal.fire({
      title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya',
      cancelButtonText: 'Batal'
    });
  };

  const result = await showAlert({
    title: "Hapus Produk dari Agent",
    text: `Apakah Anda yakin ingin menghapus produk "${product?.name}" dari agent ini?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });

  if (result.isConfirmed) {
    selectedAI.value.products = selectedAI.value.products.filter(
      (p) => p.id !== productId
    );
    showToast({
      message: "Produk berhasil dihapus dari agent",
      type: "success",
    });
  }
};

// Ongkir configuration functions
// Load ongkir config when agent is selected
const loadOngkirConfig = async () => {
  if (selectedAI.value.id) {
    try {
      const aiConfig = await getAIConfigByAgentId(selectedAI.value.id);
      if (aiConfig && aiConfig.ongkir_config) {
        ongkirConfig.value = {
          provinsiPengirim: "",
          kotaPengirim: "",
          kecamatanPengirim: "",
          jasaPengiriman: [],
          tarifPerKg: {},
          ...aiConfig.ongkir_config,
        };
      }
    } catch (error) {
      console.error("Error loading ongkir config:", error);
    }
  }
};

// Product selection modal
const showProductSelectionModal = ref(false);
const selectedProductIds = ref([]);
const modalLoading = ref(false);

const openProductSelectionModal = async () => {
  showProductSelectionModal.value = true;
  selectedProductIds.value = [];
  modalLoading.value = true;
  try {
    await fetchProducts();
  } finally {
    modalLoading.value = false;
  }
};

const closeProductSelectionModal = () => {
  showProductSelectionModal.value = false;
  selectedProductIds.value = [];
};

const saveSelectedProducts = async () => {
  const selectedProducts = allProducts.value.filter((product) =>
    selectedProductIds.value.includes(product.id)
  );

  if (selectedProducts.length > 0) {
    // Tambahkan produk ke list produk agent
    if (!selectedAI.value.products) {
      selectedAI.value.products = [];
    }

    // Filter produk yang belum ada di list
    const existingProductIds = selectedAI.value.products.map((p) => p.id);
    const newProducts = selectedProducts.filter(
      (product) => !existingProductIds.includes(product.id)
    );

    // Tambahkan produk baru ke list
    selectedAI.value.products.push(...newProducts);

    showToast({
      message: `${newProducts.length} produk berhasil digunakan oleh agent (klik "Simpan Semua" untuk menyimpan)`,
      type: "success",
    });
  }

  closeProductSelectionModal();
};
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
  margin-bottom: 18px;
  background: #fafbfc;
  border-radius: 8px 8px 0 0;
  padding: 8px 12px 0 12px;
}
.agentai-subtab-btn {
  background: none;
  border: none;
  color: #222;
  font-size: 0.9em;
  font-weight: 500;
  padding: 8px 12px 6px 12px;
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
