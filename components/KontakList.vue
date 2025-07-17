<template>
  <div>
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="mt-0 text-xl font-bold">Kontak</h2>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Tambah Kontak
        </button>
      </div>

      <div v-if="loading" class="mt-6 text-center">
        <div class="text-gray-500">Loading kontak...</div>
      </div>
      <div v-else-if="error" class="mt-6 text-center">
        <div class="text-red-500">{{ error }}</div>
      </div>
      <div v-else-if="contacts.length === 0" class="mt-6 text-center">
        <div class="text-gray-500">Belum ada kontak</div>
        <button
          @click="showAddModal = true"
          class="mt-2 text-blue-600 hover:text-blue-700"
        >
          Tambah kontak pertama
        </button>
      </div>
      <div v-else class="mt-6">
        <div
          class="flex items-center mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
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
            <div class="text-gray-500">{{ kontak.phone_number }}</div>
            <div v-if="kontak.email" class="text-gray-400 text-sm">
              {{ kontak.email }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-xs text-gray-400">
              {{ formatDate(kontak.created_at) }}
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
    </div>

    <!-- Add/Edit Contact Modal -->
    <ChanelModal :show="showAddModal || showEditModal" @close="closeModal">
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
                v-model="contactForm.avatar"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                chanel
              </label>
              <select
                v-model="contactForm.chanel_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih chanel</option>
                <option
                  v-for="chanel in chanels"
                  :key="chanel.id"
                  :value="chanel.id"
                >
                  {{ chanel.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Catatan
              </label>
              <textarea
                v-model="contactForm.notes"
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
    </ChanelModal>

    <!-- Delete Confirmation Modal -->
    <ChanelModal :show="showDeleteModal" @close="showDeleteModal = false">
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
    </ChanelModal>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive } from "vue";
import { useContactStore } from "~/composables/useContacts";
import { useChanelstore } from "~/composables/useChanels";
import ChanelModal from "~/components/ChanelModal.vue";

const {
  contacts,
  loading,
  error,
  fetchContacts,
  addContact,
  updateContact,
  deleteContact,
} = useContactStore();
const { chanels, fetchchanels } = useChanelstore();

const emit = defineEmits(["select-contact"]);

// Modal states
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const saving = ref(false);
const deleting = ref(false);
const contactToDelete = ref(null);

// Form data
const contactForm = reactive({
  name: "",
  phone_number: "",
  email: "",
  avatar: "",
  chanel_id: "",
  notes: "",
});

const selectContact = (contact) => {
  emit("select-contact", contact);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const editContact = (contact) => {
  // Populate form with contact data
  contactForm.name = contact.name || "";
  contactForm.phone_number = contact.phone_number || "";
  contactForm.email = contact.email || "";
  contactForm.avatar = contact.avatar || "";
  contactForm.chanel_id = contact.chanel_id || "";
  contactForm.notes = contact.notes || "";

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

const resetForm = () => {
  contactForm.name = "";
  contactForm.phone_number = "";
  contactForm.email = "";
  contactForm.avatar = "";
  contactForm.chanel_id = "";
  contactForm.notes = "";
  delete contactForm.id;
};

const addContactData = async () => {
  saving.value = true;
  try {
    await addContact({
      name: contactForm.name,
      phone_number: contactForm.phone_number,
      email: contactForm.email || null,
      avatar: contactForm.avatar || null,
      chanel_id: contactForm.chanel_id || null,
      notes: contactForm.notes || null,
    });
    closeModal();
  } catch (error) {
    console.error("Error adding contact:", error);
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
      avatar: contactForm.avatar || null,
      chanel_id: contactForm.chanel_id || null,
      notes: contactForm.notes || null,
    });
    closeModal();
  } catch (error) {
    console.error("Error updating contact:", error);
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deleteContact(contactToDelete.value.id);
    showDeleteModal.value = false;
    contactToDelete.value = null;
  } catch (error) {
    console.error("Error deleting contact:", error);
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchContacts(), fetchchanels()]);
});
</script>
