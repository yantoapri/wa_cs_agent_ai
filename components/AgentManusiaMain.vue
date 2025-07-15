<template>
  <div class="w-full">
    <form v-if="showForm" @submit.prevent="onSave" class="p-4 w-full">
      <h2 class="text-2xl font-bold mb-6 mt-2">Data Profil Agen</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-10">
        <div>
          <label class="font-semibold">ID Agen Unik</label>
          <input
            v-model="form.agent_code"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
            placeholder="AGENT001"
          />
        </div>
        <div>
          <label class="font-semibold">Nama Lengkap</label>
          <input
            v-model="form.full_name"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
            placeholder="Nama Lengkap"
          />
        </div>
        <div>
          <label class="font-semibold">Alias</label>
          <input
            v-model="form.alias"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
            placeholder="Alias"
          />
        </div>
        <div>
          <label class="font-semibold">Email</label>
          <input
            v-model="form.email"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
            placeholder="Email"
          />
        </div>
        <div>
          <label class="font-semibold">Nomor Telepon</label>
          <input
            v-model="form.phone"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
            placeholder="Nomor Telepon"
          />
        </div>
        <div>
          <label class="font-semibold">Tanggal Mulai Bekerja</label>
          <input
            v-model="form.start_date"
            type="date"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
          />
        </div>
        <div>
          <label class="font-semibold">Status Ketenagakerjaan</label>
          <select
            v-model="form.employment_status"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
          >
            <option>Aktif</option>
            <option>Tidak Aktif</option>
            <option>Penuh Waktu</option>
            <option>Paruh Waktu</option>
            <option>Kontrak</option>
            <option>Tetap</option>
          </select>
        </div>
        <div>
          <label class="font-semibold">Foto Profil</label>
          <input
            type="text"
            v-model="form.avatar_url"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
            placeholder="URL Foto Profil"
          />
          <img
            v-if="form.avatar_url"
            :src="form.avatar_url"
            class="w-20 h-20 rounded-full mt-2"
          />
        </div>
      </div>
      <h2 class="text-2xl font-bold mb-6 mt-10">Data Ketersediaan & Jadwal</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-10">
        <div>
          <label class="font-semibold">Status Ketersediaan</label>
          <select
            v-model="form.availability_status"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
          >
            <option>Online</option>
            <option>Offline</option>
            <option>Sedang Sibuk</option>
            <option>Istirahat</option>
          </select>
        </div>
        <div>
          <label class="font-semibold">Jadwal Kerja (Shift)</label>
          <input
            v-model="shiftInput"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
            placeholder="cth: Senin-Jumat 08:00-17:00"
          />
          <button
            type="button"
            class="text-blue-600 underline text-sm"
            @click="addShift"
          >
            Tambah Shift
          </button>
          <ul class="text-xs mt-1">
            <li
              v-for="(shift, idx) in form.shift_schedule || []"
              :key="idx"
              class="flex items-center gap-2"
            >
              {{ shift }}
              <button
                type="button"
                @click="removeShift(idx)"
                class="text-red-500"
              >
                Hapus
              </button>
            </li>
          </ul>
        </div>
        <div>
          <label class="font-semibold">Kapasitas Konkuren</label>
          <input
            v-model.number="form.concurrent_capacity"
            type="number"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
            placeholder="Jumlah chat aktif"
          />
        </div>
        <div>
          <label class="font-semibold">Status Terakhir Online</label>
          <input
            v-model="form.last_online_at"
            type="datetime-local"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
          />
        </div>
      </div>
      <h2 class="text-2xl font-bold mb-6 mt-10">
        Data Keahlian & Spesialisasi
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-10">
        <div>
          <label class="font-semibold">Bahasa yang Dikuasai</label>
          <input
            v-model="languagesInput"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
            placeholder="Pisahkan dengan koma"
          />
          <button
            type="button"
            class="text-blue-600 underline text-sm"
            @click="addLanguage"
          >
            Tambah Bahasa
          </button>
          <ul class="text-xs mt-1">
            <li
              v-for="(lang, idx) in form.languages || []"
              :key="idx"
              class="flex items-center gap-2"
            >
              {{ lang }}
              <button
                type="button"
                @click="removeLanguage(idx)"
                class="text-red-500"
              >
                Hapus
              </button>
            </li>
          </ul>
        </div>
        <div>
          <label class="font-semibold">Keahlian Produk/Layanan</label>
          <input
            v-model="productInput"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
            placeholder="Pisahkan dengan koma"
          />
          <button
            type="button"
            class="text-blue-600 underline text-sm"
            @click="addProduct"
          >
            Tambah Produk
          </button>
          <ul class="text-xs mt-1">
            <li
              v-for="(prod, idx) in form.product_expertise || []"
              :key="idx"
              class="flex items-center gap-2"
            >
              {{ prod }}
              <button
                type="button"
                @click="removeProduct(idx)"
                class="text-red-500"
              >
                Hapus
              </button>
            </li>
          </ul>
        </div>
        <div>
          <label class="font-semibold">Keahlian Topik/Kategori</label>
          <input
            v-model="topicInput"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
            placeholder="Pisahkan dengan koma"
          />
          <button
            type="button"
            class="text-blue-600 underline text-sm"
            @click="addTopic"
          >
            Tambah Topik
          </button>
          <ul class="text-xs mt-1">
            <li
              v-for="(topic, idx) in form.topic_expertise || []"
              :key="idx"
              class="flex items-center gap-2"
            >
              {{ topic }}
              <button
                type="button"
                @click="removeTopic(idx)"
                class="text-red-500"
              >
                Hapus
              </button>
            </li>
          </ul>
        </div>
        <div>
          <label class="font-semibold">Level Keahlian</label>
          <select
            v-model="form.skill_level"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
          >
            <option>Dasar</option>
            <option>Menengah</option>
            <option>Ahli</option>
          </select>
        </div>
        <div>
          <label class="font-semibold">Departemen/Tim</label>
          <input
            v-model="form.department"
            class="w-full border border-gray-300 px-3 py-2 mb-2 bg-white"
            placeholder="Departemen/Tim"
          />
        </div>
      </div>
      <div class="flex gap-4 mt-8">
        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded">
          Simpan
        </button>
        <button
          type="button"
          class="bg-red-500 text-white px-6 py-2 rounded"
          @click="onDelete"
          v-if="form.id"
        >
          Hapus
        </button>
      </div>
      <div v-if="notif" class="mt-4 text-green-600">{{ notif }}</div>
      <div v-if="error" class="mt-4 text-red-600">{{ error }}</div>
    </form>
    <div v-else class="p-8 text-gray-400 text-center">
      Pilih agent manusia untuk melihat detail atau klik "Buat Agent Manusia"
      untuk tambah baru.
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import { useAgentStore } from "~/composables/useAgents";
import { useToast } from "~/composables/useToast";
const { showToast } = useToast();

