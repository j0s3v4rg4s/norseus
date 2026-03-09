import { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@front/cn/components/button';
import { getClients } from '@front/clients';
import type { ClientModel } from '@models/facility';
import { db } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { ClientsTable } from './components';

export default function ClientsPage() {
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const [clients, setClients] = useState<ClientModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedFacility?.id) return;

    setLoading(true);
    getClients(db, selectedFacility.id)
      .then(setClients)
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los clientes de tu instalacion
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link to="/home/clients/create">
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Link>
        </Button>
      </div>

      {clients.length > 0 ? (
        <ClientsTable clients={clients} />
      ) : (
        <div className="flex h-24 items-center justify-center rounded-lg border text-muted-foreground">
          No hay clientes registrados.
        </div>
      )}
    </div>
  );
}
