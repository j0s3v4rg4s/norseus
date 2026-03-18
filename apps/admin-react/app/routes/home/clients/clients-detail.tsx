import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { sileo } from 'sileo';

import { Button } from '@front/cn/components/button';
import {
  Card,
  CardContent,
} from '@front/cn/components/card';
import { getClient, toggleClientStatus } from '@front/clients';
import type { ClientModel } from '@models/facility';
import { PermissionSection } from '@models/permissions';
import { db, functions } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { PermissionGuard } from '../../../components/permission-guard';
import { ClientInfoCard, ClientSubscriptionsSection } from './components';

export default function ClientsDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);

  const [client, setClient] = useState<ClientModel | undefined>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (!selectedFacility?.id || !clientId) return;

    setLoading(true);
    getClient(db, selectedFacility.id, clientId)
      .then((result) => {
        if (!result) {
          setNotFound(true);
          return;
        }
        setClient(result);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [selectedFacility?.id, clientId]);

  async function handleToggleStatus() {
    if (!selectedFacility?.id || !clientId || !client) return;

    setIsToggling(true);
    try {
      const newStatus = !client.isActive;
      await toggleClientStatus(db, selectedFacility.id, clientId, newStatus);
      setClient({ ...client, isActive: newStatus });
      sileo.success({
        title: newStatus ? 'Cliente activado' : 'Cliente desactivado',
        duration: 3000,
      });
    } catch {
      sileo.error({
        title: 'Error al cambiar el estado del cliente',
        duration: 3000,
      });
    } finally {
      setIsToggling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !client) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home/clients')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Cliente no encontrado
          </h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            El cliente solicitado no existe o fue eliminado.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard section={PermissionSection.CLIENTS}>
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/home/clients')}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {client.profile.name}
          </h1>
        </div>
      </div>

      <ClientInfoCard
        client={client}
        isToggling={isToggling}
        onToggleStatus={handleToggleStatus}
      />

      {selectedFacility?.id && clientId && (
        <ClientSubscriptionsSection
          db={db}
          functions={functions}
          facilityId={selectedFacility.id}
          clientId={clientId}
        />
      )}
    </div>
    </PermissionGuard>
  );
}
