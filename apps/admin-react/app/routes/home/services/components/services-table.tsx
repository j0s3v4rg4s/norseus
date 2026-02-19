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
import type { Service } from '@models/services';

interface ServicesTableProps {
  services: Service[];
}

export function ServicesTable({ services }: ServicesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripcion</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                {service.description || '—'}
              </TableCell>
              <TableCell>
                <Badge variant={service.isActive ? 'default' : 'secondary'}>
                  {service.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link to={`/home/services/${service.id}`}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Ver detalle del servicio</span>
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
