import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Loader2, Mail, Search, UserCheck } from 'lucide-react';
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
import { addExistingEmployee, checkEmployeeExists, createEmployee } from '@front/employees';
import { getAllRoles } from '@front/roles';
import type { Role as RoleModel } from '@models/permissions';
import { PermissionSection, PermissionAction } from '@models/permissions';
import type { CheckEmployeeExistsResponse } from '@models/user';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db, functions } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { PermissionGuard } from '../../../components/permission-guard';
import { resolveEmployeesCreateErrorMessage } from './employees-create.config';

const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requerido')
    .pipe(z.email({ error: 'Email invalido' })),
});

const employeeFormSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(50, 'Maximo 50 caracteres'),
  email: z
    .string()
    .min(1, 'Email requerido')
    .pipe(z.email({ error: 'Email invalido' })),
  roleId: z.string().min(1, 'Rol requerido'),
  isAdmin: z.boolean(),
});

const existingEmployeeSchema = z.object({
  roleId: z.string().min(1, 'Rol requerido'),
  isAdmin: z.boolean(),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
type ExistingEmployeeFormValues = z.infer<typeof existingEmployeeSchema>;

export default function EmployeesCreatePage() {
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);
  const [roles, setRoles] = useState<RoleModel[]>([]);

  const [step, setStep] = useState<'check' | 'existing' | 'new'>('check');
  const [existingUser, setExistingUser] = useState<CheckEmployeeExistsResponse | null>(null);
  const [checkedEmail, setCheckedEmail] = useState('');

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const newEmployeeForm = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: { name: '', email: '', roleId: '', isAdmin: false },
  });

  const existingEmployeeForm = useForm<ExistingEmployeeFormValues>({
    resolver: zodResolver(existingEmployeeSchema),
    defaultValues: { roleId: '', isAdmin: false },
  });

  useEffect(() => {
    if (!selectedFacility?.id) return;
    getAllRoles(db, selectedFacility.id).then(setRoles);
  }, [selectedFacility?.id]);

  async function onCheckEmail(data: EmailFormValues) {
    if (!selectedFacility?.id) return;

    try {
      const result = await checkEmployeeExists(functions, {
        email: data.email,
        facilityId: selectedFacility.id,
      });

      setCheckedEmail(data.email);

      if (result.exists) {
        setExistingUser(result);
        setStep('existing');
      } else {
        newEmployeeForm.setValue('email', data.email);
        setStep('new');
      }
    } catch (error: unknown) {
      const message = resolveEmployeesCreateErrorMessage(error, 'Error al verificar el email');
      sileo.error({ title: message, duration: 5000 });
    }
  }

  async function onAssociateExisting(data: ExistingEmployeeFormValues) {
    if (!selectedFacility?.id || !existingUser?.profile) return;

    try {
      await addExistingEmployee(functions, {
        email: checkedEmail,
        roleId: data.roleId,
        facilityId: selectedFacility.id,
        isAdmin: data.isAdmin,
      });
      sileo.success({ title: 'Empleado agregado correctamente', duration: 3000 });
      navigate('/home/employees');
    } catch (error: unknown) {
      const message = resolveEmployeesCreateErrorMessage(error, 'Error al agregar el empleado');
      sileo.error({ title: message, duration: 5000 });
    }
  }

  async function onCreateNew(data: EmployeeFormValues) {
    if (!selectedFacility?.id) return;

    try {
      await createEmployee(functions, {
        ...data,
        facilityId: selectedFacility.id,
      });
      sileo.success({ title: 'Empleado creado. Se envio un correo para crear su contrasena', duration: 5000 });
      await sendPasswordResetEmail(auth, data.email);
      navigate('/home/employees');
    } catch (error: unknown) {
      const message = resolveEmployeesCreateErrorMessage(error, 'Error al crear el empleado');
      sileo.error({ title: message, duration: 5000 });
    }
  }

  function handleBack() {
    setStep('check');
    setExistingUser(null);
    setCheckedEmail('');
    emailForm.reset();
    newEmployeeForm.reset();
    existingEmployeeForm.reset();
  }

  return (
    <PermissionGuard section={PermissionSection.EMPLOYEES} action={PermissionAction.CREATE}>
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (step === 'check' ? navigate('/home/employees') : handleBack())}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crear empleado</h1>
          </div>
        </div>

        {/* Step 1: Email check */}
        {step === 'check' && (
          <form onSubmit={emailForm.handleSubmit(onCheckEmail)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verificar email</CardTitle>
                <CardDescription>
                  Ingresa el correo electronico para verificar si el usuario ya existe en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="check-email">Correo electronico</Label>
                  <Input
                    id="check-email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    aria-invalid={!!emailForm.formState.errors.email}
                    {...emailForm.register('email')}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button type="submit" disabled={emailForm.formState.isSubmitting}>
                {emailForm.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Verificar
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/home/employees')}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Step 2a: Existing user found */}
        {step === 'existing' && existingUser?.profile && (
          <form onSubmit={existingEmployeeForm.handleSubmit(onAssociateExisting)} className="space-y-6">
            <Card className="overflow-hidden border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 via-background to-background">
              <CardHeader className="space-y-4 pb-4">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/70 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Usuario existente
                </div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                  Usuario encontrado
                </CardTitle>
                <CardDescription className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Ya existe un usuario con este correo electronico. Selecciona el rol para
                  agregarlo como empleado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-300/40 bg-background/80 p-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700/90">Nombre</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{existingUser.profile.name}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-300/40 bg-background/80 p-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700/90">
                      Correo electronico
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-base font-semibold text-foreground">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      <span className="truncate">{checkedEmail}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <Controller
                      name="roleId"
                      control={existingEmployeeForm.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger aria-invalid={!!existingEmployeeForm.formState.errors.roleId} className="w-full">
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
                    {existingEmployeeForm.formState.errors.roleId && (
                      <p className="text-sm text-destructive">{existingEmployeeForm.formState.errors.roleId.message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="isAdmin"
                      control={existingEmployeeForm.control}
                      render={({ field }) => (
                        <Checkbox
                          id="existing-isAdmin"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="existing-isAdmin">Es administrador de esta sede</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button type="submit" disabled={existingEmployeeForm.formState.isSubmitting}>
                {existingEmployeeForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Agregar como empleado
              </Button>
              <Button type="button" variant="outline" onClick={handleBack}>
                Volver
              </Button>
            </div>
          </form>
        )}

        {/* Step 2b: New user */}
        {step === 'new' && (
          <form onSubmit={newEmployeeForm.handleSubmit(onCreateNew)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informacion del empleado</CardTitle>
                <CardDescription>
                  No se encontro un usuario con este correo. Completa los datos para crear un nuevo empleado.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-name">Nombre completo</Label>
                  <Input
                    id="new-name"
                    placeholder="Ingresa el nombre completo"
                    aria-invalid={!!newEmployeeForm.formState.errors.name}
                    {...newEmployeeForm.register('name')}
                  />
                  {newEmployeeForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{newEmployeeForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-email">Correo electronico</Label>
                  <Input
                    id="new-email"
                    type="email"
                    readOnly
                    disabled
                    className="opacity-60 cursor-not-allowed"
                    {...newEmployeeForm.register('email')}
                  />
                  <p className="text-xs text-muted-foreground">Verificado en el paso anterior.</p>
                </div>

                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Controller
                    name="roleId"
                    control={newEmployeeForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger aria-invalid={!!newEmployeeForm.formState.errors.roleId} className="w-full">
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
                  {newEmployeeForm.formState.errors.roleId && (
                    <p className="text-sm text-destructive">{newEmployeeForm.formState.errors.roleId.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <Controller
                    name="isAdmin"
                    control={newEmployeeForm.control}
                    render={({ field }) => (
                      <Checkbox
                        id="new-isAdmin"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="new-isAdmin">Es administrador de esta sede</Label>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button type="submit" disabled={newEmployeeForm.formState.isSubmitting}>
                {newEmployeeForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
              <Button type="button" variant="outline" onClick={handleBack}>
                Volver
              </Button>
            </div>
          </form>
        )}
      </div>
    </PermissionGuard>
  );
}
