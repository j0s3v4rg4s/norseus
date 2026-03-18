import { type PermissionSection, type PermissionAction } from '@models/permissions';
import { usePermissionsStore } from '../stores/permissions.store';

interface CanProps {
  section: PermissionSection;
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ section, action, children, fallback = null }: CanProps) {
  const hasPermission = usePermissionsStore((s) => s.hasPermission);
  return hasPermission(section, action) ? <>{children}</> : <>{fallback}</>;
}
