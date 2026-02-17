import type { PermissionAction, PermissionSection } from './permissions.enums';

export type PermissionsBySection = Partial<
  Record<PermissionSection, PermissionAction[]>
>;

export interface Role {
  id: string;
  name: string;
  permissions: PermissionsBySection;
}
