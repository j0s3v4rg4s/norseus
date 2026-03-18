import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { sileo } from 'sileo';

import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@front/cn/components/card';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import { Checkbox } from '@front/cn/components/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@front/cn/components/select';
import { createEmployee } from '@front/employees';
import { getAllRoles } from '@front/roles';
import type { Role as RoleModel } from '@models/permissions';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { db, functions } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { PermissionGuard } from '../../../components/permission-guard';

const employeeCreateSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(50, 'Maximo 50 caracteres'),
  email: z
    .string()
    .min(1, 'Email requerido')
    .pipe(z.email({ error: 'Email invalido' })),
  roleId: z.string().min(1, 'Rol requerido'),
  isAdmin: z.boolean(),
});

type EmployeeCreateFormValues = z.infer<typeof employeeCreateSchema>;

export default function EmployeesCreatePage() {
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const [roles, setRoles] = useState<RoleModel[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeCreateFormValues>({
    resolver: zodResolver(employeeCreateSchema),
    defaultValues: {
      name: '',
      email: '',
      roleId: '',
      isAdmin: false,
    },
  });

  useEffect(() => {
    if (!selectedFacility?.id) return;
    getAllRoles(db, selectedFacility.id).then(setRoles);
  }, [selectedFacility?.id]);

  async function onSubmit(data: EmployeeCreateFormValues) {
    if (!selectedFacility?.id) return;

    try {
      await createEmployee(functions, {
        ...data,
        facilityId: selectedFacility.id,
      });
      sileo.success({ title: 'Empleado creado correctamente', duration: 3000 });
      navigate('/home/employees');
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Error al crear el empleado';
      sileo.error({ title: message, duration: 5000 });
    }
  }

  return (
    <PermissionGuard section={PermissionSection.EMPLOYEES} action={PermissionAction.CREATE}>
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/home/employees')}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear empleado</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informacion del empleado</CardTitle>
            <CardDescription>
              Completa los datos para registrar un nuevo empleado
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Ingresa el nombre completo"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electronico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Rol</Label>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="roleId" aria-invalid={!!errors.roleId} className="w-full">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.roleId && (
                <p className="text-sm text-destructive">
                  {errors.roleId.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Controller
                name="isAdmin"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isAdmin"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isAdmin">Es administrador de esta sede</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/home/employees')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
    </PermissionGuard>
  );
}
