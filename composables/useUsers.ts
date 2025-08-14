import { ref } from 'vue';
import { useSupabaseClient } from '#imports';

export function useUsers() {
  const supabase = useSupabaseClient();
  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*,role(*),package(*)');
      if (fetchError) throw fetchError;
      users.value = data || [];
      console.log('Fetched users:', data);
    } catch (err) {
      error.value = `Error fetching users: ${err.message}`;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const addUser = async (userData) => {
    loading.value = true;
    error.value = null;
    try {
      // Create user in auth.users first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });

      if (authError) throw new Error(`Auth Error: ${authError.message}`);
      if (!authData.user) throw new Error('User creation failed in authentication.');

      const newAuthUser = authData.user;

      // Insert user into public.users
      const { error: publicUserError } = await supabase
        .from('users')
        .insert({
          auth_id: newAuthUser.id,
          username: userData.name,
          email: userData.email,
          role: userData.role,
        });

      if (publicUserError) {
        // Clean up auth user if public user creation fails
        await supabase.auth.admin.deleteUser(newAuthUser.id);
        throw new Error(`Public User Error: ${publicUserError.message}`);
      }

    } catch (err) {
      error.value = `Error adding user: ${err.message}`;
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (userId, userData) => {
    loading.value = true;
    error.value = null;
    try {
      console.log('Updating user with ID:', userId);
      console.log('Update data:', userData);

      const updateData = {
        username: userData.name,
        role: userData.role,
      };

      console.log('Final update data:', updateData);

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select();

      console.log('Update response data:', data);
      console.log('Update response error:', updateError);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw new Error(`Update failed: ${updateError.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No rows were updated. Check if the user ID exists and you have permission to update.');
      }

      console.log('User updated successfully:', data);

    } catch (err) {
      error.value = `Error updating user: ${err.message}`;
      console.error('Full error object:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (authId) => {
    loading.value = true;
    error.value = null;
    try {
      // Delete from auth.users (this should cascade to public.users if properly configured)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authId);

      if (deleteError) {
        throw new Error(`Auth Delete Error: ${deleteError.message}`);
      }

      // If cascade is not set up, manually delete from public.users
      const { error: publicDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('auth_id', authId);

      if (publicDeleteError) {
        console.warn('Warning: Could not delete from public users table:', publicDeleteError.message);
      }

    } catch (err) {
      error.value = `Error deleting user: ${err.message}`;
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
  };
}