const props = defineProps({ selectedAgent: Object });
const { updateAgent, deleteAgent, addAgent } = useAgentStore();

const form = ref(null);
const showForm = ref(false);
const notif = ref("");
const error = ref("");

// Input tambahan untuk array
const shiftInput = ref("");
const languagesInput = ref("");
const productInput = ref("");
const topicInput = ref("");

watch(
  () => props.selectedAgent,
  (val) => {
    if (val && (val.id || Object.keys(val).length === 0)) {
      // Deep clone agar tidak mengubah props langsung
      form.value = JSON.parse(JSON.stringify(val));
      if (!form.value.shift_schedule) form.value.shift_schedule = [];
      if (!form.value.languages) form.value.languages = [];
      if (!form.value.product_expertise) form.value.product_expertise = [];
      if (!form.value.topic_expertise) form.value.topic_expertise = [];
      showForm.value = true;
    } else {
      form.value = null;
      showForm.value = false;
    }
    notif.value = "";
    error.value = "";
  },
  { immediate: true }
);

function addShift() {
  if (shiftInput.value.trim()) {
    form.value.shift_schedule.push(shiftInput.value.trim());
    shiftInput.value = "";
  }
}
function removeShift(idx) {
  form.value.shift_schedule.splice(idx, 1);
}
function addLanguage() {
  if (languagesInput.value.trim()) {
    form.value.languages.push(languagesInput.value.trim());
    languagesInput.value = "";
  }
}
function removeLanguage(idx) {
  form.value.languages.splice(idx, 1);
}
function addProduct() {
  if (productInput.value.trim()) {
    form.value.product_expertise.push(productInput.value.trim());
    productInput.value = "";
  }
}
function removeProduct(idx) {
  form.value.product_expertise.splice(idx, 1);
}
function addTopic() {
  if (topicInput.value.trim()) {
    form.value.topic_expertise.push(topicInput.value.trim());
    topicInput.value = "";
  }
}
function removeTopic(idx) {
  form.value.topic_expertise.splice(idx, 1);
}

async function onSave() {
  notif.value = "";
  error.value = "";
  try {
    if (form.value.id) {
      await updateAgent(form.value.id, form.value);
      showToast({ message: "Data agent berhasil disimpan.", type: "success" });
    } else {
      // Tambah agent baru
      const newAgent = await addAgent({
        ...form.value,
        type: "manusia",
        is_active: true,
      });
      form.value = JSON.parse(JSON.stringify(newAgent));
      showToast({
        message: "Data agent berhasil ditambahkan.",
        type: "success",
      });
    }
  } catch (e) {
    showToast({
      message: e.message || "Gagal menyimpan data agent.",
      type: "error",
    });
  }
}
async function onDelete() {
  notif.value = "";
  error.value = "";
  try {
    await deleteAgent(form.value.id);
    showToast({ message: "Data agent berhasil dihapus.", type: "success" });
    form.value = null;
  } catch (e) {
    showToast({
      message: e.message || "Gagal menghapus data agent.",
      type: "error",
    });
  }
}
</script>
