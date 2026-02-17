import { useEffect, useMemo, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@front/cn/components/button';
import { getEmployees } from '@front/employees';
import { getAllRoles } from '@front/roles';
import type { EmployeeModel } from '@models/facility';
import type { Role } from '@models/permissions';
import { db } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { EmployeesTable, type EmployeeWithRole } from './components';

export default function EmployeesPage() {
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const [employees, setEmployees] = useState<EmployeeModel[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedFacility?.id) return;

    setLoading(true);
    Promise.all([
      getEmployees(db, selectedFacility.id),
      getAllRoles(db, selectedFacility.id),
    ])
      .then(([fetchedEmployees, fetchedRoles]) => {
        setEmployees(fetchedEmployees);
        setRoles(fetchedRoles);
      })
      .finally(() => setLoading(false));
  }, [selectedFacility?.id]);

  const rolesMap = useMemo(
    () => new Map(roles.map((role) => [role.id, role])),
    [roles]
  );

  const employeesWithRoles: EmployeeWithRole[] = useMemo(
    () =>
      employees.map((employee) => ({
        ...employee,
        role: rolesMap.get(employee.roleId ?? '') ?? null,
      })),
    [employees, rolesMap]
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los empleados de tu instalacion
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link to="/home/employees/create">
            <Plus className="h-4 w-4" />
            Nuevo empleado
          </Link>
        </Button>
      </div>

      {employeesWithRoles.length > 0 ? (
        <EmployeesTable employees={employeesWithRoles} />
      ) : (
        <div className="flex h-24 items-center justify-center rounded-lg border text-muted-foreground">
          No hay empleados registrados.
        </div>
      )}
    </div>
  );
}
