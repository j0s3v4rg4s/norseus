import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@front/cn/components/table';
import type { ProfileModel } from '@models/user';

interface SuperAdminsTableProps {
  superAdmins: ProfileModel[];
}

export function SuperAdminsTable({ superAdmins }: SuperAdminsTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo electronico</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {superAdmins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell className="font-medium">{admin.name}</TableCell>
              <TableCell className="text-muted-foreground">{admin.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
