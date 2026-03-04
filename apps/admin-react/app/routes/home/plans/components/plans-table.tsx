import { Pencil } from 'lucide-react';
import { Link } from 'react-router';

import { Badge } from '@front/cn/components/badge';
import { Button } from '@front/cn/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@front/cn/components/table';
import type { Plan } from '@models/plans';

interface PlansTableProps {
  plans: Plan[];
}

export function PlansTable({ plans }: PlansTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Costo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {plan.cost.toLocaleString()} {plan.currency}
              </TableCell>
              <TableCell>
                <Badge variant={plan.active ? 'default' : 'secondary'}>
                  {plan.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link to={`/home/plans/${plan.id}`}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Ver detalle del plan</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
