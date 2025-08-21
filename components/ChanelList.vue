<template>
  <div class="flex flex-col h-[100vh]">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-800">Chanel</h3>
        <button
          v-if="!limitChanel"
          @click="showForm = !showForm"
          class="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          title="Tambah Chanel"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
    <ChanelModal :show="showForm" @close="showForm = false">
      <form @submit.prevent="addchanel">
        <input
          v-model="newchanel.name"
          type="text"
          placeholder="Nama chanel"
          required
          :class="[
            'px-3 mb-3 py-2 text-base border rounded w-full',
            nameError ? 'border-red-500' : 'border-gray-300',
          ]"
        />
        <p v-if="nameError" class="text-red-500 text-sm mb-3">
          {{ nameError }}
        </p>

        <button
          type="submit"
          class="px-4 py-2 ml-2 bg-blue-500 text-white rounded cursor-pointer border-none"
        >
          Simpan
        </button>
      </form>
    </ChanelModal>
    <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="p-4 space-y-3">
        <div
          class="flex items-center p-3 relative cursor-pointer rounded-lg transition-all duration-200 border border-transparent hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:scale-[1.02]"
          v-for="(chanel, idx) in chanels"
          :key="idx"
          @click="selectchanel(chanel)"
        >
          <img
            :src="chanel.icon_url || '/default-chanel-icon.png'"
            class="w-10 h-10"
          />
          <div class="ml-4 flex-1">
            <div class="font-medium">{{ chanel.name || "Unnamed chanel" }}</div>
            <div class="text-gray-500">
              {{ chanel.whatsapp_number || "Belum terhubung" }}
            </div>
          </div>
        </div>
        <div
          v-if="!chanels || chanels.length === 0"
          class="text-gray-500 text-center py-8"
        >
          No chanels found. Create your first chanel above.
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { useChanelstore } from "~/composables/useChanels";
import ChanelModal from "~/components/ChanelModal.vue";
import { useToast } from "~/composables/useToast";
import { useRouter } from "vue-router";
import { useSupabaseUser, useSupabaseClient } from "#imports";

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter();
// HAPUS: import { useRuntimeConfig } from "#app";
const { showToast } = useToast();

// HAPUS: const runtimeConfig = useRuntimeConfig();

const {
  chanels,
  loading,
  error,
  fetchchanels,
  addchanel: addchanelToDB,
  updatechanel,
  deletechanel,
} = useChanelstore();
const showForm = ref(false);
const newchanel = ref({ name: "", type: "whatsapp" });
const nameError = ref(null); // Added

const emit = defineEmits(["select-chanel"]);

const props = defineProps({
  refreshKey: { type: Number, default: 0 }, // untuk trigger refresh dari parent
});

// Added validateName function
const validateName = () => {
  const regex = /^[a-zA-Z0-9_-]*$/;
  if (!regex.test(newchanel.value.name)) {
    nameError.value =
      "Session name can only contain alphanumeric characters, hyphens, and underscores ( a-z, A-Z, 0-9, -, _ ).";
    return false;
  }
  nameError.value = null;
  return true;
};

// Ambil configwahanya dari import.meta.env
const wahaUsername = import.meta.env.VITE_WAHA_USERNAME || "";
const wahaPassword = import.meta.env.VITE_WAHA_PASSWORD || "";
const wahaApiKey = import.meta.env.VITE_WAHA_API || "";
const baseUrl = import.meta.env.VITE_BASE_URL_WAHA;
const publicBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL;
const limitChanel = ref(false);
const wahaAuth =
  wahaUsername && wahaPassword
    ? "Basic " + btoa(`${wahaUsername}:${wahaPassword}`)
    : undefined;

