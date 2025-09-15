import { PermissionAction, PermissionSection } from '@models/permissions';

export const PERMISSIONS_SECTIONS: PermissionSection[] = [PermissionSection.EMPLOYEES, PermissionSection.ROLES] as const;

export const PERMISSIONS_ACTIONS: PermissionAction[] = [
  PermissionAction.CREATE,
  PermissionAction.UPDATE,
  PermissionAction.DELETE,
  PermissionAction.READ,
] as const;

export const PERMISSIONS_SECTIONS_DICTIONARY: Record<string, string> = {
  [PermissionSection.ROLES]: 'Roles',
  [PermissionSection.EMPLOYEES]: 'Employees',
};

export const PERMISSIONS_ACTIONS_DICTIONARY: Record<string, string> = {
  [PermissionAction.CREATE]: 'Create',
  [PermissionAction.READ]: 'Read',
  [PermissionAction.UPDATE]: 'Update',
  [PermissionAction.DELETE]: 'Delete',
};
