<template>
  <div class="flex flex-col h-[100vh]">
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="mt-0 text-xl font-bold">Kontak</h2>
        <div class="flex items-center gap-2">
          <!-- Import Button -->
          <button
            @click="showImportModal = true"
            class="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
            title="Import Kontak"
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
          </button>

          <!-- Export Button -->
          <button
            @click="exportContacts"
            class="bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 transition-colors"
            title="Export Kontak"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>

          <!-- Add Button -->
          <button
            @click="showAddModal = true"
            class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center"
            title="Tambah Kontak"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
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
          </button>
        </div>
      </div>

      <div
        v-if="loading"
        class="mt-6 text-center flex-1 flex items-center justify-center"
      >
        <div class="text-gray-500">Loading kontak...</div>
      </div>
      <div
        v-else-if="error"
        class="mt-6 text-center flex-1 flex items-center justify-center"
      >
        <div class="text-red-500">{{ error }}</div>
      </div>
      <div
        v-else-if="contacts.length === 0"
        class="mt-6 text-center flex-1 flex items-center justify-center"
      >
        <div class="text-gray-500">Belum ada kontak</div>
        <button
          @click="showAddModal = true"
          class="mt-2 text-blue-600 hover:text-blue-700"
        >
          Tambah kontak pertama
        </button>
      </div>
      <div v-else class="mt-6 flex-1 min-h-0 overflow-y-auto">
        <div
          class="flex items-center mb-4 cursor-pointer p-3 rounded-lg transition-all duration-200 border border-transparent hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:scale-[1.02]"
          v-for="kontak in contacts"
          :key="kontak.id"
          @click="selectContact(kontak)"
        >
          <img
            :src="
              kontak.avatar ||
              `https://ui-avatars.com/api/?name=${kontak.name}&background=random`
            "
            class="w-12 h-12 rounded-full"
            :alt="kontak.name"
          />
          <div class="ml-4 flex-1">
            <div class="font-medium">{{ kontak.name }}</div>
            <div class="text-gray-500 text-xs">{{ kontak.phone_number }}</div>
            <div v-if="kontak.email" class="text-gray-400 text-xs">
              {{ kontak.email }}
            </div>
          </div>
          <div class="flex gap-1">
            <button
              @click.stop="editContact(kontak)"
              class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit kontak"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
            </button>
            <button
              @click.stop="deleteContactModal(kontak)"
              class="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Hapus kontak"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Contact Modal -->
    <div
      v-if="showAddModal || showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">
            {{ showEditModal ? "Edit Kontak" : "Tambah Kontak Baru" }}
          </h3>

          <form
            @submit.prevent="
              showEditModal ? updateContactData() : addContactData()
            "
          >
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Nama *
                </label>
                <input
                  v-model="contactForm.name"
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
                  v-model="contactForm.phone_number"
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
                  v-model="contactForm.email"
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
                  v-model="contactForm.avatar_url"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {{
                  saving ? "Menyimpan..." : showEditModal ? "Update" : "Simpan"
                }}
              </button>
              <button
                type="button"
                @click="closeModal"
                :disabled="saving"
                class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4 text-red-600">Hapus Kontak</h3>
          <p class="text-gray-600 mb-6">
            Apakah Anda yakin ingin menghapus kontak
            <strong>{{ contactToDelete?.name }}</strong
            >? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div class="flex gap-3">
            <button
              @click="confirmDelete"
              :disabled="deleting"
              class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {{ deleting ? "Menghapus..." : "Hapus" }}
            </button>
            <button
              @click="showDeleteModal = false"
              :disabled="deleting"
              class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Contacts Modal -->
    <div
      v-if="showImportModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Import Kontak</h3>

          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-3">
              Upload file vCard (.vcf) atau CSV (.csv) dari kontak HP Anda
            </p>
            <p class="text-sm text-gray-500">
              <strong>File vCard:</strong> Berisi informasi kontak seperti nama,
              nomor telepon, dan email
            </p>
            <p class="text-sm text-gray-500">
              <strong>File CSV:</strong> Harus memiliki kolom:
              <code>nama</code>, <code>phone_number</code>,
              <code>email</code> (opsional)
            </p>
            <div class="mt-2 p-3 bg-blue-50 rounded-lg">
              <p class="text-xs text-blue-800 font-medium mb-1">
                📋 Contoh format CSV:
              </p>
              <pre class="text-xs text-blue-700 bg-white p-2 rounded border">
