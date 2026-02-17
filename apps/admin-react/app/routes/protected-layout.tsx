import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useSessionStore } from '../stores/session.store';

export default function ProtectedLayout() {
  const { user, loading: authLoading } = useAuth();
  const { loading: sessionLoading, loadFacilities } = useSessionStore();

  useEffect(() => {
    if (user) {
      loadFacilities(user.uid);
    }
  }, [user, loadFacilities]);

  if (authLoading || sessionLoading) {
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
