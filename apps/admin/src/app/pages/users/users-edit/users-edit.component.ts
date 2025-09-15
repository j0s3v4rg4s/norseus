import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { filter, from, switchMap } from 'rxjs';

import { SessionSignalStore } from '@front/state/session';
import { ConfirmComponent, SelectModule } from '@ui';
import { UsersStore } from '../users.store';

@Component({
  selector: 'app-users-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, SelectModule, MatDialogModule],
  templateUrl: './users-edit.component.html',
  styleUrls: ['./users-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsersStore],
})
export class UsersEditComponent {
  form: FormGroup;
  store = inject(UsersStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sessionStore = inject(SessionSignalStore);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private userId: string | null = null;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      email: [{ value: '' , disabled: true}],
      roleId: ['', Validators.required],
    });

    effect(() => {
      const facility = this.sessionStore.selectedFacility();
      if (facility) {
        this.store.loadRoles(facility.id as string);
      }
    });

    effect(() => {
      this.userId = this.route.snapshot.paramMap.get('id');
      if (this.userId) {
        this.store.loadEmployee(this.userId);
      }
    });

    effect(() => {
      const { employee, isLoading } = this.store;
      if (employee() && !isLoading()) {
        const emp = employee();
        this.form.patchValue({ name: emp?.profile.name, roleId: emp?.roleId, email: emp?.profile.email });
      }
    });
  }

  async saveUser() {
    if (this.form.invalid || !this.userId) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, roleId } = this.form.value;
    const success = await this.store.updateEmployee(this.userId, { name, roleId });
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
        switchMap(() => from(this.store.deleteEmployee(this.userId!))),
        filter(Boolean)
      )
      .subscribe(() => {
        this.router.navigate(['/home/users']);
      });
  }
}
