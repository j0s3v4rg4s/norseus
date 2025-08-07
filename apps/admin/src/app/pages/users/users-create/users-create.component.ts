import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { SelectModule } from '@ui';
import { ProfileSignalStore } from '@front/core/profile';
import { USER_TYPES, USER_TYPES_DICTIONARY } from '@front/supabase';
import { usersStore } from '../users.store';

@Component({
  selector: 'app-users-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    SelectModule
],
  templateUrl: './users-create.component.html',
  styleUrls: ['./users-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [usersStore],
})
export class UsersCreateComponent {
  //****************************************************************************
  //* PRIVATE INJECTIONS
  //****************************************************************************
  private router = inject(Router);
  private profileStore = inject(ProfileSignalStore);
  private fb = inject(FormBuilder);

  //****************************************************************************
  //* PRIVATE INSTANCE PROPERTIES
  //****************************************************************************
  form: FormGroup;
  store = inject(usersStore);
  readonly userTypes = USER_TYPES;
  readonly userTypesDictionary = USER_TYPES_DICTIONARY;

  //****************************************************************************
  //* CONSTRUCTOR
  //****************************************************************************
  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      roleId: ['', Validators.required],
      type: ['', Validators.required],
    });

    effect(() => {
      const facility = this.profileStore.facility();
      if (facility) {
        this.store.loadRoles(facility.id);
      }
    });
  }

  //****************************************************************************
  //* PUBLIC METHODS
  //****************************************************************************
  async saveUser() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, roleId, type } = this.form.value;
    const success = await this.store.createUser({
      name,
      email,
      roleId,
      type,
    });
    // if (success) {
    //   this.router.navigate(['/home/users']);
    // }
  }
}
