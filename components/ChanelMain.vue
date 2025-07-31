<template>
  <div class="p-2">
    <div v-if="chanel">
      <div class="flex items-center mb-4">
        <!-- Tombol back hanya di mobile, di kiri avatar -->
        <button
          class="md:hidden mr-2 p-1 text-gray-700 hover:bg-gray-200 rounded-full"
          @click="$emit('back')"
          aria-label="Kembali ke daftar chanel"
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
          :src="getChanelAvatar(chanel)"
          :alt="chanel?.name"
        />
        <div>
          <span class="block font-semibold text-lg">{{ chanel?.name }}</span>
          <!-- ...status/info lain... -->
        </div>
      </div>
      <div class="flex gap-2 mb-4">
        <button
          class="px-5 py-2 font-medium border-b-2"
          :class="
            activeTab === 'integrasi'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-700 border-transparent'
          "
          @click="activeTab = 'integrasi'"
        >
          Integrasi
        </button>
        <button
          class="px-5 py-2 font-medium border-b-2"
          :class="
            activeTab === 'edit'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-700 border-transparent'
          "
          @click="activeTab = 'edit'"
        >
          Edit chanel
        </button>
      </div>
      <div v-if="activeTab === 'integrasi'">
        <div class="mb-4">
          <h3 class="text-lg font-bold mb-2">Integrasi Whatsapp</h3>
          <div class="flex gap-4 mb-4">
            <span
              :class="
                status.value != 'STOPPED' ? 'text-green-600' : 'text-red-400'
              "
            >
              Connection
              <span>{{ status != "STOPPED" ? "✔️" : "❌" }}</span>
            </span>
            <span
              :class="
                sessionStatus.authenticated ? 'text-green-600' : 'text-red-400'
              "
            >
              Authenticated
              <span>{{ sessionStatus.authenticated ? "✔️" : "❌" }}</span>
            </span>
            <span
              :class="sessionStatus.ready ? 'text-green-600' : 'text-red-400'"
            >
              Ready
              <span>{{ sessionStatus.ready ? "✔️" : "❌" }}</span>
            </span>
          </div>

          <div
            v-if="
              status == 'STARTING' ||
              status == 'STOPPED' ||
              (status == 'SCAN_QR_CODE' && !qrCode) ||
              restartingSession ||
              restartingWaha
            "
            class="flex items-center justify-center mb-2 h-48"
          >
            <span
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"
            ></span>
            <span class="text-blue-600 font-medium">
              {{
                restartingWaha
                  ? "Sedang restart WAHA..."
                  : restartingSession
                  ? "Sedang restart session..."
                  : status == "STOPPED"
                  ? "Menunggu sesi WhatsApp..."
                  : status == "STARTING"
                  ? "Sedang menyiapkan sesi WhatsApp..."
                  : "Memuat QR Code..."
              }}
            </span>
          </div>
          <div v-if="status == 'SCAN_QR_CODE' && qrCode">
            <img class="w-64 h-auto mx-auto" :src="qrCode" alt="QR Code" />
          </div>
          <div v-if="status == 'SCAN_QR_CODE'" class="text-gray-500 text-sm">
            Scan QR Code dengan Whatsapp Linked devices
          </div>
          <div v-if="sessionStatus.ready" class="text-center mb-4">
            <button
              class="bg-red-500 text-white px-4 py-2 rounded-lg"
              @click="onDisconnect"
            >
              Putuskan Hubungan
            </button>
          </div>

          <!-- Integrasi Agen AI -->
          <div class="mt-8">
            <h3 class="text-lg font-bold mb-2">Integrasi Agen AI</h3>
            <div v-if="activeAgentId === null" class="flex items-center mb-2">
              <span class="text-red-500 text-xl mr-2">●</span>
              <span class="font-medium">Agen Tidak Terhubung</span>
            </div>
            <div
              v-for="ai in aiAgents"
              :key="ai.id"
              class="bg-blue-50 px-4 py-3 rounded flex items-center justify-between mb-2"
            >
              <span>{{ ai.name }}</span>
              <button
                v-if="activeAgentId === ai.id"
                class="bg-red-600 text-white px-4 py-1 rounded"
                @click="onDisconnectAgentAI(ai.id)"
              >
                Putuskan
              </button>
              <button
                v-else
                class="bg-blue-600 text-white px-4 py-1 rounded"
                @click="onConnectAgentAI(ai.id)"
              >
                Hubungkan
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="activeTab === 'edit'">
        <form class="edit-chanel-form" @submit.prevent="onEditchanel">
          <div class="form-group">
            <label>Nama</label>
            <input v-model="editData.nama" class="form-input" />
          </div>
          <div class="form-group">
            <label>Takeover AI</label>
            <select v-model="editData.takeoverAI" class="form-input">
              <option value="0">Tidak Aktif</option>
              <option value="1">Aktif</option>
            </select>
          </div>
          <div class="form-group">
            <label>Waktu Takeover</label>
            <div style="display: flex; align-items: center; gap: 8px">
              <input
                v-model="editData.waktuTakeover"
                class="form-input"
                style="flex: 1"
              />
              <span>menit</span>
            </div>
          </div>
          <div class="form-group">
            <label>Limit Balasan AI</label>
            <select v-model="editData.limitBalasanAI" class="form-input">
              <option value="0">Tidak Aktif</option>
              <option value="1">Aktif</option>
            </select>
          </div>
          <div class="form-group">
            <label>Maksimum Balasan AI</label>
            <div style="display: flex; align-items: center; gap: 8px">
              <input
                v-model="editData.maksimumBalasanAI"
                class="form-input"
                style="flex: 1"
              />
              <span>balasan</span>
            </div>
          </div>
          <button class="edit-btn" type="submit">Edit chanel</button>
        </form>
        <div style="margin-top: 32px">
          <div style="color: #888; font-size: 1em; margin-bottom: 8px">
            Hapus chanel
          </div>
          <div style="color: #aaa; font-size: 0.95em; margin-bottom: 8px">
            Bila dilakukan, tindakan ini tidak bisa dikembalikan
          </div>
          <button class="delete-btn" @click="onDeletechanel">Hapus</button>
        </div>
      </div>
    </div>
    <div v-else style="padding: 32px; color: #888; text-align: center">
      Pilih chanel untuk melihat detail.
    </div>
  </div>
