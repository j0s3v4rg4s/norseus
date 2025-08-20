import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { signInWithEmailAndPassword, Auth } from '@angular/fire/auth';

import { ButtonComponent } from '@ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  //****************************************************************************
  //* PUBLIC SIGNALS
  //****************************************************************************
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  //****************************************************************************
  //* PRIVATE INJECTIONS
  //****************************************************************************
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  //****************************************************************************
  //* PUBLIC INSTANCE PROPERTIES
  //****************************************************************************
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  //****************************************************************************
  //* PUBLIC METHODS
  //****************************************************************************
  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set(null);
      const { email, password } = this.loginForm.value;

      try {
        const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
        if (userCredential.user) {
          await this.router.navigateByUrl('/home');
        }
      } catch (error: any) {
        let errorMessage = 'An unexpected error occurred.';

        if (error.code) {
          switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/invalid-email':
              errorMessage = 'Invalid credentials.';
              break;
            case 'auth/user-disabled':
              errorMessage = 'This account has been disabled.';
              break;
            case 'auth/too-many-requests':
              errorMessage = 'Too many failed login attempts. Please try again later.';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Please check your connection.';
              break;
            default:
              errorMessage = error.message || 'Authentication failed.';
          }
        }

        this.errorMessage.set(errorMessage);
      } finally {
        this.loading.set(false);
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
