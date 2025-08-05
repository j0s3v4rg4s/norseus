import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SUPABASE } from '@front/supabase';
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
  private supabase = inject(SUPABASE);
  private router = inject(Router);

  //****************************************************************************
  //* PUBLIC INSTANCE PROPERTIES
  //****************************************************************************
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
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
        const { error } = await this.supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          this.errorMessage.set(error.message);
        } else {
          await this.router.navigateByUrl('/home');
        }
      } catch (err: unknown) {
        this.errorMessage.set(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        this.loading.set(false);
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
