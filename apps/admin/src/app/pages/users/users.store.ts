import { inject } from '@angular/core';
import { Role, SUPABASE, Profile, UserType } from '@front/supabase';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

// TODO: move to a shared interface
export type UserProfile = Profile & {
  role: Role | null;
  email?: string;
};

type UserState = {
  isLoading: boolean;
  errorMessage: string;
  statusSaveMessage: string;
  users: UserProfile[];
  user: UserProfile | null;
  roles: Role[];
};

export const initialState: UserState = {
  isLoading: false,
  errorMessage: '',
  statusSaveMessage: '',
  users: [],
  user: null,
  roles: [],
};

export const usersStore = signalStore(
  withState(initialState),
  withMethods((store) => {
    const supabase = inject(SUPABASE);

    const loadUser = async (userId: string) => {
      patchState(store, { isLoading: true });
      try {
        const { data, error } = await supabase.from('profile').select('*, role(*)').eq('id', userId).single();
        if (error) throw error;

        // We need to get the email from the auth user
        // This requires admin privileges and should be done in a secure environment.
        // For now, we'll leave it out, but in a real app, you'd call a server-side function.
        const userWithRole = data as UserProfile;
        patchState(store, { user: userWithRole, isLoading: false });
      } catch (e) {
        patchState(store, {
          isLoading: false,
          errorMessage: 'Error cargando el usuario.',
        });
      }
    };

    const loadRoles = async (facilityId: string) => {
      patchState(store, { isLoading: true });
      try {
        const { data, error } = await supabase.from('role').select('*').eq('facility_id', facilityId);
        if (error) throw error;
        patchState(store, { roles: data || [], isLoading: false });
      } catch (e) {
        patchState(store, {
          isLoading: false,
          errorMessage: 'Error cargando los roles.',
        });
      }
    };

    const loadUsers = async (facilityId: string) => {
      patchState(store, { isLoading: true, errorMessage: '' });
      try {
        const { data, error } = await supabase
          .from('facility_user')
          .select('profile(*, role(*))')
          .eq('facility_id', facilityId);

        if (error) throw error;

        const users = (data || [])
          .map((item) => item.profile)
          .filter((profile) => profile !== null) as unknown as UserProfile[];

        patchState(store, { users, isLoading: false });
      } catch (error) {
        patchState(store, { isLoading: false, errorMessage: 'Error al cargar los usuarios.' });
      }
    };

    const createUser = async (payload: { name: string; email: string; roleId: string; type: UserType }) => {
      patchState(store, { isLoading: true, statusSaveMessage: '' });
      try {
        const { data, error } = await supabase.functions.invoke('createUser', {
          body: { email: payload.email, name: payload.name, roleId: payload.roleId, type: payload.type },
          method: 'POST',
        });

        if (error) throw error;

        const { statusCode, error: errorFunction } = data;

        if (statusCode === 409) {
          patchState(store, {
            isLoading: false,
            statusSaveMessage: 'El usuario ya existe.',
          });
          return false;
        }

        if (statusCode === 500) {
          patchState(store, {
            isLoading: false,
            statusSaveMessage: errorFunction.message || 'Error al crear el usuario.',
          });
          return false;
        }

        patchState(store, { isLoading: false });
        return true;
      } catch (e: any) {
        patchState(store, {
          isLoading: false,
          statusSaveMessage: e.message || 'Error al crear el usuario.',
        });
        return false;
      }
    };

    const updateUser = async (userId: string, payload: { name: string; role_id: string }) => {
      patchState(store, { isLoading: true, statusSaveMessage: '' });
      try {
        const { error } = await supabase
          .from('profile')
          .update({ name: payload.name, role_id: payload.role_id })
          .eq('id', userId);
        if (error) throw error;
        patchState(store, { isLoading: false });
        return true;
      } catch (e: any) {
        patchState(store, {
          isLoading: false,
          statusSaveMessage: e.message || 'Error al actualizar el usuario.',
        });
        return false;
      }
    };

    const deleteUser = async (userId: string) => {
      patchState(store, { isLoading: true, statusSaveMessage: '' });
      try {
        // This should be a transaction or a single RPC call to ensure atomicity
        const { error: facilityUserError } = await supabase.from('facility_user').delete().eq('profile_id', userId);
        if (facilityUserError) throw facilityUserError;

        const { error: profileError } = await supabase.from('profile').delete().eq('id', userId);
        if (profileError) throw profileError;

        // Deleting from auth.users requires admin rights and should be an RPC call
        // const { error: authError } = await supabase.rpc('delete_user_by_id', { user_id: userId });
        // if (authError) throw authError;

        patchState(store, { isLoading: false });
        return true;
      } catch (e: any) {
        patchState(store, {
          isLoading: false,
          statusSaveMessage: e.message || 'Error al eliminar el usuario.',
        });
        return false;
      }
    };

    return {
      loadRoles,
      loadUsers,
      loadUser,
      createUser,
      updateUser,
      deleteUser,
    };
  }),
);
