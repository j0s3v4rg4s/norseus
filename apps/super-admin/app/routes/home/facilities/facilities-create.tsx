import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, CheckCircle2, Loader2, Mail, Search, UserCheck } from 'lucide-react';
import { sileo } from 'sileo';

import { Button } from '@front/cn/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@front/cn/components/card';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import {
  checkUserExists,
  createFacilityWithAdmin,
  createFacilityWithExistingAdmin,
  updateFacilityImages,
} from '@front/super-admin';
import type { CheckUserExistsResponse } from '@models/super-admin';
import { db, functions, storage } from '../../../firebase';
import { FacilityImageUpload } from '../../../components/facility-image-upload';

const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requerido')
    .pipe(z.email({ error: 'Email invalido' })),
});

const newUserFacilitySchema = z.object({
  adminName: z.string().min(1, 'Nombre requerido').max(100, 'Maximo 100 caracteres'),
  facilityName: z.string().min(1, 'Nombre de instalacion requerido').max(100, 'Maximo 100 caracteres'),
});

const existingUserFacilitySchema = z.object({
  facilityName: z.string().min(1, 'Nombre de instalacion requerido').max(100, 'Maximo 100 caracteres'),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type NewUserFacilityFormValues = z.infer<typeof newUserFacilitySchema>;
type ExistingUserFacilityFormValues = z.infer<typeof existingUserFacilitySchema>;

export default function FacilitiesCreatePage() {
  const navigate = useNavigate();
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  const [step, setStep] = useState<'check' | 'existing' | 'new'>('check');
  const [existingUser, setExistingUser] = useState<CheckUserExistsResponse | null>(null);
  const [checkedEmail, setCheckedEmail] = useState('');

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const newUserForm = useForm<NewUserFacilityFormValues>({
    resolver: zodResolver(newUserFacilitySchema),
    defaultValues: { adminName: '', facilityName: '' },
  });

  const existingUserForm = useForm<ExistingUserFacilityFormValues>({
    resolver: zodResolver(existingUserFacilitySchema),
    defaultValues: { facilityName: '' },
  });

  async function onCheckEmail(data: EmailFormValues) {
    try {
      const result = await checkUserExists(functions, { email: data.email });
      setCheckedEmail(data.email);

      if (result.exists) {
        setExistingUser(result);
        setStep('existing');
      } else {
        setStep('new');
      }
    } catch {
      sileo.error({ title: 'Error al verificar el email', duration: 5000 });
    }
  }

  async function uploadImages(facilityId: string) {
    const images: { logo?: string; logoIcon?: string } = {};

    if (bannerFile) {
      const bannerRef = ref(storage, `facilities/${facilityId}/logo`);
      await uploadBytes(bannerRef, bannerFile);
      images.logo = await getDownloadURL(bannerRef);
    }

    if (iconFile) {
      const iconRef = ref(storage, `facilities/${facilityId}/logoIcon`);
      await uploadBytes(iconRef, iconFile);
      images.logoIcon = await getDownloadURL(iconRef);
    }

    if (Object.keys(images).length > 0) {
      await updateFacilityImages(db, facilityId, images);
    }
  }

  async function onCreateWithExistingUser(data: ExistingUserFacilityFormValues) {
    try {
      const result = await createFacilityWithExistingAdmin(functions, {
        adminEmail: checkedEmail,
        facilityName: data.facilityName,
      });

      await uploadImages(result.facilityId);

      sileo.success({
        title: 'Instalacion creada correctamente',
        description: 'Se asigno el usuario existente como administrador',
        duration: 5000,
      });
      navigate('/home/facilities');
    } catch {
      sileo.error({ title: 'Error al crear la instalacion', duration: 5000 });
    }
  }

  async function onCreateWithNewUser(data: NewUserFacilityFormValues) {
    try {
      const result = await createFacilityWithAdmin(functions, {
        adminEmail: checkedEmail,
        adminName: data.adminName,
        facilityName: data.facilityName,
      });

      await uploadImages(result.facilityId);

      sileo.success({
        title: 'Instalacion creada correctamente',
        description: 'Se envio un correo al administrador para crear su contrasena',
        duration: 5000,
      });
      navigate('/home/facilities');
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      let message = 'Error al crear la instalacion';
      if (firebaseError.code === 'functions/already-exists') {
        message = 'El correo electronico ya esta en uso';
      }
      sileo.error({ title: message, duration: 5000 });
    }
  }

  function handleBack() {
    setStep('check');
    setExistingUser(null);
    setCheckedEmail('');
    setBannerFile(null);
    setIconFile(null);
    emailForm.reset();
    newUserForm.reset();
    existingUserForm.reset();
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (step === 'check' ? navigate('/home/facilities') : handleBack())}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva instalacion</h1>
        </div>
      </div>

      {/* Step 1: Email check */}
      {step === 'check' && (
        <form onSubmit={emailForm.handleSubmit(onCheckEmail)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verificar administrador</CardTitle>
              <CardDescription>
                Ingresa el correo del administrador para verificar si ya existe en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="check-email">Correo del administrador</Label>
                <Input
                  id="check-email"
                  type="email"
                  placeholder="admin@ejemplo.com"
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
            <Button type="button" variant="outline" onClick={() => navigate('/home/facilities')}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Step 2a: Existing user found */}
      {step === 'existing' && existingUser && (
        <form onSubmit={existingUserForm.handleSubmit(onCreateWithExistingUser)} className="space-y-6">
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
                Ya existe un usuario con este correo. Se asignara como administrador de la nueva instalacion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-300/40 bg-background/80 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700/90">Nombre</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{existingUser.name}</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Datos de la instalacion</CardTitle>
              <CardDescription>
                Ingresa el nombre de la instalacion y sube su logo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facility-name">Nombre de la instalacion</Label>
                <Input
                  id="facility-name"
                  placeholder="Mi Gimnasio"
                  aria-invalid={!!existingUserForm.formState.errors.facilityName}
                  {...existingUserForm.register('facilityName')}
                />
                {existingUserForm.formState.errors.facilityName && (
                  <p className="text-sm text-destructive">
                    {existingUserForm.formState.errors.facilityName.message}
                  </p>
                )}
              </div>

              <FacilityImageUpload
                label="Logo del sidebar (expandido)"
                description="Imagen horizontal que se muestra cuando el sidebar esta abierto"
                aspectRatio={3 / 1}
                previewClassName="h-20 w-full object-cover"
                value={bannerFile}
                onChange={setBannerFile}
              />

              <FacilityImageUpload
                label="Icono del sidebar (colapsado)"
                description="Imagen cuadrada que se muestra cuando el sidebar esta cerrado"
                aspectRatio={1 / 1}
                previewClassName="h-16 w-16 object-cover"
                value={iconFile}
                onChange={setIconFile}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={existingUserForm.formState.isSubmitting}>
              {existingUserForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear instalacion
            </Button>
            <Button type="button" variant="outline" onClick={handleBack}>
              Volver
            </Button>
          </div>
        </form>
      )}

      {/* Step 2b: New user */}
      {step === 'new' && (
        <form onSubmit={newUserForm.handleSubmit(onCreateWithNewUser)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la instalacion</CardTitle>
              <CardDescription>
                Ingresa el nombre de la instalacion y sube su logo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facility-name">Nombre de la instalacion</Label>
                <Input
                  id="facility-name"
                  placeholder="Mi Gimnasio"
                  aria-invalid={!!newUserForm.formState.errors.facilityName}
                  {...newUserForm.register('facilityName')}
                />
                {newUserForm.formState.errors.facilityName && (
                  <p className="text-sm text-destructive">
                    {newUserForm.formState.errors.facilityName.message}
                  </p>
                )}
              </div>

              <FacilityImageUpload
                label="Logo del sidebar (expandido)"
                description="Imagen horizontal que se muestra cuando el sidebar esta abierto"
                aspectRatio={3 / 1}
                previewClassName="h-20 w-full object-cover"
                value={bannerFile}
                onChange={setBannerFile}
              />

              <FacilityImageUpload
                label="Icono del sidebar (colapsado)"
                description="Imagen cuadrada que se muestra cuando el sidebar esta cerrado"
                aspectRatio={1 / 1}
                previewClassName="h-16 w-16 object-cover"
                value={iconFile}
                onChange={setIconFile}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nuevo administrador</CardTitle>
              <CardDescription>
                No se encontro un usuario con este correo. Se creara una cuenta nueva.
                Se le enviara un correo para crear su contrasena.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Nombre del administrador</Label>
                <Input
                  id="admin-name"
                  placeholder="Juan Perez"
                  aria-invalid={!!newUserForm.formState.errors.adminName}
                  {...newUserForm.register('adminName')}
                />
                {newUserForm.formState.errors.adminName && (
                  <p className="text-sm text-destructive">
                    {newUserForm.formState.errors.adminName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Correo del administrador</Label>
                <Input
                  id="admin-email"
                  type="email"
                  readOnly
                  disabled
                  className="opacity-60 cursor-not-allowed"
                  value={checkedEmail}
                />
                <p className="text-xs text-muted-foreground">Verificado en el paso anterior.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={newUserForm.formState.isSubmitting}>
              {newUserForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear instalacion
            </Button>
            <Button type="button" variant="outline" onClick={handleBack}>
              Volver
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