async function addchanel() {
  try {
    // Call validateName before proceeding
    if (!validateName()) {
      return; // Stop if validation fails
    }

    let iconUrl = "";
    if (newchanel.value.type === "whatsapp") {
      iconUrl = "https://img.icons8.com/color/48/000000/whatsapp--v1.png";
    } else if (newchanel.value.type === "messenger") {
      iconUrl =
        "https://img.icons8.com/color/48/000000/facebook-messenger--v1.png";
    }

    let createdchanel = null;
    try {
      // Step 1: Simpan data chanel awal ke database untuk mendapatkan ID
      createdchanel = await addchanelToDB({
        name: newchanel.value.name,
        type: newchanel.value.type,
        icon_url: iconUrl,
        whatsapp_number: "",
        takeover_ai: true,
        waktu_takeover: 0,
      });

      await fetchchanels(); // Refresh daftar chanel untuk mendapatkan chanel yang baru dibuat
      // Jika chanel WhatsApp, buat session baru di WAHA
      if (newchanel.value.type === "whatsapp") {
        const webhookUrl = `${publicBaseUrl}/api/waha-webhook`;

        if (createdchanel) {
          try {
            const res = await fetch(`${baseUrl}/api/sessions`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Api-Key": wahaApiKey,
              },
              body: JSON.stringify({
                name: createdchanel.name,
                config: {
                  webhooks: [
                    {
                      url: webhookUrl,
                      events: ["message.any"],
                      hmac: { key: null },
                      retries: {
                        delaySeconds: 2,
                        attempts: 15,
                        policy: "exponential",
                      },
                      customHeaders: null,
                    },
                  ],
                  metadata: { 
                    chanel_id: createdchanel.id,
                    i: user.value.id,
                    is_manual_broadcast:"0",
                    is_auto_message: "0",
                    is_scheduled_message: "0",
                  },
                  noweb: {
                    markOnline: true,
                    store: {
                      enabled: false,
                      fullSync: false,
                    },
                  },
                },
              }),
            });
            const sessionResp = await res.json();
            if (sessionResp && sessionResp.name) {
              // Update chanel di database, set session_name
              await updatechanel(createdchanel.id, {
                session_name: sessionResp.name,
              });
              showToast({
                message: "Chanel berhasil ditambahkan dan sesi Wa dibuat!",
                type: "success",
              });
            } else {
              // Jika pembuatan sesiwagagal, hapus chanel dari database
              await deletechanel(createdchanel.id);
              await fetchchanels(); // Refresh daftar chanel setelah penghapusan
              showToast({
                message: "Gagal membuat sesi Wa, chanel dihapus.",
                type: "error",
              });
            }
          } catch (e) {
            console.error("Gagal membuat session Wa:", e);
            // Jika terjadi error saat fetch, hapus chanel dari database
            if (createdchanel) {
              await deletechanel(createdchanel.id);
              await fetchchanels(); // Refresh daftar chanel setelah penghapusan
            }
            showToast({
              message: "Gagal membuat sesi Wa, chanel dihapus.",
              type: "error",
            });
          }
        }
      } else {
        // Jika bukan chanel WhatsApp, langsung sukses
        showToast({ message: "Chanel berhasil ditambahkan!", type: "success" });
      }

      newchanel.value = { name: "", type: "whatsapp" };
      showForm.value = false;
    } catch (err) {
      console.error("Error adding chanel:", err);
      showToast({
        message: `Gagal menambahkan chanel: ${err.message}`,
        type: "error",
      });
    }
  } catch (err) {
    // This is the new catch block for the outermost try
    console.error("Error adding chanel (outer):", err);
    showToast({
      message: `Gagal menambahkan chanel: ${err.message}`,
      type: "error",
    });
  }
}

async function removechanel(chanel) {
  try {
    // Jika chanel WhatsApp dan punya session_name, hapus session di WAHA
    if (chanel.type === "whatsapp" && chanel.session_name) {
      try {
        await fetch(`${baseUrl}/api/sessions/${chanel.session_name}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": wahaApiKey,
          },
        });
      } catch (e) {
        console.error("Gagal menghapus session Wa:", e);
      }
    }
    await deletechanel(chanel.id);
    await fetchchanels();
  } catch (err) {
    console.error("Error deleting chanel:", err);
    showToast({ message: "Gagal menghapus chanel", type: "error" });
  }
}

function selectchanel(chanel) {
  // Start session diwajika chanel bertipe WhatsApp
  if (chanel.type === "whatsapp") {
    fetch(`${baseUrl}/api/sessions/${chanel.session_name}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": wahaApiKey,
      },
    }).catch((e) => {
      console.error("Gagal start session Wa:", e);
    });
  }

  emit("select-chanel", chanel);
}

// Function to update WhatsApp number for a chanel
async function updatechanelWhatsAppNumber(chanelId, whatsappNumber) {
  try {
    const { updateWhatsAppNumber } = useChanelstore();
    await updateWhatsAppNumber(chanelId, whatsappNumber);
  } catch (err) {
    console.error("Error updating WhatsApp number:", err);
  }
}

defineExpose({
  updatechanelWhatsAppNumber,
});
async function getCountChanel() {
  const { data: userData } = await supabase
    .from("users")
    .select("*,package(*)")
    .eq("auth_id", user.value.id)
    .single();
  if (new Date().getTime() >= new Date(userData.end_at).getTime()) {
    router.push("/views/dashboard");
  }
  const { count:countChanel } = await supabase
    .from("chanels")
    .select('*', { count: 'exact' })
    .eq("is_active",true)
    .eq("created_by", user.value.id);
    console.log(countChanel)
  limitChanel.value = countChanel > userData.package.limit_chanel;
}

onMounted(async () => {
  getCountChanel();
  await fetchchanels();
});

watch(
  () => props.refreshKey,
  async () => {
    await fetchchanels();
  }
);
</script>
