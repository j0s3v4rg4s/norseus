import { Badge } from '@front/cn/components/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@front/cn/components/table';
import type { ClientModel } from '@models/facility';

interface ClientsTableProps {
  clients: ClientModel[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.uid}>
              <TableCell className="font-medium">
                {client.profile.name}
              </TableCell>
              <TableCell>{client.profile.email}</TableCell>
              <TableCell>
                <Badge
                  variant={client.isActive ? 'default' : 'destructive'}
                >
                  {client.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