</template>
<script setup>
import { defineProps, ref, watch, onMounted, onUnmounted } from "vue";
import { useAgentStore } from "~/composables/useAgents";
import { useChanelstore } from "~/composables/useChanels";
import { useChanelAgentConnectionStore } from "~/composables/useChanelAgentConnections";
import { useToast } from "~/composables/useToast";
import { useSupabaseClient } from "#imports";
// Ambil config WAHA hanya dari import.meta.env
const baseUrl = import.meta.env.VITE_BASE_URL_WAHA;
const wahaApiKey = import.meta.env.VITE_WAHA_API;

const props = defineProps({ chanel: Object });
const emit = defineEmits([
  "update-whatsapp-number",
  "chanel-deleted",
  "channel-status-updated",
]);
const { aiAgents, fetchAgentsByType } = useAgentStore();
const { showToast } = useToast();
const supabase = useSupabaseClient();

// Pindahkan ke atas sebelum watcher
const { updatechanel, deletechanel } = useChanelstore();
const {
  connectAgentTochanel,
  disconnectAgentFromchanel,
  getActiveAgentForchanel,
} = useChanelAgentConnectionStore();

const qrCode = ref("");
const status = ref("");
const sessionStatus = ref({
  connection: false,
  authenticated: false,
  ready: false,
});
const pollingInterval = ref(null);
const restartingSession = ref(false); // Tambah state untuk loading restart
const restartingWaha = ref(false);

const activeTab = ref("integrasi");

// Data untuk edit chanel
const editData = ref({
  nama: "",
  takeoverAI: "0",
  waktuTakeover: "",
  limitBalasanAI: "0",
  maksimumBalasanAI: "",
});

const activeAgentId = ref(null);

