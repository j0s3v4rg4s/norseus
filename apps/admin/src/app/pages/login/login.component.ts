import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

// Pikka UI Imports
import { FormFieldComponent, InputDirective } from '@p1kka/ui/src/forms';
import { ButtonComponent } from '@p1kka/ui/src/actions';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent, // Import Pikka FormField
    InputDirective, // Import Pikka Input Directive
    ButtonComponent, // Import Pikka Button
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login attempt:', this.loginForm.value);
      // TODO: Implement actual login logic (e.g., call an auth service)
    } else {
      // Mark fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
    }
  }
}
