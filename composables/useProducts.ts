import { ref, computed } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";

export function useProducts() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // State
  const products = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Functions
  const fetchProducts = async () => {
    if (!user.value) {
      products.value = [];
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("created_by", user.value.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      products.value = data || [];
    } catch (err) {
      console.error("Error fetching products:", err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (productData) => {
    if (!user.value) {
      throw new Error("User not authenticated");
    }

    loading.value = true;
    error.value = null;

    try {
      const { data, error: createError } = await supabase
        .from("products")
        .insert({
          ...productData,
          created_by: user.value.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      products.value.unshift(data);
      return data;
    } catch (err) {
      console.error("Error creating product:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (productId, productData) => {
    if (!user.value) {
      throw new Error("User not authenticated");
    }

    loading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from("products")
        .update({
          ...productData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId)
        .eq("created_by", user.value.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = products.value.findIndex((p) => p.id === productId);
      if (index !== -1) {
        products.value[index] = data;
      }

      return data;
    } catch (err) {
      console.error("Error updating product:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (productId) => {
    if (!user.value) {
      throw new Error("User not authenticated");
    }

    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .eq("created_by", user.value.id);

      if (deleteError) throw deleteError;

      products.value = products.value.filter((p) => p.id !== productId);
    } catch (err) {
      console.error("Error deleting product:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    products,
    loading,
    error,

    // Functions
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
