import { ref, readonly } from "vue";
import type { Contact } from "../types/supabase";

export const useContactStore = () => {
  const contacts = ref<Contact[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const user = useSupabaseUser()
  const supabase = useSupabaseClient();

  // Get all contacts
  const fetchContacts = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("contacts")
        .select("*")
        .eq("is_active", true)
        .eq("created_by", user.value.id)
        .order("created_at", { ascending: false });


      if (fetchError) throw fetchError;

      contacts.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch contacts";
      console.error("Error fetching contacts:", err);
    } finally {
      loading.value = false;
    }
  };

  // Get contacts by chanel
  const fetchContactsBychanel = async (chanelId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("contacts")
        .select("*")
        .eq("chanel_id", chanelId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      contacts.value = data || [];
      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch contacts";
      console.error("Error fetching contacts:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Add new contact
  const addContact = async (
    contactData: Omit<Contact, "id" | "created_at" | "updated_at">
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: insertError } = await supabase
        .from("contacts")
        .insert([
          {
            name: contactData.name,
            phone_number: contactData.phone_number,
            email: contactData.email,
            avatar_url: contactData.avatar_url,
            is_active: true,
            created_by: user.value.id,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Force update by creating new array reference
      contacts.value = [data, ...contacts.value];
      return { contact: data, contacts: contacts.value };
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to add contact";
      console.error("Error adding contact:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update contact
  const updateContact = async (id: string, updates: Partial<Contact>) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from("contacts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = contacts.value.findIndex((contact) => contact.id === id);
      if (index !== -1) {
        contacts.value[index] = data;
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update contact";
      console.error("Error updating contact:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete contact (soft delete)
  const deleteContact = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from("contacts")
        .update({ is_active: false })
        .eq("id", id);

      if (deleteError) throw deleteError;

      contacts.value = contacts.value.filter((contact) => contact.id !== id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete contact";
      console.error("Error deleting contact:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get contact by ID
  const getContactById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch contact";
      console.error("Error fetching contact:", err);
      throw err;
    }
  };

  // Get contact by phone number
  const getContactByPhone = async (phoneNumber: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("contacts")
        .select("*")
        .eq("phone_number", phoneNumber)
        .eq("is_active", true)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError; // PGRST116 = no rows returned

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch contact";
      console.error("Error fetching contact:", err);
      throw err;
    }
  };

  return {
    contacts: readonly(contacts),
    loading: readonly(loading),
    error: readonly(error),
    fetchContacts,
    fetchContactsBychanel,
    addContact,
    updateContact,
    deleteContact,
    getContactById,
    getContactByPhone,
  };
};
