import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { createSuperAdmin } from '@front/super-admin';
import { functions } from '../../../firebase';

const superAdminCreateSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requerido')
    .pipe(z.email({ error: 'Email invalido' })),
  name: z.string().min(1, 'Nombre requerido').max(100, 'Maximo 100 caracteres'),
});

type SuperAdminCreateFormValues = z.infer<typeof superAdminCreateSchema>;

export default function SuperAdminsCreatePage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SuperAdminCreateFormValues>({
    resolver: zodResolver(superAdminCreateSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  async function onSubmit(data: SuperAdminCreateFormValues) {
    try {
      await createSuperAdmin(functions, data);
      sileo.success({
        title: 'Super administrador creado correctamente',
        description: 'Se envio un correo para crear su contrasena',
        duration: 5000,
      });
      navigate('/home/super-admins');
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      let message = 'Error al crear el super administrador';

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
          onClick={() => navigate('/home/super-admins')}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo super admin</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos del super administrador</CardTitle>
            <CardDescription>
              Se creara una cuenta con permisos de super administrador.
              Se le enviara un correo para crear su contrasena.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Juan Perez"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electronico</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ejemplo.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear super admin
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/home/super-admins')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
