<template>
  <div class="w-full p-2 md:p-8 h-full flex flex-col">
    <div
      class="flex items-center mb-4 bg-white p-3 rounded-lg"
      v-if="selectedAgent"
    >
      <!-- Tombol back hanya di mobile, di kiri avatar -->
      <button
        class="md:hidden mr-2 p-1 text-gray-700 hover:bg-gray-200 rounded-full"
        @click="$emit('back')"
        aria-label="Kembali ke daftar agent"
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
        :src="getAgentAvatar(selectedAgent)"
        :alt="selectedAgent?.name"
      />
      <div>
        <span class="block font-semibold text-lg">{{
          selectedAgent?.name
        }}</span>
        <!-- ...status/info lain... -->
      </div>
    </div>

    <div
      v-if="showForm"
      class="bg-white rounded-lg shadow-xl w-full max-w-full overflow-y-auto p-4 mb-4 flex-1"
    >
      <form @submit.prevent="onSave">
        <!-- Data Profil Agen Section -->
        <div class="mb-6">
          <div class="mb-4">
            <label class="block font-medium text-gray-700 mb-2">
              Nama <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              required
              class="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nama Lengkap"
            />
          </div>
          <div class="mb-4">
            <label class="block font-medium text-gray-700 mb-2">
              Nomor Telepon <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <select
                v-model="selectedCountryCode"
                class="w-1/3 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="62">🇮🇩 +62</option>
                <option value="60">🇲🇾 +60</option>
                <option value="65">🇸🇬 +65</option>
                <option value="66">🇹🇭 +66</option>
                <option value="84">🇻🇳 +84</option>
                <option value="63">🇵🇭 +63</option>
                <option value="1">🇺🇸 +1</option>
                <option value="44">🇬🇧 +44</option>
                <option value="49">🇩🇪 +49</option>
                <option value="33">🇫🇷 +33</option>
                <option value="39">🇮🇹 +39</option>
                <option value="34">🇪🇸 +34</option>
                <option value="31">🇳🇱 +31</option>
                <option value="46">🇸🇪 +46</option>
                <option value="47">🇳🇴 +47</option>
                <option value="45">🇩🇰 +45</option>
                <option value="358">🇫🇮 +358</option>
                <option value="41">🇨🇭 +41</option>
                <option value="43">🇦🇹 +43</option>
                <option value="32">🇧🇪 +32</option>
                <option value="351">🇵🇹 +351</option>
                <option value="353">🇮🇪 +353</option>
                <option value="30">🇬🇷 +30</option>
                <option value="48">🇵🇱 +48</option>
                <option value="420">🇨🇿 +420</option>
                <option value="36">🇭🇺 +36</option>
                <option value="421">🇸🇰 +421</option>
                <option value="386">🇸🇮 +386</option>
                <option value="385">🇭🇷 +385</option>
                <option value="371">🇱🇻 +371</option>
                <option value="372">🇪🇪 +372</option>
                <option value="370">🇱🇹 +370</option>
                <option value="7">🇷🇺 +7</option>
                <option value="380">🇺🇦 +380</option>
                <option value="375">🇧🇾 +375</option>
                <option value="81">🇯🇵 +81</option>
                <option value="82">🇰🇷 +82</option>
                <option value="86">🇨🇳 +86</option>
                <option value="852">🇭🇰 +852</option>
                <option value="886">🇹🇼 +886</option>
                <option value="91">🇮🇳 +91</option>
                <option value="880">🇧🇩 +880</option>
                <option value="94">🇱🇰 +94</option>
                <option value="95">🇲🇲 +95</option>
                <option value="856">🇱🇦 +856</option>
                <option value="855">🇰🇭 +855</option>
                <option value="673">🇧🇳 +673</option>
                <option value="670">🇹🇱 +670</option>
                <option value="672">🇦🇺 +672</option>
                <option value="64">🇳🇿 +64</option>
                <option value="61">🇦🇺 +61</option>
                <option value="27">🇿🇦 +27</option>
                <option value="20">🇪🇬 +20</option>
                <option value="212">🇲🇦 +212</option>
                <option value="216">🇹🇳 +216</option>
                <option value="213">🇩🇿 +213</option>
                <option value="218">🇱🇾 +218</option>
                <option value="249">🇸🇩 +249</option>
                <option value="251">🇪🇹 +251</option>
                <option value="254">🇰🇪 +254</option>
                <option value="255">🇹🇿 +255</option>
                <option value="256">🇺🇬 +256</option>
                <option value="233">🇬🇭 +233</option>
                <option value="234">🇳🇬 +234</option>
                <option value="225">🇨🇮 +225</option>
                <option value="221">🇸🇳 +221</option>
                <option value="237">🇨🇲 +237</option>
                <option value="236">🇨🇫 +236</option>
                <option value="235">🇹🇩 +235</option>
                <option value="241">🇬🇦 +241</option>
                <option value="242">🇨🇬 +242</option>
                <option value="243">🇨🇩 +243</option>
                <option value="244">🇦🇴 +244</option>
                <option value="245">🇬🇼 +245</option>
                <option value="246">🇮🇴 +246</option>
                <option value="247">🇦🇨 +247</option>
                <option value="248">🇸🇨 +248</option>
                <option value="250">🇷🇼 +250</option>
                <option value="252">🇸🇴 +252</option>
                <option value="253">🇩🇯 +253</option>
                <option value="257">🇧🇮 +257</option>
                <option value="258">🇲🇿 +258</option>
                <option value="259">🇿🇲 +259</option>
                <option value="260">🇿🇲 +260</option>
                <option value="261">🇲🇬 +261</option>
                <option value="262">🇷🇪 +262</option>
                <option value="263">🇿🇼 +263</option>
                <option value="264">🇳🇦 +264</option>
                <option value="265">🇲🇼 +265</option>
                <option value="266">🇱🇸 +266</option>
                <option value="267">🇧🇼 +267</option>
                <option value="268">🇸🇿 +268</option>
                <option value="269">🇰🇲 +269</option>
                <option value="290">🇸🇭 +290</option>
                <option value="291">🇪🇷 +291</option>
                <option value="297">🇦🇼 +297</option>
                <option value="298">🇫🇴 +298</option>
                <option value="299">🇬🇱 +299</option>
                <option value="350">🇬🇮 +350</option>
                <option value="352">🇱🇺 +352</option>
                <option value="354">🇮🇸 +354</option>
                <option value="355">🇦🇱 +355</option>
                <option value="356">🇲🇹 +356</option>
                <option value="357">🇨🇾 +357</option>
                <option value="359">🇧🇬 +359</option>
                <option value="373">🇲🇩 +373</option>
                <option value="374">🇦🇲 +374</option>
                <option value="376">🇦🇩 +376</option>
                <option value="377">🇲🇨 +377</option>
                <option value="378">🇸🇲 +378</option>
                <option value="379">🇻🇦 +379</option>
                <option value="381">🇷🇸 +381</option>
                <option value="382">🇲🇪 +382</option>
                <option value="383">🇽🇰 +383</option>
                <option value="387">🇧🇦 +387</option>
                <option value="389">🇲🇰 +389</option>
                <option value="40">🇷🇴 +40</option>
                <option value="423">🇱🇮 +423</option>
                <option value="500">🇫🇰 +500</option>
                <option value="501">🇧🇿 +501</option>
                <option value="502">🇬🇹 +502</option>
                <option value="503">🇸🇻 +503</option>
                <option value="504">🇭🇳 +504</option>
                <option value="505">🇳🇮 +505</option>
                <option value="506">🇨🇷 +506</option>
                <option value="507">🇵🇦 +507</option>
                <option value="508">🇵🇲 +508</option>
                <option value="509">🇭🇹 +509</option>
                <option value="51">🇵🇪 +51</option>
                <option value="52">🇲🇽 +52</option>
                <option value="53">🇨🇺 +53</option>
                <option value="54">🇦🇷 +54</option>
                <option value="55">🇧🇷 +55</option>
                <option value="56">🇨🇱 +56</option>
                <option value="57">🇨🇴 +57</option>
                <option value="58">🇻🇪 +58</option>
                <option value="590">🇬🇵 +590</option>
                <option value="591">🇧🇴 +591</option>
                <option value="592">🇬🇾 +592</option>
                <option value="593">🇪🇨 +593</option>
                <option value="594">🇬🇫 +594</option>
                <option value="595">🇵🇾 +595</option>
                <option value="596">🇲🇶 +596</option>
                <option value="597">🇸🇷 +597</option>
                <option value="598">🇺🇾 +598</option>
                <option value="599">🇧🇶 +599</option>
                <option value="674">🇳🇷 +674</option>
                <option value="675">🇵🇬 +675</option>
                <option value="676">🇹🇴 +676</option>
                <option value="677">🇸🇧 +677</option>
                <option value="678">🇻🇺 +678</option>
                <option value="679">🇫🇯 +679</option>
                <option value="680">🇵🇼 +680</option>
                <option value="681">🇼🇫 +681</option>
                <option value="682">🇨🇰 +682</option>
                <option value="683">🇳🇺 +683</option>
                <option value="685">🇼🇸 +685</option>
                <option value="686">🇰🇮 +686</option>
                <option value="687">🇳🇨 +687</option>
                <option value="688">🇹🇻 +688</option>
                <option value="689">🇵🇫 +689</option>
                <option value="690">🇹🇰 +690</option>
                <option value="691">🇫🇲 +691</option>
                <option value="692">🇲🇭 +692</option>
                <option value="850">🇰🇵 +850</option>
                <option value="852">🇭🇰 +852</option>
                <option value="853">🇲🇴 +853</option>
                <option value="880">🇧🇩 +880</option>
                <option value="886">🇹🇼 +886</option>
                <option value="90">🇹🇷 +90</option>
                <option value="92">🇵🇰 +92</option>
                <option value="93">🇦🇫 +93</option>
                <option value="960">🇲🇻 +960</option>
                <option value="961">🇱🇧 +961</option>
                <option value="962">🇯🇴 +962</option>
                <option value="963">🇸🇾 +963</option>
                <option value="964">🇮🇶 +964</option>
                <option value="965">🇰🇼 +965</option>
                <option value="966">🇸🇦 +966</option>
                <option value="967">🇾🇪 +967</option>
                <option value="968">🇴🇲 +968</option>
                <option value="970">🇵🇸 +970</option>
                <option value="971">🇦🇪 +971</option>
                <option value="972">🇮🇱 +972</option>
                <option value="973">🇧🇭 +973</option>
                <option value="974">🇶🇦 +974</option>
                <option value="975">🇧🇹 +975</option>
                <option value="976">🇲🇳 +976</option>
                <option value="977">🇳🇵 +977</option>
                <option value="98">🇮🇷 +98</option>
                <option value="992">🇹🇯 +992</option>
                <option value="993">🇹🇲 +993</option>
                <option value="994">🇦🇿 +994</option>
                <option value="995">🇬🇪 +995</option>
                <option value="996">🇰🇬 +996</option>
                <option value="998">🇺🇿 +998</option>
              </select>
              <input
                type="text"
                v-model="phoneNumber"
                required
                class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nomor Telepon"
              />
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {{ form?.id ? "Update" : "Simpan" }}
          </button>
          <button
            v-if="form?.id"
            type="button"
            @click="onDelete"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Hapus
          </button>
        </div>
      </form>
    </div>

    <div
      v-if="!showForm && !selectedAgent"
      class="p-4 md:p-8 text-gray-400 text-center flex-1 flex items-center justify-center"
    >
      Pilih agent manusia untuk melihat detail atau klik "Buat Agent Manusia"
      untuk tambah baru.
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useAgentStore } from "~/composables/useAgents";
import { useToast } from "~/composables/useToast";
const { showToast } = useToast();

