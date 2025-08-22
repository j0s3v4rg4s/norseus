import { PermissionAction, PermissionSection } from '../enums/permissions.enums';

export interface Permission {
  section: PermissionSection;
  action: PermissionAction;
}

export type PermissionsBySection = Partial<Record<PermissionSection, PermissionAction[]>>;

export interface Role {
  id: string;
  name: string;
  permissions: PermissionsBySection;
}
