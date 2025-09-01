import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { SelectModule } from '@ui';
import { SessionSignalStore } from '@front/state/session';
import { Role } from '@models/user';
import { UsersStore } from '../users.store';

@Component({
  selector: 'app-users-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, SelectModule],
  templateUrl: './users-create.component.html',
  styleUrls: ['./users-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsersStore],
})
export class UsersCreateComponent {
  private router = inject(Router);
  private sessionStore = inject(SessionSignalStore);
  private fb = inject(FormBuilder);

  form: FormGroup;
  store = inject(UsersStore);
  readonly userTypes = [Role.ADMIN, Role.USER];
  readonly userTypesDictionary: Record<string, string> = {
    [Role.ADMIN]: 'Admin',
    [Role.USER]: 'User',
  };

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      roleId: ['', Validators.required],
      userType: ['', Validators.required],
    });

    effect(() => {
      const facility = this.sessionStore.selectedFacility();
      if (facility) {
        this.store.loadRoles(facility.id as string);
      }
    });
  }

  async saveUser() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, roleId, userType } = this.form.value;
    const success = await this.store.createEmployee({
      name,
      email,
      roleId,
      userType,
    });
    if (success) {
      this.router.navigate(['/home/users']);
    }
  }
}
