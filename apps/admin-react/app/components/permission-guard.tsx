import { Loader2 } from 'lucide-react';
import { type PermissionSection, PermissionAction } from '@models/permissions';
import { usePermissionsStore } from '../stores/permissions.store';
import { AccessDenied } from './access-denied';

interface PermissionGuardProps {
  section: PermissionSection;
  action?: PermissionAction;
  children: React.ReactNode;
}

export function PermissionGuard({
  section,
  action = PermissionAction.READ,
  children,
}: PermissionGuardProps) {
  const { loading, hasPermission } = usePermissionsStore();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasPermission(section, action)) {
    return <AccessDenied />;
  }

  return children;
}
