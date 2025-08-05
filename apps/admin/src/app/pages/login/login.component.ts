import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { SUPABASE } from '@front/supabase';
import { Router } from '@angular/router';
import { ButtonComponent, SelectComponent } from '@ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, SelectComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private supabase = inject(SUPABASE);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    fruit: ['', [Validators.required]],
  });

  loading = signal(false);
  errorMessage = signal<string | null>(null);

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
