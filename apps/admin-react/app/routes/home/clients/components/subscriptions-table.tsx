import { Badge } from '@front/cn/components/badge';
import { Inbox } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@front/cn/components/table';
import type { ClientSubscription } from '@models/subscriptions';
import { SubscriptionStatus, SubscriptionStatusNames } from '@models/subscriptions';

interface SubscriptionsTableProps {
  subscriptions: ClientSubscription[];
}

const STATUS_VARIANT: Record<SubscriptionStatus, 'default' | 'secondary' | 'destructive'> = {
  [SubscriptionStatus.ACTIVE]: 'default',
  [SubscriptionStatus.EXPIRED]: 'secondary',
  [SubscriptionStatus.CANCELLED]: 'destructive',
};

function formatDate(timestamp: { toDate: () => Date }): string {
  return timestamp.toDate().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="flex h-14 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Inbox className="h-4 w-4" />
          <span>No hay suscripciones registradas.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Inicio</TableHead>
            <TableHead>Fin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow
              key={sub.id}
              className={
                sub.status !== SubscriptionStatus.ACTIVE ? 'opacity-60' : ''
              }
            >
              <TableCell className="font-medium">{sub.planName}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[sub.status]}>
                  {SubscriptionStatusNames[sub.status]}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(sub.startDate)}</TableCell>
              <TableCell>{formatDate(sub.endDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
