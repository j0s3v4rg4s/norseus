import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
import { createFacilityWithAdmin, updateFacilityLogo } from '@front/super-admin';
import { db, functions, storage } from '../../../firebase';

const facilityCreateSchema = z.object({
  adminEmail: z
    .string()
    .min(1, 'Email requerido')
    .pipe(z.email({ error: 'Email invalido' })),
  adminName: z.string().min(1, 'Nombre requerido').max(100, 'Maximo 100 caracteres'),
  facilityName: z.string().min(1, 'Nombre de instalacion requerido').max(100, 'Maximo 100 caracteres'),
});

type FacilityCreateFormValues = z.infer<typeof facilityCreateSchema>;

export default function FacilitiesCreatePage() {
  const navigate = useNavigate();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FacilityCreateFormValues>({
    resolver: zodResolver(facilityCreateSchema),
    defaultValues: {
      adminEmail: '',
      adminName: '',
      facilityName: '',
    },
  });

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(null);
    }
  }

  async function onSubmit(data: FacilityCreateFormValues) {
    try {
      const result = await createFacilityWithAdmin(functions, data);

      if (logoFile) {
        const logoRef = ref(storage, `facilities/${result.facilityId}/logo`);
        await uploadBytes(logoRef, logoFile);
        const logoUrl = await getDownloadURL(logoRef);
        await updateFacilityLogo(db, result.facilityId, logoUrl);
      }

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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/home/facilities')}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva instalacion</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                aria-invalid={!!errors.facilityName}
                {...register('facilityName')}
              />
              {errors.facilityName && (
                <p className="text-sm text-destructive">
                  {errors.facilityName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo (opcional)</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-16 w-16 rounded-lg object-cover border"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Administrador de la instalacion</CardTitle>
            <CardDescription>
              Se creara una cuenta de administrador para esta instalacion.
              Se le enviara un correo para crear su contrasena.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Nombre del administrador</Label>
              <Input
                id="admin-name"
                placeholder="Juan Perez"
                aria-invalid={!!errors.adminName}
                {...register('adminName')}
              />
              {errors.adminName && (
                <p className="text-sm text-destructive">
                  {errors.adminName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Correo del administrador</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@ejemplo.com"
                aria-invalid={!!errors.adminEmail}
                {...register('adminEmail')}
              />
              {errors.adminEmail && (
                <p className="text-sm text-destructive">
                  {errors.adminEmail.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear instalacion
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/home/facilities')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
