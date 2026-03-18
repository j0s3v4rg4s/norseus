import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useSessionStore } from '../stores/session.store';
import { usePermissionsStore } from '../stores/permissions.store';
import { db } from '../firebase';

export default function ProtectedLayout() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { loading: sessionLoading, loadFacilities } = useSessionStore();
  const facilityId = useSessionStore((s) => s.selectedFacility?.id);
  const currentEmployee = useSessionStore((s) => s.currentEmployee);
  const { loading: permissionsLoading, loadPermissions, permissions } = usePermissionsStore();

  useEffect(() => {
    if (user) {
      loadFacilities(user.uid);
    }
  }, [user, loadFacilities]);

  useEffect(() => {
    if (facilityId && currentEmployee) {
      loadPermissions(db, facilityId, currentEmployee, isAdmin);
    }
  }, [facilityId, currentEmployee, isAdmin, loadPermissions]);

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