nama,phone_number,email
John Doe,+6281234567890,john@example.com
Jane Smith,+6289876543210,jane@example.com</pre
              >
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                File vCard (.vcf) atau CSV (.csv)
              </label>
              <input
                ref="vcfFileInput"
                type="file"
                accept=".vcf,.csv"
                @change="handleFileSelect"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div
              v-if="importPreview.length > 0"
              class="border rounded-lg p-4 bg-gray-50"
            >
              <h4 class="font-medium mb-2">
                Preview ({{ importPreview.length }} kontak):
              </h4>
              <div class="max-h-60 overflow-y-auto space-y-2">
                <div
                  v-for="(contact, index) in importPreview"
                  :key="index"
                  class="text-sm p-2 bg-white rounded border"
                >
                  <div class="font-medium">{{ contact.name }}</div>
                  <div class="text-gray-600">{{ contact.phone_number }}</div>
                  <div v-if="contact.email" class="text-gray-500 text-xs">
                    {{ contact.email }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="importErrors.length > 0"
              class="border border-red-200 rounded-lg p-4 bg-red-50"
            >
              <h4 class="font-medium text-red-700 mb-2">
                Errors ({{ importErrors.length }}):
              </h4>
              <div
                class="max-h-60 overflow-y-auto text-sm text-red-600 space-y-1"
              >
                <div v-for="(error, index) in importErrors" :key="index">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 mt-6 sticky bottom-0 bg-white pt-4 border-t">
            <button
              @click="importContacts"
              :disabled="importing || importPreview.length === 0"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {{ importing ? "Importing..." : "Import Kontak" }}
            </button>
            <button
              @click="closeImportModal"
              :disabled="importing"
              class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive } from "vue";
import { useContactStore } from "~/composables/useContacts";

const {
  contacts,
  loading,
  error,
  fetchContacts,
  addContact,
  updateContact,
  deleteContact,
} = useContactStore();

const emit = defineEmits(["select-contact"]);

// Modal states
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showImportModal = ref(false);
const saving = ref(false);
const deleting = ref(false);
const importing = ref(false);
const contactToDelete = ref(null);

// Import/Export states
const vcfFileInput = ref(null);
const importPreview = ref([]);
const importErrors = ref([]);

// Form data
const contactForm = reactive({
  name: "",
  phone_number: "",
  email: "",
  avatar_url: "",
});

const selectContact = (contact) => {
  emit("select-contact", contact);
};

const editContact = (contact) => {
  // Populate form with contact data
  contactForm.name = contact.name || "";
  contactForm.phone_number = contact.phone_number || "";
  contactForm.email = contact.email || "";
  contactForm.avatar_url = contact.avatar_url || "";

  // Store contact ID for update
  contactForm.id = contact.id;
  showEditModal.value = true;
};

const deleteContactModal = (contact) => {
  contactToDelete.value = contact;
  showDeleteModal.value = true;
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  resetForm();
};

const closeImportModal = () => {
  showImportModal.value = false;
  importPreview.value = [];
  importErrors.value = [];
  if (vcfFileInput.value) {
    vcfFileInput.value.value = "";
  }
};

const resetForm = () => {
  contactForm.name = "";
  contactForm.phone_number = "";
  contactForm.email = "";
  contactForm.avatar_url = "";

  delete contactForm.id;
};

