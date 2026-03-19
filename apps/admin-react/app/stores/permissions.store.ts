import { create } from 'zustand';
import type { Firestore } from 'firebase/firestore';
import type { EmployeeModel, FacilityModel } from '@models/facility';
import { type PermissionsBySection, PermissionSection, PermissionAction } from '@models/permissions';
import { getRoleById } from '@front/roles';

interface PermissionsState {
  permissions: PermissionsBySection | null;
  isAdmin: boolean;
  loading: boolean;
  completed: boolean;
  error: unknown | null;
  loadPermissions: (db: Firestore, facility: FacilityModel, employee: EmployeeModel) => Promise<void>;
  hasPermission: (section: PermissionSection, action: PermissionAction) => boolean;
  hasSectionAccess: (section: PermissionSection) => boolean;
  resetPermissions: () => void;
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  permissions: null,
  isAdmin: false,
  loading: false,
  completed: false,
  error: null,
  loadPermissions: async (db, facility, employee) => {
    set({ loading: true });

    const isFacilityAdmin = facility.admins?.includes(employee.uid) ?? false;

    if (isFacilityAdmin) {
      set({ isAdmin: true, permissions: {}, loading: false, completed: true });
      return;
    }

    if (!employee.roleId) {
      set({ isAdmin: false, permissions: {}, loading: false, completed: true });
      return;
    }

    try {
      const role = await getRoleById(db, facility.id as string, employee.roleId);
      set({
        isAdmin: false,
        permissions: role?.permissions ?? {},
        loading: false,
        completed: true,
      });
    } catch(error) {
      console.error('Error loading permissions:', error);
      set({ isAdmin: false, permissions: {}, loading: false, completed: true, error: error });
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
    set({ permissions: null, isAdmin: false, loading: false, completed: false, error: null });
  },
}));
