import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { CircleAlert, Loader2, TriangleAlert } from 'lucide-react';

import { Button } from '@front/cn/components/button';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import { auth } from '../../firebase';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requerido')
    .pipe(z.email({ error: 'Email invalido' })),
  password: z.string().min(1, 'Contrasena requerida'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
      return 'Credenciales invalidas. Intenta de nuevo.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido deshabilitada.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Intenta mas tarde.';
    case 'auth/network-request-failed':
      return 'Error de red. Verifica tu conexion.';
    default:
      return 'Error de autenticacion.';
  }
}

export default function Login() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setErrorMessage(null);

    try {
      const credential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const tokenResult = await credential.user.getIdTokenResult();
      const roles = (tokenResult.claims.roles as string[]) ?? [];

      if (!roles.includes('super_admin')) {
        await signOut(auth);
        setErrorMessage('No tienes permisos de super administrador.');
      }
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      const message = firebaseError.code
        ? getAuthErrorMessage(firebaseError.code)
        : 'Ocurrio un error inesperado.';
      setErrorMessage(message);
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Pane — Branding */}
      <div className="hidden lg:flex w-1/2 bg-foreground relative flex-col justify-between p-12 overflow-hidden">
        {/* Background image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-foreground/80 mix-blend-multiply z-10" />
          <img
            src="/images/login-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 flex items-center gap-3">
          <img
            src="/logos/icon.svg"
            alt="Norseus"
            className="h-10 w-10 brightness-0 invert"
          />
          <span className="text-primary-foreground font-bold text-xl tracking-wide uppercase">
            Norseus
          </span>
        </div>

        <div className="relative z-20 max-w-lg">
          <h1 className="text-primary-foreground text-5xl font-black leading-tight tracking-tight mb-4">
            Panel de Super Administracion
          </h1>
          <p className="text-primary-foreground/60 text-lg leading-relaxed">
            Gestiona instalaciones, administradores y la plataforma completa
            desde un solo lugar.
          </p>
        </div>

        <p className="relative z-20 text-primary-foreground/40 text-sm">
          &copy; {new Date().getFullYear()} Norseus
        </p>
      </div>

      {/* Right Pane — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md flex flex-col">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img
              src="/logos/icon.svg"
              alt="Norseus"
              className="h-10 w-10"
            />
            <span className="font-bold text-xl tracking-wide uppercase">
              Norseus
            </span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-black tracking-tight mb-2">
              Super Admin
            </h2>
            <p className="text-muted-foreground text-base">
              Accede al panel de gestion de instalaciones.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email-input" className="text-sm font-semibold">
                Correo electronico
              </Label>
              <div className="relative">
                <Input
                  id="email-input"
                  type="email"
                  placeholder="admin@norseus.com"
                  className={`h-12 pr-10 ${errors.email ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <CircleAlert className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive pointer-events-none" />
                )}
              </div>
              {errors.email && (
                <p className="text-sm font-medium text-destructive" id="email-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password-input" className="text-sm font-semibold">
                Contrasena
              </Label>
              <div className="relative">
                <Input
                  id="password-input"
                  type="password"
                  placeholder="••••••••"
                  className={`h-12 pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                />
                {errors.password && (
                  <CircleAlert className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive pointer-events-none" />
                )}
              </div>
              {errors.password && (
                <p className="text-sm font-medium text-destructive" id="password-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 mt-2 font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              Iniciar sesion
            </Button>

            {errorMessage && (
              <div className="w-full p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3 mt-2">
                <TriangleAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-destructive">
                    Error de autenticacion
                  </h3>
                  <p className="text-sm font-medium text-destructive/80 mt-1">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
