import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/auth-context';

export default function PublicLayout() {
  const { user, loading } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checkingClaim, setCheckingClaim] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsSuperAdmin(false);
      setCheckingClaim(false);
      return;
    }

    setCheckingClaim(true);
    user.getIdTokenResult().then((tokenResult) => {
      const roles = (tokenResult.claims.roles as string[]) ?? [];
      setIsSuperAdmin(roles.includes('super_admin'));
      setCheckingClaim(false);
    });
  }, [user]);

  if (loading || checkingClaim) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user && isSuperAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
