import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

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
      return 'Invalid credentials.';
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
  const navigate = useNavigate();
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      if (userCredential.user) {
        navigate('/home');
      }
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      const message = firebaseError.code
        ? getAuthErrorMessage(firebaseError.code)
        : 'An unexpected error occurred.';
      setErrorMessage(message);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-foreground p-10 text-primary-foreground">
        <img
          src="/logos/icon.svg"
          alt="Norseus"
          className="h-20 w-20 brightness-0 invert"
        />
        <div className="space-y-4">
          <blockquote className="text-lg font-medium leading-relaxed">
            &ldquo;Simplify your gym management. Members, plans, schedules
            &mdash; all in one place.&rdquo;
          </blockquote>
          <p className="text-sm text-primary-foreground/60">
            Admin Dashboard
          </p>
        </div>
        <p className="text-xs text-primary-foreground/40">
          &copy; {new Date().getFullYear()} Norseus
        </p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center lg:hidden">
            <img src="/logos/logo_name.svg" alt="Norseus" className="h-10" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-1.5">
              <Label htmlFor="email-input">Email</Label>
              <Input
                id="email-input"
                type="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password-input">Password</Label>
              <Input
                id="password-input"
                type="password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              Sign in
            </Button>

            {errorMessage && (
              <p className="text-center text-sm text-destructive">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