const addContactData = async () => {
  saving.value = true;
  try {
    await addContact({
      name: contactForm.name,
      phone_number: contactForm.phone_number,
      email: contactForm.email || null,
      avatar_url: contactForm.avatar_url || null,
    });
    await fetchContacts(); // Refresh kontak setelah tambah
    console.log("[KontakList] Contacts after add:", contacts.value);
    closeModal();
    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Kontak berhasil ditambahkan",
      confirmButtonText: "OK",
    });
  } catch (error) {
    console.error("Error adding contact:", error);
    Swal.fire({
      icon: "error",
      title: "Gagal Menambahkan Kontak",
      text: `Gagal menambahkan kontak: ${error.message}`,
      confirmButtonText: "OK",
    });
  } finally {
    saving.value = false;
  }
};

const updateContactData = async () => {
  saving.value = true;
  try {
    await updateContact(contactForm.id, {
      name: contactForm.name,
      phone_number: contactForm.phone_number,
      email: contactForm.email || null,
      avatar_url: contactForm.avatar_url || null,
    });
    await fetchContacts(); // Refresh kontak setelah update
    console.log("[KontakList] Contacts after update:", contacts.value);
    closeModal();
    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Kontak berhasil diupdate",
      confirmButtonText: "OK",
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    Swal.fire({
      icon: "error",
      title: "Gagal Mengupdate Kontak",
      text: `Gagal mengupdate kontak: ${error.message}`,
      confirmButtonText: "OK",
    });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deleteContact(contactToDelete.value.id);
    await fetchContacts(); // Refresh kontak setelah hapus
    console.log("[KontakList] Contacts after delete:", contacts.value);
    showDeleteModal.value = false;
    contactToDelete.value = null;
    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Kontak berhasil dihapus",
      confirmButtonText: "OK",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    Swal.fire({
      icon: "error",
      title: "Gagal Menghapus Kontak",
      text: `Gagal menghapus kontak: ${error.message}`,
      confirmButtonText: "OK",
    });
  } finally {
    deleting.value = false;
  }
};

// Import/Export functions
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".vcf")) {
      parseVCF(content);
    } else if (fileName.endsWith(".csv")) {
      parseCSV(content);
    } else {
      importErrors.value = [
        "Format file tidak didukung. Gunakan file .vcf atau .csv",
      ];
      importPreview.value = [];
    }
  };
  reader.readAsText(file);
};

const parseVCF = (vcf) => {
  const contacts = [];
  const errors = [];

  // Split vCard into individual contacts
  const vcardBlocks = vcf.split("BEGIN:VCARD").filter((block) => block.trim());

  vcardBlocks.forEach((block, index) => {
    try {
      const contact = parseVCardBlock(block);
      if (contact) {
        contacts.push(contact);
      }
    } catch (error) {
      errors.push(`Kontak ${index + 1}: ${error.message}`);
    }
  });

  if (vcardBlocks.length === 0) {
    errors.push("File vCard tidak valid atau kosong");
  }

  importPreview.value = contacts;
  importErrors.value = errors;
};

