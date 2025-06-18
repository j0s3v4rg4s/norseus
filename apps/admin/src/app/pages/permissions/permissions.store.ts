import { inject } from '@angular/core';
import { Permission, PermissionAction, Role, Section, SUPABASE } from '@front/supabase';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ProfileSignalStore } from '@front/core/profile';

type RoleWithPermissions = Role & { permissions: Permission[] };

type permissionState = {
  isLoading: boolean;
  duplicateError: boolean;
  errorMessage: string;
  statusSaveMessage: string;
  removedPermissions: Set<string>;
  role: RoleWithPermissions | null;
  permissions: Array<{ action: PermissionAction; section: Section; id?: string }>;
  roles: RoleWithPermissions[];
};

export const initialState: permissionState = {
  isLoading: false,
  duplicateError: false,
  errorMessage: '',
  statusSaveMessage: '',
  removedPermissions: new Set(),
  role: null,
  permissions: [],
  roles: [],
};

export const permissionsStore = signalStore(
  withState(initialState),
  withMethods((store) => {
    const supabase = inject(SUPABASE);
    const profileStore = inject(ProfileSignalStore);
    const loadRole = async (roleId: string) => {
      patchState(store, { isLoading: true });
      try {
        const { data: role, error } = await supabase.from('role').select('*, permissions(*)').eq('id', roleId).single();
        if (error || !role) {
          patchState(store, {
            statusSaveMessage: 'Error loading role.',
            isLoading: false,
          });
        }
        const permissions = (role.permissions || []).map((perm: Permission) => ({
          action: perm.action,
          section: perm.section,
          id: perm.id,
        }));
        patchState(store, { role, isLoading: false, permissions });
      } catch (e) {
        patchState(store, {
          statusSaveMessage: 'Unexpected error loading role.',
          isLoading: false,
        });
      }
    };
    const addPermission = async (action?: PermissionAction, section?: Section) => {
      if (!action || !section) {
        patchState(store, { duplicateError: true, errorMessage: 'Debes seleccionar una acción y una sección.' });
        return;
      }
      const exists = store.permissions().some((perm) => perm.action === action && perm.section === section);
      if (exists) {
        patchState(store, { duplicateError: true, errorMessage: 'Esta combinación ya fue agregada.' });
        return;
      }
      patchState(store, {
        permissions: [...store.permissions(), { action: action as PermissionAction, section: section as Section }],
        duplicateError: false,
        errorMessage: '',
      });
    };
    const removePermission = (index: number) => {
      const removed = store.permissions()[index];
      patchState(store, { permissions: store.permissions().filter((_, i) => i !== index) });
      if (removed.id) {
        store.removedPermissions().add(removed.id);
      }
    };
    const deleteRole = async () => {
      const { error } = await supabase.from('role').delete().eq('id', store.role()?.id);
      if (error) {
        patchState(store, { statusSaveMessage: 'Error al eliminar el rol.' });
        return false;
      } else {
        return true;
      }
    };
    const saveRole = async (roleName?: string) => {
      if (!roleName) {
        patchState(store, { statusSaveMessage: 'Debes ingresar un nombre de rol válido.' });
        return false;
      }
      if (store.permissions().length === 0) {
        patchState(store, { statusSaveMessage: 'Debes agregar al menos una combinación de acción y sección.' });
        return false;
      }
      patchState(store, { isLoading: true, statusSaveMessage: '' });
      try {
        // Convert roleName to UPPER_SNAKE_CASE
        const newNameRole = roleName
          .replace(/[^a-zA-Z0-9]+/g, ' ')
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => word.toUpperCase())
          .join('_');
        const newPermissions = store
          .permissions()
          .filter((item) => !item.id)
          .map((item) => ({
            action: item.action,
            section: item.section,
          }));
        const permissionsToDelete = Array.from(store.removedPermissions());
        const { error } = await supabase.rpc('update_role_with_permissions', {
          role_id: store.role()?.id,
          new_role_name: newNameRole,
          new_permissions: newPermissions,
          permissions_to_delete: permissionsToDelete,
        });
        if (error) {
          patchState(store, { statusSaveMessage: 'Error al actualizar el rol.', isLoading: false });
          return false;
        }
        patchState(store, { isLoading: false });
        return true;
      } catch (e) {
        patchState(store, { statusSaveMessage: 'Error inesperado al guardar.', isLoading: false });
        return false;
      }
    };
    const createRole = async (roleName: string) => {
      if (!roleName) {
        patchState(store, { statusSaveMessage: 'Debes ingresar un nombre de rol válido.' });
        return false;
      }
      if (store.permissions().length === 0) {
        patchState(store, { statusSaveMessage: 'Debes agregar al menos una combinación de acción y sección.' });
        return false;
      }
      patchState(store, { isLoading: true, statusSaveMessage: '' });
      try {
        // Convert roleName to UPPER_SNAKE_CASE
        const newNameRole = roleName
          .replace(/[^a-zA-Z0-9]+/g, ' ')
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => word.toUpperCase())
          .join('_');
        const facility = profileStore.facility();
        const facilityId = facility ? facility.id : undefined;
        const permissions = store.permissions().map((item) => ({
          action: item.action,
          section: item.section,
        }));
        const { error } = await supabase.rpc('create_role_with_permissions', {
          role_name: newNameRole,
          facility_id: facilityId,
          permissions,
        });
        if (error) {
          patchState(store, { statusSaveMessage: 'Error al crear el rol.', isLoading: false });
          return false;
        }
        patchState(store, { isLoading: false });
        return true;
      } catch (e) {
        patchState(store, { statusSaveMessage: 'Error inesperado al guardar.', isLoading: false });
        return false;
      }
    };
    const getAllRoles = async (facilityId: string) => {
      patchState(store, { isLoading: true, errorMessage: '' });
      try {
        const { data: roles, error: rolesError } = await supabase
          .from('role')
          .select('*, permissions(*)')
          .eq('facility_id', facilityId);
        if (rolesError) throw rolesError;
        patchState(store, { isLoading: false, roles });
      } catch (error) {
        patchState(store, { isLoading: false, errorMessage: 'Error al cargar los roles.' });
      }
    };
    return { loadRole, addPermission, removePermission, deleteRole, saveRole, createRole, getAllRoles };
  }),
);
