import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { CircleAlert, Loader2, TriangleAlert } from 'lucide-react';

import { Button } from '@front/cn/components/button';
import { Input } from '@front/cn/components/input';
import { Label } from '@front/cn/components/label';
import { auth } from '../../firebase';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .pipe(z.email({ error: 'Invalid email format' })),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
      return 'Invalid credentials. Please try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Authentication failed.';
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
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      const message = firebaseError.code
        ? getAuthErrorMessage(firebaseError.code)
        : 'An unexpected error occurred.';
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
            Manage your facility with precision.
          </h1>
          <p className="text-primary-foreground/60 text-lg leading-relaxed">
            The premium gym management dashboard designed for operational
            excellence and seamless member experiences.
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
              Welcome back
            </h2>
            <p className="text-muted-foreground text-base">
              Please enter your details to access your dashboard.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email-input" className="text-sm font-semibold">
                Email address
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
                Password
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
              Sign in
            </Button>

            {errorMessage && (
              <div className="w-full p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3 mt-2">
                <TriangleAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-destructive">
                    Authentication Failed
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
