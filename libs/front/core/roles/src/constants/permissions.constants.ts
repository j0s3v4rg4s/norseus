import { PermissionAction, PermissionSection } from '../enums/permissions.enums';

export const PERMISSIONS_SECTIONS = [PermissionSection.EMPLOYEES, PermissionSection.ROLES] as const;

export const PERMISSIONS_ACTIONS = [
  PermissionAction.CREATE,
  PermissionAction.READ,
  PermissionAction.UPDATE,
  PermissionAction.DELETE,
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
