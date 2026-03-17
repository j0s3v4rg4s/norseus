import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { auth } from '../firebase';
import { Role } from '@models/user';

export default function ProtectedLayout() {
  const [claimVerified, setClaimVerified] = useState(false);
  const [claimLoading, setClaimLoading] = useState(true);

  useEffect(() => {
    let flag = true;
    async function validateUser() {
      const user = auth.currentUser;
      const tokenResult = await user?.getIdTokenResult();
      const roles = (tokenResult?.claims.roles as string[]) ?? [];
      if (!flag) return;
      if (roles.includes(Role.SUPER_ADMIN)) {
        setClaimVerified(true);
      } else {
        signOut(auth);
        setClaimVerified(false);
      }
      setClaimLoading(false);
    }
    validateUser();
    return () => {
      flag = false;
    };
  }, []);

  if (claimLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!claimVerified) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
