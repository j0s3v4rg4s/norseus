import { Eye } from 'lucide-react';
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
import type { EmployeeModel } from '@models/facility';
import type { Role } from '@models/permissions';

export type EmployeeWithRole = EmployeeModel & { role?: Role | null };

interface EmployeesTableProps {
  employees: EmployeeWithRole[];
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.uid}>
              <TableCell className="font-medium">
                {employee.profile.name}
              </TableCell>
              <TableCell>
                {employee.role ? (
                  <Badge variant="secondary">{employee.role.name}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={employee.isActive ?? true ? 'default' : 'destructive'}
                >
                  {employee.isActive ?? true ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link to={`/home/employees/${employee.uid}/edit`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Editar empleado</span>
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
