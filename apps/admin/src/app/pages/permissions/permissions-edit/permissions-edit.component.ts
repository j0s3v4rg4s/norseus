import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '@p1kka/ui/src/actions';
import { FormFieldComponent, InputDirective, SelectComponent, OptionComponent } from '@p1kka/ui/src/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  PERMISSIONS_ACTIONS_DICTIONARY,
  PERMISSIONS_SECTIONS_DICTIONARY,
  PERMISSIONS_ACTIONS,
  PERMISSIONS_SECTIONS,
  Enums,
} from '@front/supabase';
import { CdkTableModule } from '@angular/cdk/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmComponent } from '@ui';
import { filter, from, switchMap } from 'rxjs';
import { permissionsStore } from '../permissions.store';

@Component({
  selector: 'app-permissions-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    FormFieldComponent,
    SelectComponent,
    OptionComponent,
    InputDirective,
    CdkTableModule,
    MatDialogModule
],
  templateUrl: './permissions-edit.component.html',
  styleUrls: ['./permissions-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [permissionsStore],
})
export class PermissionsEditComponent {
  form: FormGroup;
  actions = PERMISSIONS_ACTIONS;
  actionsDictionary = PERMISSIONS_ACTIONS_DICTIONARY;
  sections = PERMISSIONS_SECTIONS;
  sectionsDictionary = PERMISSIONS_SECTIONS_DICTIONARY;

  displayedColumns = ['action', 'section', 'delete'];
  store = inject(permissionsStore);


  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  constructor() {
    this.form = this.fb.group({
      roleName: ['', [Validators.required, Validators.maxLength(50)]],
      action: ['', Validators.required],
      section: ['', Validators.required],
    });
    effect(() => {
      const roleId = this.route.snapshot.paramMap.get('id');
      if (roleId) {
        this.store.loadRole(roleId);
      }
    });

    effect(() => {
      const { role, isLoading } = this.store;
      if (role() && !isLoading()) {
        this.form.patchValue({ roleName: role()?.name });
      }
    });
  }

  deleteRole() {
    this.dialog
      .open(ConfirmComponent, {
        data: { message: '¿Estás seguro de querer eliminar este rol?' },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => from(this.store.deleteRole())),
        filter(Boolean),
      )
      .subscribe(() => {
        this.router.navigate(['/home/permissions']);
      });
  }

  addPermissionAction() {
    const action = this.form.get('action')?.value;
    const section = this.form.get('section')?.value;
    this.store.addPermission(action, section);
  }

  removePermissionAction(index: number) {
    this.store.removePermission(index);
  }

  getActionLabel(action: Enums<'permission_action'> | string): string {
    return this.actionsDictionary[action as Enums<'permission_action'>] || action;
  }
  getSectionLabel(section: Enums<'sections'> | string): string {
    return this.sectionsDictionary[section as Enums<'sections'>] || section;
  }

  async saveRole() {
    const roleName = this.form.get('roleName')?.value;
    const success = await this.store.saveRole(roleName);
    if (success) {
      this.router.navigate(['/home/permissions']);
    }
  }
}