const parseCSV = (csv) => {
  const contacts = [];
  const errors = [];

  try {
    // Split CSV into lines
    const lines = csv.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      errors.push("File CSV harus memiliki header dan minimal satu baris data");
      errors.push("");
      errors.push("Contoh format CSV yang benar:");
      errors.push("nama,phone_number,email");
      errors.push("John Doe,+6281234567890,john@example.com");
      errors.push("Jane Smith,+6289876543210,jane@example.com");
      importPreview.value = [];
      importErrors.value = errors;
      return;
    }

    // Parse header
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIndex = header.findIndex((h) => h === "nama" || h === "name");
    const phoneIndex = header.findIndex(
      (h) => h === "phone_number" || h === "phone" || h === "telepon"
    );
    const emailIndex = header.findIndex((h) => h === "email");

    if (nameIndex === -1) {
      errors.push("❌ Kolom 'nama' tidak ditemukan dalam header CSV");
      errors.push("   Header yang ditemukan: " + header.join(", "));
    }
    if (phoneIndex === -1) {
      errors.push("❌ Kolom 'phone_number' tidak ditemukan dalam header CSV");
      errors.push("   Header yang ditemukan: " + header.join(", "));
    }

    if (nameIndex === -1 || phoneIndex === -1) {
      errors.push("");
      errors.push("📋 Contoh format CSV yang benar:");
      errors.push("nama,phone_number,email");
      errors.push("John Doe,+6281234567890,john@example.com");
      errors.push("Jane Smith,+6289876543210,jane@example.com");
      errors.push("");
      errors.push("📝 Catatan:");
      errors.push("- Kolom 'nama' dan 'phone_number' wajib ada");
      errors.push("- Kolom 'email' bersifat opsional");
      errors.push(
        "- Format nomor telepon: +6281234567890 (tanpa spasi atau tanda hubung)"
      );
      errors.push("- Gunakan koma (,) sebagai pemisah kolom");
      importPreview.value = [];
      importErrors.value = errors;
      return;
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const contact = {
          name: values[nameIndex]?.trim() || "",
          phone_number: values[phoneIndex]?.trim() || "",
          email: emailIndex !== -1 ? values[emailIndex]?.trim() || "" : "",
        };

        // Validate contact data
        if (!contact.name) {
          errors.push(`❌ Baris ${i + 1}: Nama tidak boleh kosong`);
          continue;
        }

        if (!contact.phone_number) {
          errors.push(`❌ Baris ${i + 1}: Nomor telepon tidak boleh kosong`);
          continue;
        }

        // Normalize phone number
        contact.phone_number = normalizePhoneNumber(contact.phone_number);

        // Validate phone number format
        const cleanPhone = contact.phone_number.replace(/\s/g, "");
        const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,12}$/;
        if (!phoneRegex.test(cleanPhone)) {
          errors.push(`❌ Baris ${i + 1}: Format nomor telepon tidak valid`);
          errors.push(`   Nomor: ${contact.phone_number}`);
          errors.push(`   Format yang benar: +6281234567890`);
          continue;
        }

        contacts.push(contact);
      } catch (error) {
        errors.push(`❌ Baris ${i + 1}: ${error.message}`);
      }
    }

    if (contacts.length === 0 && errors.length === 0) {
      errors.push("❌ Tidak ada data kontak yang valid ditemukan");
      errors.push("");
      errors.push("📋 Contoh format CSV yang benar:");
      errors.push("nama,phone_number,email");
      errors.push("John Doe,+6281234567890,john@example.com");
      errors.push("Jane Smith,+6289876543210,jane@example.com");
    }
  } catch (error) {
    errors.push(`❌ Error parsing CSV: ${error.message}`);
    errors.push("");
    errors.push("📋 Contoh format CSV yang benar:");
    errors.push("nama,phone_number,email");
    errors.push("John Doe,+6281234567890,john@example.com");
    errors.push("Jane Smith,+6289876543210,jane@example.com");
  }

  importPreview.value = contacts;
  importErrors.value = errors;
};

const parseCSVLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values.map((v) => v.replace(/^"|"$/g, "").trim());
};

