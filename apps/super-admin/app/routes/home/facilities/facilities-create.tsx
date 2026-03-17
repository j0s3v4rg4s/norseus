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
import { createFacilityWithAdmin, updateFacilityImages } from '@front/super-admin';
import { db, functions, storage } from '../../../firebase';
import { FacilityImageUpload } from '../../../components/facility-image-upload';

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
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

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

  async function onSubmit(data: FacilityCreateFormValues) {
    try {
      const result = await createFacilityWithAdmin(functions, data);

      const images: { logo?: string; logoIcon?: string } = {};

      if (bannerFile) {
        const bannerRef = ref(storage, `facilities/${result.facilityId}/logo`);
        await uploadBytes(bannerRef, bannerFile);
        images.logo = await getDownloadURL(bannerRef);
      }

      if (iconFile) {
        const iconRef = ref(storage, `facilities/${result.facilityId}/logoIcon`);
        await uploadBytes(iconRef, iconFile);
        images.logoIcon = await getDownloadURL(iconRef);
      }

      if (Object.keys(images).length > 0) {
        await updateFacilityImages(db, result.facilityId, images);
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
