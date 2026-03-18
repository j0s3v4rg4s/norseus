import { create } from 'zustand';
import type { Firestore } from 'firebase/firestore';
import type { EmployeeModel } from '@models/facility';
import { type PermissionsBySection, PermissionSection, PermissionAction } from '@models/permissions';
import { getRoleById } from '@front/roles';

interface PermissionsState {
  permissions: PermissionsBySection | null;
  isAdmin: boolean;
  loading: boolean;

  loadPermissions: (db: Firestore, facilityId: string, employee: EmployeeModel, isSuperAdmin: boolean) => Promise<void>;
  hasPermission: (section: PermissionSection, action: PermissionAction) => boolean;
  hasSectionAccess: (section: PermissionSection) => boolean;
  resetPermissions: () => void;
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  permissions: null,
  isAdmin: false,
  loading: false,

  loadPermissions: async (db, facilityId, employee, isSuperAdmin) => {
    set({ loading: true });

    if (isSuperAdmin || employee.isAdmin) {
      set({ isAdmin: true, permissions: {}, loading: false });
      return;
    }

    if (!employee.roleId) {
      set({ isAdmin: false, permissions: {}, loading: false });
      return;
    }

    try {
      const role = await getRoleById(db, facilityId, employee.roleId);
      set({
        isAdmin: false,
        permissions: role?.permissions ?? {},
        loading: false,
      });
    } catch {
      set({ isAdmin: false, permissions: {}, loading: false });
    }
  },

  hasPermission: (section, action) => {
    const { isAdmin, permissions } = get();
    if (isAdmin) return true;
    return permissions?.[section]?.includes(action) ?? false;
  },

  hasSectionAccess: (section) => {
    const { isAdmin, permissions } = get();
    if (isAdmin) return true;
    return permissions?.[section]?.includes(PermissionAction.READ) ?? false;
  },

  resetPermissions: () => {
    set({ permissions: null, isAdmin: false, loading: false });
  },
}));
