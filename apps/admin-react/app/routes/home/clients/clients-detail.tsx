import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CalendarDays, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { sileo } from 'sileo';

import { Badge } from '@front/cn/components/badge';
import { Button } from '@front/cn/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@front/cn/components/card';
import { Switch } from '@front/cn/components/switch';
import {
  getClient,
  toggleClientStatus,
} from '@front/clients';
import type { ClientModel } from '@models/facility';
import { db } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';

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
      sileo.error({ title: 'Error al cambiar el estado del cliente', duration: 3000 });
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

  const joinedDateLabel = client.joined.toDate().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
        <div className="flex flex-1 items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {client.profile.name}
          </h1>
        </div>
      </div>

      <Card className="overflow-hidden border-border/70 pt-0 shadow-sm gap-0">
        <CardHeader className="border-b bg-gradient-to-br from-primary/5 via-background to-background pt-6 gap-0">
          <CardTitle className="text-xl">Informacion del cliente</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <section className="grid grid-cols-1 gap-6 border-b px-6 py-5 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-border/70">
            <div className="space-y-2 sm:pr-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Correo electronico
              </p>
              <div className="flex items-center gap-2 text-base font-semibold">
                <Mail className="h-4 w-4 text-primary" />
                <span className="truncate">{client.profile.email}</span>
              </div>
            </div>
            <div className="space-y-2 sm:pl-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Fecha de alta
              </p>
              <div className="flex items-center gap-2 text-base font-semibold">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>{joinedDateLabel}</span>
              </div>
            </div>
          </section>

          <section className="space-y-4 bg-muted/25 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Estado de la cuenta
                </p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>
                    {client.isActive
                      ? 'Cliente habilitado para operar'
                      : 'Cliente deshabilitado temporalmente'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={client.isActive ? 'default' : 'destructive'}>
                  {client.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t pt-4">
              <Switch
                checked={client.isActive}
                onCheckedChange={handleToggleStatus}
                disabled={isToggling}
              />
              <span className="text-sm text-muted-foreground">
                {isToggling
                  ? 'Actualizando estado...'
                  : 'Cambiar estado del cliente'}
              </span>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
