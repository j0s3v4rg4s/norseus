import {
  PermissionAction,
  PermissionSection,
} from '../permissions.enums';

export const PERMISSIONS_SECTIONS: PermissionSection[] = [
  PermissionSection.EMPLOYEES,
  PermissionSection.ROLES,
  PermissionSection.SERVICES,
  PermissionSection.PROGRAMMING,
  PermissionSection.CLIENTS,
] as const;

export const PERMISSIONS_ACTIONS: PermissionAction[] = [
  PermissionAction.CREATE,
  PermissionAction.UPDATE,
  PermissionAction.DELETE,
  PermissionAction.READ,
] as const;

export const PERMISSIONS_SECTIONS_DICTIONARY: Record<string, string> = {
  [PermissionSection.EMPLOYEES]: 'Employees',
  [PermissionSection.ROLES]: 'Roles',
  [PermissionSection.SERVICES]: 'Servicios',
  [PermissionSection.PROGRAMMING]: 'Programación',
  [PermissionSection.CLIENTS]: 'Clientes',
};

export const PERMISSIONS_ACTIONS_DICTIONARY: Record<string, string> = {
  [PermissionAction.CREATE]: 'Create',
  [PermissionAction.READ]: 'Leer',
  [PermissionAction.UPDATE]: 'Actualizar',
  [PermissionAction.DELETE]: 'Eliminar',
};
