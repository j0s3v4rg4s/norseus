import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useSessionStore } from '../stores/session.store';
import { usePermissionsStore } from '../stores/permissions.store';
import { auth, db } from '../firebase';

export default function ProtectedLayout() {
  const { loadFacilities, completed: sessionCompleted } = useSessionStore();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const currentEmployee = useSessionStore((s) => s.currentEmployee);
  const { loadPermissions, completed: permissionsCompleted } = usePermissionsStore();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      loadFacilities(user.uid);
    }
  }, [user, loadFacilities]);

  useEffect(() => {
    if (selectedFacility && currentEmployee) {
      loadPermissions(db, selectedFacility, currentEmployee);
    }
  }, [selectedFacility, currentEmployee, loadPermissions]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!sessionCompleted || !permissionsCompleted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <Outlet />;
}