const parseVCardBlock = (block) => {
  const lines = block.split("\n").filter((line) => line.trim());
  let contact = {
    name: "",
    phone_number: "",
    email: "",
  };

  for (const line of lines) {
    if (line.startsWith("FN:")) {
      contact.name = line.substring(3).trim();
    } else if (line.startsWith("TEL")) {
      // Handle different TEL formats with TYPE parameters
      const telMatch = line.match(/TEL[^:]*:(.+)/);
      if (telMatch) {
        const phone = telMatch[1].trim();
        if (phone && !contact.phone_number) {
          // Skip service numbers and short codes
          if (
            phone.length < 10 ||
            /^(123|555|186|185|817|838|9999|122)$/.test(phone)
          ) {
            continue;
          }
          contact.phone_number = normalizePhoneNumber(phone);
        }
      }
    } else if (line.startsWith("EMAIL")) {
      const emailMatch = line.match(/EMAIL[^:]*:(.+)/);
      if (emailMatch) {
        contact.email = emailMatch[1].trim();
      }
    }
  }

  // Validate required fields
  if (!contact.name) {
    throw new Error("Nama tidak ditemukan");
  }

  if (!contact.phone_number) {
    throw new Error("Nomor telepon tidak ditemukan");
  }

  // More flexible phone number validation
  const cleanPhone = contact.phone_number.replace(/\s/g, "");
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,12}$/;
  if (!phoneRegex.test(cleanPhone)) {
    throw new Error("Format nomor telepon tidak valid");
  }

  return contact;
};

const normalizePhoneNumber = (phone) => {
  // Remove common separators and spaces
  let normalized = phone.replace(/[\s\-\(\)\.]/g, "");

  // Handle Indonesian phone numbers
  if (normalized.startsWith("0")) {
    normalized = "+62" + normalized.substring(1);
  } else if (normalized.startsWith("62")) {
    normalized = "+" + normalized;
  } else if (normalized.startsWith("+62")) {
    // Already in correct format
  } else if (normalized.startsWith("8")) {
    // Assume it's a local number starting with 8
    normalized = "+62" + normalized;
  } else if (normalized.startsWith("+")) {
    // Already has country code
  } else {
    // For other formats, try to add +62 if it looks like an Indonesian number
    if (normalized.length >= 9 && normalized.length <= 13) {
      normalized = "+62" + normalized;
    }
  }

  return normalized;
};

const importContacts = async () => {
  importing.value = true;
  try {
    const importPromises = importPreview.value.map((contact) =>
      addContact({
        name: contact.name,
        phone_number: contact.phone_number,
        email: contact.email,
        avatar_url: null,
      })
    );

    await Promise.all(importPromises);
    await fetchContacts();
    closeImportModal();
    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: `Berhasil mengimport ${importPreview.value.length} kontak`,
      confirmButtonText: "OK",
    });
    console.log(
      "[KontakList] Import successful:",
      importPreview.value.length,
      "contacts"
    );
  } catch (error) {
    console.error("Error importing contacts:", error);
    importErrors.value.push(`Error importing: ${error.message}`);
    Swal.fire({
      icon: "error",
      title: "Gagal Mengimport Kontak",
      text: `Gagal mengimport kontak: ${error.message}`,
      confirmButtonText: "OK",
    });
  } finally {
    importing.value = false;
  }
};

const exportContacts = () => {
  if (contacts.value.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Tidak ada Kontak untuk di-export",
      text: "Tidak ada kontak untuk di-export",
      confirmButtonText: "OK",
    });
    return;
  }

  try {
    // Create CSV content
    const headers = ["nama", "phone_number", "email", "notes", "created_at"];
    const csvContent = [
      headers.join(","),
      ...contacts.value.map((contact) =>
        [
          `"${contact.name || ""}"`,
          `"${contact.phone_number || ""}"`,
          `"${contact.email || ""}"`,
          `"${contact.notes || ""}"`,
          `"${contact.created_at || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `contacts_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: `Berhasil mengexport ${contacts.value.length} kontak`,
      confirmButtonText: "OK",
    });
  } catch (error) {
    console.error("Error exporting contacts:", error);
    Swal.fire({
      icon: "error",
      title: "Gagal Mengexport Kontak",
      text: `Gagal mengexport kontak: ${error.message}`,
      confirmButtonText: "OK",
    });
  }
};

onMounted(async () => {
  await fetchContacts();
  console.log("[KontakList] Contacts after initial fetch:", contacts.value);
});
</script>
