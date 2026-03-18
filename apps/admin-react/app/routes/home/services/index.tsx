import { useEffect, useState } from 'react';
import { Plus, Loader2, CalendarX2 } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@front/cn/components/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@front/cn/components/empty';
import { getServices } from '@front/services';
import type { Service } from '@models/services';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { db } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { PermissionGuard } from '../../../components/permission-guard';
import { Can } from '../../../components/can';
import { ServicesTable } from './components';

export default function ServicesPage() {
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedFacility?.id) return;

    setLoading(true);
    getServices(db, selectedFacility.id)
      .then(setServices)
      .finally(() => setLoading(false));
  }, [selectedFacility?.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PermissionGuard section={PermissionSection.SERVICES}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
          </div>
          <Can section={PermissionSection.SERVICES} action={PermissionAction.CREATE}>
            <Button size="lg" className="gap-2" asChild>
              <Link to="/home/services/create">
                <Plus className="h-4 w-4" />
                Nuevo servicio
              </Link>
            </Button>
          </Can>
        </div>

        {services.length > 0 ? (
          <ServicesTable services={services} />
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarX2 />
              </EmptyMedia>
              <EmptyTitle>Sin servicios registrados</EmptyTitle>
              <EmptyDescription>Aun no has creado ningun servicio. Comienza creando el primero.</EmptyDescription>
            </EmptyHeader>
            <Can section={PermissionSection.SERVICES} action={PermissionAction.CREATE}>
              <EmptyContent>
                <Button asChild>
                  <Link to="/home/services/create">
                    <Plus className="h-4 w-4" />
                    Nuevo servicio
                  </Link>
                </Button>
              </EmptyContent>
            </Can>
          </Empty>
        )}
      </div>
    </PermissionGuard>
  );
}
