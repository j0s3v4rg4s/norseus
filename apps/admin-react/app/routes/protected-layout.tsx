import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useSessionStore } from '../stores/session.store';
import { usePermissionsStore } from '../stores/permissions.store';
import { db } from '../firebase';
import { Role } from '@models/user';

export default function ProtectedLayout() {
  const { user, loading: authLoading } = useAuth();
  const { loading: sessionLoading, loadFacilities } = useSessionStore();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const currentEmployee = useSessionStore((s) => s.currentEmployee);
  const { loading: permissionsLoading, loadPermissions, permissions } = usePermissionsStore();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      loadFacilities(user.uid);
      user.getIdTokenResult().then((tokenResult) => {
        const roles = (tokenResult.claims['roles'] as string[]) ?? [];
        setIsSuperAdmin(roles.includes(Role.SUPER_ADMIN));
      });
    }
  }, [user, loadFacilities]);

  useEffect(() => {
    if (selectedFacility && currentEmployee) {
      loadPermissions(db, selectedFacility, currentEmployee, isSuperAdmin);
    }
  }, [selectedFacility, currentEmployee, isSuperAdmin, loadPermissions]);

  if (authLoading || sessionLoading || permissionsLoading || !permissions) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
