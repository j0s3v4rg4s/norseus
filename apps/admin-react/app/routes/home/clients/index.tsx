import { useCallback, useEffect, useState } from 'react';
import { Plus, Loader2, Users } from 'lucide-react';
import { Link } from 'react-router';
import { sileo } from 'sileo';

import { Button } from '@front/cn/components/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@front/cn/components/empty';
import { getClients, deleteClient } from '@front/clients';
import { getClientSubscriptions } from '@front/subscriptions';
import type { ClientModel } from '@models/facility';
import { SubscriptionStatus } from '@models/subscriptions';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { db } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { PermissionGuard } from '../../../components/permission-guard';
import { Can } from '../../../components/can';
import { ClientsTable } from './components';

export default function ClientsPage() {
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const [clients, setClients] = useState<ClientModel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(() => {
    if (!selectedFacility?.id) return;

    setLoading(true);
    getClients(db, selectedFacility.id)
      .then(setClients)
      .finally(() => setLoading(false));
  }, [selectedFacility?.id]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  async function handleDelete(clientId: string) {
    if (!selectedFacility?.id) return;

    try {
      const subscriptions = await getClientSubscriptions(db, selectedFacility.id, clientId);
      const hasActive = subscriptions.some((s) => s.status === SubscriptionStatus.ACTIVE);

      if (hasActive) {
        sileo.error({
          title: 'No se puede eliminar',
          description: 'El cliente tiene suscripciones activas. Cancelalas o espera a que expiren antes de eliminarlo.',
          duration: 4000,
        });
        return;
      }

      await deleteClient(db, selectedFacility.id, clientId);
      sileo.success({ title: 'Cliente eliminado correctamente', duration: 3000 });
      loadClients();
    } catch {
      sileo.error({ title: 'Error al eliminar el cliente', duration: 3000 });
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PermissionGuard section={PermissionSection.CLIENTS}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona los clientes de tu instalacion
            </p>
          </div>
          <Can section={PermissionSection.CLIENTS} action={PermissionAction.CREATE}>
            <Button size="lg" className="gap-2" asChild>
              <Link to="/home/clients/create">
                <Plus className="h-4 w-4" />
                Nuevo cliente
              </Link>
            </Button>
          </Can>
        </div>

        {clients.length > 0 ? (
          <ClientsTable clients={clients} onDelete={handleDelete} />
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Sin clientes registrados</EmptyTitle>
              <EmptyDescription>
                Aun no has registrado ningun cliente. Comienza creando el primero.
              </EmptyDescription>
            </EmptyHeader>
            <Can section={PermissionSection.CLIENTS} action={PermissionAction.CREATE}>
              <EmptyContent>
                <Button asChild>
                  <Link to="/home/clients/create">
                    <Plus className="h-4 w-4" />
                    Nuevo cliente
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
