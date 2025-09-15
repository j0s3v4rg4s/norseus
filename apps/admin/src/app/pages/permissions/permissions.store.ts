import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { RolesService } from '@front/core/roles';
import { PermissionAction, PermissionSection } from '@models/permissions';
import { Role as RolesLibRole, PermissionsBySection } from '@front/core/roles';
import { SessionSignalStore } from '@front/state/session';
import { LoggerService } from '@front/utils/logger';

type UiPermission = { action: PermissionAction; section: PermissionSection };

type permissionState = {
  isLoading: boolean;
  duplicateError: boolean;
  errorMessage: string;
  statusSaveMessage: string;
  role: RolesLibRole | null;
  permissions: UiPermission[];
  roles: RolesLibRole[];
};

export const initialState: permissionState = {
  isLoading: false,
  duplicateError: false,
  errorMessage: '',
  statusSaveMessage: '',
  role: null,
  permissions: [],
  roles: [],
};

export const permissionsStore = signalStore(
  withState(initialState),
  withMethods((store) => {
    const rolesService = inject(RolesService);
    const sessionStore = inject(SessionSignalStore);
    const loggerService = inject(LoggerService);

    const loadRole = async (roleId: string) => {
      patchState(store, { isLoading: true });
      try {
        const facility = sessionStore.selectedFacility();
        const facilityId = facility ? facility.id : undefined;
        if (!facilityId) {
          patchState(store, { statusSaveMessage: 'No facility selected.', isLoading: false });
          return;
        }
        const role = await firstValueFrom(rolesService.getRoleById(facilityId, roleId));
        if (!role) {
          patchState(store, { statusSaveMessage: 'Role not found.', isLoading: false });
          return;
        }
        const permissions: UiPermission[] = Object.entries(role.permissions || {}).flatMap(([section, actions]) =>
          (actions || []).map((action) => ({ section: section as PermissionSection, action })),
        );
        patchState(store, { role, isLoading: false, permissions });
      } catch {
        patchState(store, {
          statusSaveMessage: 'Unexpected error loading role.',
          isLoading: false,
        });
      }
    };
    const addPermission = async (action?: PermissionAction, section?: PermissionSection) => {
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
        permissions: [...store.permissions(), { action, section }],
        duplicateError: false,
        errorMessage: '',
      });
    };
    const removePermission = (index: number) => {
      patchState(store, { permissions: store.permissions().filter((_, i) => i !== index) });
    };
    const deleteRole = async () => {
      try {
        const facility = sessionStore.selectedFacility();
        const facilityId = facility ? facility.id : undefined;
        const roleId = store.role()?.id;
        if (!facilityId || !roleId) {
          patchState(store, { statusSaveMessage: 'Missing facility or role id.' });
          return false;
        }
        await firstValueFrom(rolesService.deleteRole(facilityId, roleId));
        return true;
      } catch {
        patchState(store, { statusSaveMessage: 'Error al eliminar el rol.' });
        return false;
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
        const newNameRole = roleName
          .replace(/[^a-zA-Z0-9]+/g, ' ')
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => word.toUpperCase())
          .join('_');
        const facility = sessionStore.selectedFacility();
        const facilityId = facility ? facility.id : undefined;
        const roleId = store.role()?.id;
        if (!facilityId || !roleId) {
          patchState(store, { statusSaveMessage: 'Missing facility or role id.', isLoading: false });
          return false;
        }
        const permissionsMap = store.permissions().reduce<PermissionsBySection>((acc, item) => {
          const section = item.section;
          if (!acc[section]) acc[section] = [];
          (acc[section] as PermissionAction[]).push(item.action);
          return acc;
        }, {});
        await firstValueFrom(
          rolesService.updateRole(facilityId, {
            id: roleId,
            name: newNameRole,
            permissions: permissionsMap,
          } as RolesLibRole),
        );
        patchState(store, { isLoading: false });
        return true;
      } catch {
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
        const newNameRole = roleName
          .replace(/[^a-zA-Z0-9]+/g, ' ')
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => word.toUpperCase())
          .join('_');
        const facility = sessionStore.selectedFacility();
        const facilityId = facility ? facility.id : undefined;
        if (!facilityId) {
          patchState(store, { statusSaveMessage: 'No facility selected.', isLoading: false });
          return false;
        }
        const permissionsMap = store.permissions().reduce<PermissionsBySection>((acc, item) => {
          const section = item.section;
          if (!acc[section]) acc[section] = [];
          (acc[section] as PermissionAction[]).push(item.action);
          return acc;
        }, {});
        await firstValueFrom(
          rolesService.createRole(facilityId, {
            name: newNameRole,
            permissions: permissionsMap,
          }),
        );
        patchState(store, { isLoading: false });
        return true;
      } catch (e) {
        loggerService.error(`Error creating role`, e);
        patchState(store, { statusSaveMessage: 'Error inesperado al guardar.', isLoading: false });
        return false;
      }
    };
    const getAllRoles = async (facilityId: string) => {
      patchState(store, { isLoading: true, errorMessage: '' });
      try {
        const roles = await firstValueFrom(rolesService.getAllRoles(facilityId));
        patchState(store, { isLoading: false, roles });
      } catch {
        patchState(store, { isLoading: false, errorMessage: 'Error al cargar los roles.' });
      }
    };
    return { loadRole, addPermission, removePermission, deleteRole, saveRole, createRole, getAllRoles };
  }),
);
