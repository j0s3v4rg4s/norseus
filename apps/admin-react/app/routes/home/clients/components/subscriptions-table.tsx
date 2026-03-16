import { Badge } from '@front/cn/components/badge';
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
