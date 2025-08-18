import { ref } from 'vue';
import { useSupabaseClient } from '#imports';

export function usePackages() {
  const supabase = useSupabaseClient();
  const packages = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchPackages = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: fetchError } = await supabase
        .from('package')
        .select('*')
        .order('id', { ascending: true });
      
      if (fetchError) throw fetchError;
      packages.value = data || [];
      console.log('Fetched packages:', data);
    } catch (err) {
      error.value = `Error fetching packages: ${err.message}`;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const addPackage = async (packageData) => {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: insertError } = await supabase
        .from('package')
        .insert([packageData])
        .select();

      if (insertError) throw insertError;
      console.log('Package added successfully:', data);
    } catch (err) {
      error.value = `Error adding package: ${err.message}`;
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePackage = async (packageId, packageData) => {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: updateError } = await supabase
        .from('package')
        .update(packageData)
        .eq('id', packageId)
        .select();

      if (updateError) throw updateError;
      console.log('Package updated successfully:', data);
    } catch (err) {
      error.value = `Error updating package: ${err.message}`;
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePackage = async (packageId) => {
    loading.value = true;
    error.value = null;
    try {
      const { error: deleteError } = await supabase
        .from('package')
        .delete()
        .eq('id', packageId);

      if (deleteError) throw deleteError;
      console.log('Package deleted successfully');
    } catch (err) {
      error.value = `Error deleting package: ${err.message}`;
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    packages,
    loading,
    error,
    fetchPackages,
    addPackage,
    updatePackage,
    deletePackage,
  };
}