import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Loader2, Mail, Search, UserCheck } from 'lucide-react';
import { sileo } from 'sileo';

import { Button } from '@front/cn/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@front/cn/components/card';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import { checkClientExists, createClient } from '@front/clients';
import type { CheckClientExistsResponse } from '@models/user';
import { sendPasswordResetEmail } from 'firebase/auth';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { auth, functions } from '../../../firebase';
import { useSessionStore } from '../../../stores/session.store';
import { PermissionGuard } from '../../../components/permission-guard';
import { resolveClientsCreateErrorMessage } from './clients-create.config';

const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requerido')
    .pipe(z.email({ error: 'Email invalido' })),
});

const newClientSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Maximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'Email requerido')
    .pipe(z.email({ error: 'Email invalido' })),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type NewClientFormValues = z.infer<typeof newClientSchema>;

export default function ClientsCreatePage() {
  const navigate = useNavigate();
  const selectedFacility = useSessionStore((s) => s.selectedFacility);

  const [step, setStep] = useState<'check' | 'existing' | 'new'>('check');
  const [existingUser, setExistingUser] = useState<CheckClientExistsResponse | null>(null);
  const [checkedEmail, setCheckedEmail] = useState('');
  const [isAssociating, setIsAssociating] = useState(false);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const newClientForm = useForm<NewClientFormValues>({
    resolver: zodResolver(newClientSchema),
    defaultValues: { name: '', email: '' },
  });

  async function onCheckEmail(data: EmailFormValues) {
    if (!selectedFacility?.id) return;

    try {
      const result = await checkClientExists(functions, {
        email: data.email,
        facilityId: selectedFacility.id,
      });

      setCheckedEmail(data.email);

      if (result.exists) {
        setExistingUser(result);
        setStep('existing');
      } else {
        newClientForm.setValue('email', data.email);
        setStep('new');
      }
    } catch (error: unknown) {
      const message = resolveClientsCreateErrorMessage(error, 'Error al verificar el email');
      sileo.error({ title: message, duration: 5000 });
    }
  }

  async function onAssociateExisting() {
    if (!selectedFacility?.id || !existingUser?.profile) return;

    setIsAssociating(true);
    try {
      await createClient(functions, {
        email: checkedEmail,
        name: existingUser.profile.name,
        facilityId: selectedFacility.id,
      });
      sileo.success({ title: 'Cliente asociado correctamente', duration: 3000 });
      navigate('/home/clients');
    } catch (error: unknown) {
      const message = resolveClientsCreateErrorMessage(error, 'Error al asociar el cliente');
      sileo.error({ title: message, duration: 5000 });
    } finally {
      setIsAssociating(false);
    }
  }

  async function onCreateNew(data: NewClientFormValues) {
    if (!selectedFacility?.id) return;

    try {
      await createClient(functions, {
        email: data.email,
        name: data.name,
        facilityId: selectedFacility.id,
      });
      await sendPasswordResetEmail(auth, data.email);
      sileo.success({ title: 'Cliente creado. Se envio un correo para crear su contrasena', duration: 5000 });
      navigate('/home/clients');
    } catch (error: unknown) {
      const message = resolveClientsCreateErrorMessage(error, 'Error al crear el cliente');
      sileo.error({ title: message, duration: 5000 });
    }
  }

  function handleBack() {
    setStep('check');
    setExistingUser(null);
    setCheckedEmail('');
    emailForm.reset();
    newClientForm.reset();
  }

  return (
    <PermissionGuard section={PermissionSection.CLIENTS} action={PermissionAction.CREATE}>
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (step === 'check' ? navigate('/home/clients') : handleBack())}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crear cliente</h1>
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
              <Button type="button" variant="outline" onClick={() => navigate('/home/clients')}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Step 2a: Existing user found */}
        {step === 'existing' && existingUser?.profile && (
          <div className="space-y-6">
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
                  Ya existe un usuario con este correo electronico. Puedes asociarlo directamente como cliente de tu
                  instalacion.
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
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button onClick={onAssociateExisting} disabled={isAssociating}>
                {isAssociating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Asociar como cliente
              </Button>
              <Button type="button" variant="outline" onClick={handleBack}>
                Volver
              </Button>
            </div>
          </div>
        )}

        {/* Step 2b: New user */}
        {step === 'new' && (
          <form onSubmit={newClientForm.handleSubmit(onCreateNew)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informacion del cliente</CardTitle>
                <CardDescription>
                  No se encontro un usuario con este correo. Completa los datos para crear un nuevo cliente.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-name">Nombre completo</Label>
                  <Input
                    id="new-name"
                    placeholder="Ingresa el nombre completo"
                    aria-invalid={!!newClientForm.formState.errors.name}
                    {...newClientForm.register('name')}
                  />
                  {newClientForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{newClientForm.formState.errors.name.message}</p>
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
                    {...newClientForm.register('email')}
                  />
                  <p className="text-xs text-muted-foreground">Verificado en el paso anterior.</p>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button type="submit" disabled={newClientForm.formState.isSubmitting}>
                {newClientForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
