import { PermissionAction, PermissionSection } from '@models/permissions';

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
