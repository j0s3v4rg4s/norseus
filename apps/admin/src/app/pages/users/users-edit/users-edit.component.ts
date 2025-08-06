import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { filter, from, switchMap } from 'rxjs';

import { ProfileSignalStore } from '@front/core/profile';
import { ConfirmComponent, SelectModule } from '@ui';
import { usersStore } from '../users.store';

@Component({
  selector: 'app-users-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    SelectModule,
    MatDialogModule
  ],
  templateUrl: './users-edit.component.html',
  styleUrls: ['./users-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [usersStore],
})
export class UsersEditComponent {
  //****************************************************************************
  //* PUBLIC INSTANCE PROPERTIES
  //****************************************************************************
  form: FormGroup;

  //****************************************************************************
  //* PUBLIC INJECTIONS
  //****************************************************************************
  store = inject(usersStore);

  //****************************************************************************
  //* PRIVATE INJECTIONS
  //****************************************************************************
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private profileStore = inject(ProfileSignalStore);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  //****************************************************************************
  //* PRIVATE INSTANCE PROPERTIES
  //****************************************************************************
  private userId: string | null = null;

  //****************************************************************************
  //* CONSTRUCTOR
  //****************************************************************************
  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      role_id: ['', Validators.required],
    });

    effect(() => {
      const facility = this.profileStore.facility();
      if (facility) {
        this.store.loadRoles(facility.id);
      }
    });

    effect(() => {
      this.userId = this.route.snapshot.paramMap.get('id');
      if (this.userId) {
        this.store.loadUser(this.userId);
      }
    });

    effect(() => {
      const { user, isLoading } = this.store;
      if (user() && !isLoading()) {
        this.form.patchValue({ name: user()?.name, role_id: user()?.role_id, email: user()?.email });
      }
    });
  }

  //****************************************************************************
  //* PUBLIC METHODS
  //****************************************************************************
  async saveUser() {
    if (this.form.invalid || !this.userId) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, role_id } = this.form.value;
    const success = await this.store.updateUser(this.userId, { name, role_id });
    if (success) {
      this.router.navigate(['/home/users']);
    }
  }

  deleteUser() {
    if (!this.userId) return;

    this.dialog
      .open(ConfirmComponent, {
        data: { message: '¿Estás seguro de querer eliminar este usuario?' },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => from(this.store.deleteUser(this.userId!))),
        filter(Boolean)
      )
      .subscribe(() => {
        this.router.navigate(['/home/users']);
      });
  }
}
