import { CalendarDays, Mail, ShieldCheck } from 'lucide-react';

import { Badge } from '@front/cn/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@front/cn/components/card';
import { Switch } from '@front/cn/components/switch';
import type { ClientModel } from '@models/facility';

interface ClientInfoCardProps {
  client: ClientModel;
  isToggling: boolean;
  onToggleStatus: () => void;
}

export function ClientInfoCard({
  client,
  isToggling,
  onToggleStatus,
}: ClientInfoCardProps) {
  const joinedDateLabel = client.joined.toDate().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
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
              onCheckedChange={onToggleStatus}
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
  );
}
