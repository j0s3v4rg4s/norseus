import { useCallback, useEffect, useState } from 'react';
import { Plus, Loader2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@front/cn/components/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@front/cn/components/empty';
import { getAllSuperAdmins } from '@front/super-admin';
import type { ProfileModel } from '@models/user';
import { db } from '../../../firebase';
import { SuperAdminsTable } from './components';

export default function SuperAdminsPage() {
  const [superAdmins, setSuperAdmins] = useState<ProfileModel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuperAdmins = useCallback(() => {
    setLoading(true);
    getAllSuperAdmins(db)
      .then(setSuperAdmins)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSuperAdmins();
  }, [loadSuperAdmins]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Administradores</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los super administradores de la plataforma
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link to="/home/super-admins/create">
            <Plus className="h-4 w-4" />
            Nuevo super admin
          </Link>
        </Button>
      </div>

      {superAdmins.length > 0 ? (
        <SuperAdminsTable superAdmins={superAdmins} />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldCheck />
            </EmptyMedia>
            <EmptyTitle>Sin super administradores</EmptyTitle>
            <EmptyDescription>
              No se encontraron super administradores registrados.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/home/super-admins/create">
                <Plus className="h-4 w-4" />
                Nuevo super admin
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
