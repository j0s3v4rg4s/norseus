import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@front/cn/components/table';
import { Avatar, AvatarFallback, AvatarImage } from '@front/cn/components/avatar';
import type { FacilityModel } from '@models/facility';

interface FacilitiesTableProps {
  facilities: FacilityModel[];
}

function formatDate(timestamp: { toDate?: () => Date } | null): string {
  if (!timestamp || !timestamp.toDate) return '-';
  return timestamp.toDate().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function FacilitiesTable({ facilities }: FacilitiesTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Logo</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Fecha de creacion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facilities.map((facility) => (
            <TableRow key={facility.id}>
              <TableCell>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={facility.logo ?? undefined} alt={facility.name} />
                  <AvatarFallback>{facility.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{facility.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(facility.createdAt as { toDate?: () => Date })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