const props = defineProps({ selectedAgent: Object });
const { updateAgent, deleteAgent, addAgent, fetchAgentsByType } =
  useAgentStore();
const emit = defineEmits(["refresh-list", "clear-selected"]);

const form = ref(null);
const showForm = ref(false);
const notif = ref("");
const error = ref("");

// Horizontal agent manusia list
const agentList = ref([]);
onMounted(async () => {
  agentList.value = await fetchAgentsByType("manusia");
});
function selectAgent(agent) {
  form.value = JSON.parse(JSON.stringify(agent));
  showForm.value = true;
}

// Default selected country code
const selectedCountryCode = ref("62"); // Default to Indonesia
const phoneNumber = ref("");

watch(
  () => props.selectedAgent,
  (val) => {
    if (val && (val.id || Object.keys(val).length === 0)) {
      // Deep clone agar tidak mengubah props langsung
      form.value = JSON.parse(JSON.stringify(val));

      // Parse phone number if it exists
      if (form.value.phone) {
        const phoneParts = parsePhoneNumber(form.value.phone);
        selectedCountryCode.value = phoneParts.countryCode;
        phoneNumber.value = phoneParts.number;
      } else {
        selectedCountryCode.value = "62";
        phoneNumber.value = "";
      }

      showForm.value = true;
    } else {
      form.value = null;
      showForm.value = false;
      selectedCountryCode.value = "62";
      phoneNumber.value = "";
    }
    notif.value = "";
    error.value = "";
  },
  { immediate: true }
);