function getChanelAvatar(chanel) {
  if (!chanel) return "";
  if (chanel.icon_url) return chanel.icon_url;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    chanel.name || "C"
  )}&background=random`;
}

// Watch untuk mengisi form dan cek agent aktif saat chanel berubah
watch(
  () => props.chanel,
  async (val) => {
    if (val) {
      console.log("[ChanelMain] Chanel data received:", val);
      console.log(
        "[ChanelMain] takeover_ai:",
        val.takeover_ai,
        "type:",
        typeof val.takeover_ai
      );
      console.log(
        "[ChanelMain] limit_balasan_ai:",
        val.limit_balasan_ai,
        "type:",
        typeof val.limit_balasan_ai
      );

      // Konversi boolean ke string dengan benar
      const takeoverAIValue = val.takeover_ai === true ? "1" : "0";
      const limitBalasanAIValue = val.limit_balasan_ai === true ? "1" : "0";

      editData.value = {
        nama: val.name || "",
        takeoverAI: takeoverAIValue,
        waktuTakeover: val.waktu_takeover?.toString() || "",
        limitBalasanAI: limitBalasanAIValue,
        maksimumBalasanAI: val.maksimum_balasan_ai?.toString() || "",
      };

      console.log("[ChanelMain] editData set to:", editData.value);

      // Cek agent aktif
      if (val.id) {
        const active = await getActiveAgentForchanel(val.id);
        activeAgentId.value = active ? active.agent_id : null;
      }
    }
  },
  { immediate: true }
);

function startPolling(sessionName) {
  stopPolling();
  pollingInterval.value = setInterval(
    () => {
      fetchSessionStatus(sessionName);
    },
    status.value === "SCAN_QR_CODE" ? 4000 : 30000
  ); // 4 detik saat QR, 30 detik saat lain
}

function stopPolling() {
  if (pollingInterval.value) clearInterval(pollingInterval.value);
  pollingInterval.value = null;
}

async function fetchSessionStatus(sessionName) {
  try {
    const res = await fetch(`${baseUrl}/api/sessions/${sessionName}`, {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": wahaApiKey,
      },
    });
    const data = await res.json();

    // Handle status FAILED - coba restart WAHA dan session
    if (data.status === "FAILED") {
      restartingSession.value = true;
      restartingWaha.value = true;
      try {
        // 1. Restart WAHA service
        await fetch(`${baseUrl}/api/sessions/${sessionName}/restart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": wahaApiKey,
          },
        });
        restartingWaha.value = false;

        // 2. Stop session
        await fetch(`${baseUrl}/api/sessions/${sessionName}/stop`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": wahaApiKey,
          },
        });

        // 3. Start session lagi
        await fetch(`${baseUrl}/api/sessions/${sessionName}/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": wahaApiKey,
          },
        });
        status.value = "SCAN_QR_CODE";
      } catch (restartErr) {
        console.error("[chanelMain] Gagal restart WAHA/session:", restartErr);
        status.value = data.status;
      } finally {
        restartingSession.value = false;
        restartingWaha.value = false;
      }
    } else {
      status.value = data.status;
    }

    sessionStatus.value = {
      connection: status.value === "SCAN_QR_CODE" || status.value === "WORKING",
      authenticated: status.value === "WORKING",
      ready: status.value === "WORKING",
    };

    // Update is_active field in database based on session status
    if (props.chanel && props.chanel.id) {
      const isActive = status.value === "WORKING";
      await updateChannelActiveStatus(props.chanel.id, isActive);
    }

    // QR code
    if (status.value === "SCAN_QR_CODE") {
      try {
        const qrRes = await fetch(
          `${baseUrl}/api/screenshot?session=${encodeURIComponent(
            sessionName
          )}`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": wahaApiKey,
            },
          }
        );
        if (qrRes.ok) {
          const qrBlob = await qrRes.blob();
          qrCode.value = URL.createObjectURL(qrBlob);
        } else {
          qrCode.value = "";
        }
      } catch (err) {
        qrCode.value = "";
      }
    } else {
      qrCode.value = "";
    }
    // Update nomor WA jika ada
    if (data.me && data.me.id && props.chanel && props.chanel.id) {
      const whatsappNumber = data.me.id.replace("@c.us", "");
      emit("update-whatsapp-number", props.chanel.id, whatsappNumber);
    }
    // Restart polling jika status berubah
    if (pollingInterval.value) {
      stopPolling();
      startPolling(sessionName);
    }
  } catch (e) {
    restartingSession.value = false;
    restartingWaha.value = false;
    sessionStatus.value = {
      connection: false,
      authenticated: false,
      ready: false,
    };
    qrCode.value = "";

    // Update is_active to false when there's an error
    if (props.chanel && props.chanel.id) {
      await updateChannelActiveStatus(props.chanel.id, false);
    }
  }
}

watch(
  () => props.chanel,
  (val) => {
    stopPolling();
    if (val && val.session_name) {
      fetchSessionStatus(val.session_name);
      startPolling(val.session_name);
    }
  },
  { immediate: true }
);

// Watch for session status changes to update database
watch(
  () => sessionStatus.value.ready,
  async (isReady) => {
    if (props.chanel && props.chanel.id) {
      const currentStatus = isReady;
      // Only update if the status is different from what we expect
      if (currentStatus !== props.chanel.is_active) {
        await updateChannelActiveStatus(props.chanel.id, currentStatus);
      }
    }
  }
);

onUnmounted(() => {
  stopPolling();
});

onMounted(async () => {
  await fetchAgentsByType("ai");
});

async function onEditchanel() {
  try {
    await updatechanel(props.chanel.id, {
      name: editData.value.nama,
      takeover_ai: editData.value.takeoverAI === "1",
      waktu_takeover: parseInt(editData.value.waktuTakeover) || 0,
      limit_balasan_ai: editData.value.limitBalasanAI === "1",
      maksimum_balasan_ai: parseInt(editData.value.maksimumBalasanAI) || 0,
    });
    showToast({ message: "chanel berhasil diupdate!", type: "success" });
  } catch (err) {
    console.error("Error updating chanel:", err);
    showToast({
      message: "Gagal mengupdate chanel: " + err.message,
      type: "error",
    });
  }
}

async function onDeletechanel() {
  if (confirm("Yakin ingin menghapus chanel ini?")) {
    try {
      // Jika chanel WhatsApp dan punya session_name, hapus session di WAHA
      if (props.chanel.type === "whatsapp" && props.chanel.session_name) {
        try {
          await fetch(`${baseUrl}/api/sessions/${props.chanel.session_name}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": wahaApiKey,
            },
          });
        } catch (e) {
          console.error("Gagal menghapus session WAHA:", e);
        }
      }
      await deletechanel(props.chanel.id);
      showToast({ message: "chanel berhasil dihapus!", type: "success" });
      emit("chanel-deleted"); // Emit event ke parent untuk reset chanel dan refresh list
    } catch (err) {
      console.error("Error deleting chanel:", err);
      showToast({
        message: "Gagal menghapus chanel: " + err.message,
        type: "error",
      });
    }
  }
}
async function onDisconnect() {
  // Panggil API logout, lalu refresh status session
  try {
    const sessionName =
      props.chanel && props.chanel.session_name
        ? props.chanel.session_name
        : "default";
    await fetch(`${baseUrl}/api/sessions/${sessionName}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": wahaApiKey,
      },
    });

    // Update is_active to false when manually disconnecting
    if (props.chanel && props.chanel.id) {
      await updateChannelActiveStatus(props.chanel.id, false);
    }

    await fetchSessionStatus(sessionName);
  } catch (e) {
    showToast({ message: "Gagal memutuskan hubungan!", type: "error" });
  }
}

async function onConnectAgentAI(agentId) {
  if (!props.chanel || !props.chanel.id) return;
  try {
    await connectAgentTochanel(props.chanel.id, agentId);
    await fetchSessionStatus(props.chanel.session_name);
    // Refresh agent aktif
    const active = await getActiveAgentForchanel(props.chanel.id);
    activeAgentId.value = active ? active.agent_id : null;
    showToast({
      message: "Agent AI berhasil dihubungkan ke chanel!",
      type: "success",
    });
  } catch (err) {
    showToast({
      message: "Gagal menghubungkan agent AI: " + (err?.message || err),
      type: "error",
    });
  }
}

async function onDisconnectAgentAI(agentId) {
  if (!props.chanel || !props.chanel.id) return;
  try {
    await disconnectAgentFromchanel(props.chanel.id, agentId);
    await fetchSessionStatus(props.chanel.session_name);
    // Refresh agent aktif
    const active = await getActiveAgentForchanel(props.chanel.id);
    activeAgentId.value = active ? active.agent_id : null;
    showToast({
      message: "Agent AI berhasil diputuskan dari chanel!",
      type: "success",
    });
  } catch (err) {
    showToast({
      message: "Gagal memutuskan agent AI: " + (err?.message || err),
      type: "error",
    });
  }
}

async function updateChannelActiveStatus(chanelId, isActive) {
  try {
    const { data, error } = await supabase
      .from("chanels")
      .update({ is_active: isActive })
      .eq("id", chanelId)
      .select()
      .single();

    if (error) {
      console.error("Error updating channel active status:", error);
      throw error;
    }
    console.log("Channel active status updated successfully:", data);

    // Show toast notification
    if (isActive) {
      showToast({
        message: "Channel berhasil terhubung dan aktif!",
        type: "success",
      });
    } else {
      showToast({
        message: "Channel telah diputuskan dan tidak aktif",
        type: "warning",
      });
    }

    // Emit event to parent component
    emit("channel-status-updated", { chanelId, isActive });
  } catch (err) {
    console.error("Error updating channel active status:", err);
    showToast({
      message: "Gagal mengupdate status channel",
      type: "error",
    });
    throw err;
  }
}
</script>
<style scoped>
.edit-chanel-form {
  margin-top: 32px;
  background: #fff;
  border-radius: 8px;
  padding: 18px 12px 12px 12px;
  box-shadow: 0 1px 4px #0001;
  max-width: 900px;
}
.form-group {
  margin-bottom: 18px;
}
.form-group label {
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
}
.form-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d0d0d0;
  font-size: 1em;
  margin-top: 4px;
  margin-bottom: 2px;
  background: #fafbfc;
}
.edit-btn {
  background: #005fa3;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-size: 1em;
  cursor: pointer;
  margin-top: 12px;
}
.delete-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-size: 1em;
  cursor: pointer;
  margin-top: 8px;
}
.disconnect-btn {
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-size: 1em;
  cursor: pointer;
  margin-top: 8px;
}
</style>
