import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { sileo } from 'sileo';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@front/cn/components/alert-dialog';
import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@front/cn/components/card';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@front/cn/components/select';
import { Switch } from '@front/cn/components/switch';
import { deleteEmployee, getEmployee, updateEmployee } from '@front/employees';
import { getAllRoles } from '@front/roles';
import type { Role as RoleModel } from '@models/permissions';
import { db, functions } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { EmployeeFormSkeleton } from './components';

const employeeEditSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(50, 'Maximo 50 caracteres'),
  roleId: z.string().min(1, 'Rol requerido'),
  isActive: z.boolean(),
});

type EmployeeEditFormValues = z.infer<typeof employeeEditSchema>;

export default function EmployeesEditPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);

  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeEditFormValues>({
    resolver: zodResolver(employeeEditSchema),
    defaultValues: {
      name: '',
      roleId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!selectedFacility?.id || !employeeId) return;

    setLoading(true);
    Promise.all([
      getEmployee(db, selectedFacility.id, employeeId),
      getAllRoles(db, selectedFacility.id),
    ])
      .then(([employee, fetchedRoles]) => {
        if (!employee) {
          setNotFound(true);
          return;
        }
        setRoles(fetchedRoles);
        setEmail(employee.profile.email);
        reset({
          name: employee.profile.name,
          roleId: employee.roleId ?? '',
          isActive: employee.isActive ?? true,
        });
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [selectedFacility?.id, employeeId, reset]);

  async function onSubmit(data: EmployeeEditFormValues) {
    if (!selectedFacility?.id || !employeeId) return;

    try {
      await updateEmployee(functions, {
        userId: employeeId,
        facilityId: selectedFacility.id,
        name: data.name,
        roleId: data.roleId,
        isActive: data.isActive,
      });
      sileo.success({ title: 'Empleado actualizado correctamente', duration: 3000 });
      navigate('/home/employees');
    } catch {
      sileo.error({ title: 'Error al actualizar el empleado', duration: 3000 });
    }
  }

  async function handleDelete() {
    if (!selectedFacility?.id || !employeeId) return;

    setIsDeleting(true);
    try {
      await deleteEmployee(functions, {
        userId: employeeId,
        facilityId: selectedFacility.id,
      });
      sileo.success({ title: 'Empleado eliminado correctamente', duration: 3000 });
      navigate('/home/employees');
    } catch {
      sileo.error({ title: 'Error al eliminar el empleado', duration: 3000 });
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <EmployeeFormSkeleton />;
  }

  if (notFound) {
    return (
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
          <h1 className="text-3xl font-bold tracking-tight">
            Empleado no encontrado
          </h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            El empleado solicitado no existe o fue eliminado.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Editar empleado</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar empleado</AlertDialogTitle>
              <AlertDialogDescription>
                Esta accion no se puede deshacer. Se eliminara el empleado
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informacion del empleado</CardTitle>
            <CardDescription>
              Modifica los datos del empleado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                value={email}
                readOnly
                disabled
                className="opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                El correo electronico no puede ser modificado.
              </p>
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

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Estado del empleado</Label>
                <p className="text-sm text-muted-foreground">
                  Activa o desactiva el acceso del empleado a la plataforma.
                </p>
              </div>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
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
  );
}