// Function to parse phone number into country code and number
function parsePhoneNumber(phone) {
  if (!phone) return { countryCode: "62", number: "" };

  // Find matching country code
  const countryCodes = [
    "62",
    "60",
    "65",
    "66",
    "84",
    "63",
    "1",
    "44",
    "49",
    "33",
    "39",
    "34",
    "31",
    "46",
    "47",
    "45",
    "358",
    "41",
    "43",
    "32",
    "351",
    "353",
    "30",
    "48",
    "420",
    "36",
    "421",
    "386",
    "385",
    "371",
    "372",
    "370",
    "7",
    "380",
    "375",
    "81",
    "82",
    "86",
    "852",
    "886",
    "91",
    "880",
    "94",
    "95",
    "856",
    "855",
    "673",
    "670",
    "672",
    "64",
    "61",
    "27",
    "20",
    "212",
    "216",
    "213",
    "218",
    "249",
    "251",
    "254",
    "255",
    "256",
    "233",
    "234",
    "225",
    "221",
    "237",
    "236",
    "235",
    "241",
    "242",
    "243",
    "244",
    "245",
    "246",
    "247",
    "248",
    "250",
    "252",
    "253",
    "257",
    "258",
    "259",
    "260",
    "261",
    "262",
    "263",
    "264",
    "265",
    "266",
    "267",
    "268",
    "269",
    "290",
    "291",
    "297",
    "298",
    "299",
    "350",
    "352",
    "354",
    "355",
    "356",
    "357",
    "359",
    "373",
    "374",
    "376",
    "377",
    "378",
    "379",
    "381",
    "382",
    "383",
    "387",
    "389",
    "40",
    "423",
    "500",
    "501",
    "502",
    "503",
    "504",
    "505",
    "506",
    "507",
    "508",
    "509",
    "51",
    "52",
    "53",
    "54",
    "55",
    "56",
    "57",
    "58",
    "590",
    "591",
    "592",
    "593",
    "594",
    "595",
    "596",
    "597",
    "598",
    "599",
    "674",
    "675",
    "676",
    "677",
    "678",
    "679",
    "680",
    "681",
    "682",
    "683",
    "685",
    "686",
    "687",
    "688",
    "689",
    "690",
    "691",
    "692",
    "850",
    "853",
    "880",
    "886",
    "90",
    "92",
    "93",
    "960",
    "961",
    "962",
    "963",
    "964",
    "965",
    "966",
    "967",
    "968",
    "970",
    "971",
    "972",
    "973",
    "974",
    "975",
    "976",
    "977",
    "98",
    "992",
    "993",
    "994",
    "995",
    "996",
    "998",
  ];

  for (const code of countryCodes) {
    if (phone.startsWith(code)) {
      return {
        countryCode: code,
        number: phone.substring(code.length),
      };
    }
  }

  // Default to Indonesia if no match found
  return { countryCode: "62", number: phone };
}


