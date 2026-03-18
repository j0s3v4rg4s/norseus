import { Card, CardContent } from '@front/cn/components/card';
import { Switch } from '@front/cn/components/switch';
import type { ClientModel } from '@models/facility';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { Can } from '../../../../components/can';

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
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">
        Informacion del cliente
      </h2>
      <Card className="border-border/70 shadow-sm">
        <CardContent>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Correo electronico</p>
              <p className="truncate text-base font-medium">{client.profile.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fecha de alta</p>
              <p className="text-base font-medium">{joinedDateLabel}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {client.isActive ? 'Activo' : 'Inactivo'}
              </span>
              <Can section={PermissionSection.CLIENTS} action={PermissionAction.UPDATE}>
                <Switch
                  checked={client.isActive}
                  onCheckedChange={onToggleStatus}
                  disabled={isToggling}
                />
              </Can>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