// Normalisasi nomor telepon ke format 62 (tanpa plus)
function normalizePhoneNumber(phone) {
  let normalized = (phone || '').replace(/[\s\-\("\\]/g, "");
  if (normalized.startsWith("+62")) {
    normalized = normalized.substring(1);
  } else if (normalized.startsWith("62")) {
    // sudah benar
  } else if (normalized.startsWith("0")) {
    normalized = "62" + normalized.substring(1);
  } else if (normalized.startsWith("8")) {
    normalized = "62" + normalized;
  } else if (normalized.startsWith("+")) {
    normalized = normalized.substring(1);
  } else {
    if (normalized.length >= 9 && normalized.length <= 13) {
      normalized = "62" + normalized;
    }
  }
  return normalized;
}

// Gabungkan kode negara dan nomor, lalu normalisasi
function getFullPhoneNumber() {
  return normalizePhoneNumber(selectedCountryCode.value + phoneNumber.value);
}

function getAgentAvatar(agent) {
  if (!agent) return "";
  if (agent.avatar_url) return agent.avatar_url;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    agent.name || "A"
  )}&background=random`;
}

function closeModal() {
  showForm.value = false;
  form.value = null;
  selectedCountryCode.value = "62";
  phoneNumber.value = "";
  emit("clear-selected");
}

async function onSave() {
  notif.value = "";
  error.value = "";

  // Validation
  if (!form.value.name || form.value.name.trim() === "") {
    showToast({ message: "Nama wajib diisi.", type: "error" });
    return;
  }

  if (!phoneNumber.value || phoneNumber.value.trim() === "") {
    showToast({ message: "Nomor telepon wajib diisi.", type: "error" });
    return;
  }

  try {
    // Combine country code and phone number
    form.value.phone = getFullPhoneNumber();

    if (form.value.id) {
      await updateAgent(form.value.id, form.value);
      showToast({ message: "Data agent berhasil disimpan.", type: "success" });
      emit("refresh-list");
      closeModal();
    } else {
      // Tambah agent baru
      const newAgent = await addAgent({
        ...form.value,
        type: "manusia",
        is_active: true,
      });
      showToast({
        message: "Data agent berhasil ditambahkan.",
        type: "success",
      });
      emit("refresh-list");
      closeModal();
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
    closeModal();
    emit("refresh-list");
  } catch (e) {
    showToast({
      message: e.message || "Gagal menghapus data agent.",
      type: "error",
    });
  }
}
</script>
