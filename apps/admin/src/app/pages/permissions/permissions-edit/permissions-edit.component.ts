import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { filter, from, switchMap } from 'rxjs';

import { ButtonComponent, ConfirmComponent, SelectModule } from '@ui';
import {
  PERMISSIONS_ACTIONS,
  PERMISSIONS_ACTIONS_DICTIONARY,
  PERMISSIONS_SECTIONS,
  PERMISSIONS_SECTIONS_DICTIONARY,
} from '@front/core/roles';
import { PermissionAction, PermissionSection } from '@models/permissions';
import { permissionsStore } from '../permissions.store';

@Component({
  selector: 'app-permissions-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    SelectModule,
    ButtonComponent,
    CdkTableModule,
    MatDialogModule
],
  templateUrl: './permissions-edit.component.html',
  styleUrls: ['./permissions-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [permissionsStore],
})
export class PermissionsEditComponent {
  //****************************************************************************
  //* PUBLIC INJECTIONS
  //****************************************************************************
  store = inject(permissionsStore);

  //****************************************************************************
  //* PUBLIC INSTANCE PROPERTIES
  //****************************************************************************
  form: FormGroup;
  actions = PERMISSIONS_ACTIONS;
  actionsDictionary = PERMISSIONS_ACTIONS_DICTIONARY;
  sections = PERMISSIONS_SECTIONS;
  sectionsDictionary = PERMISSIONS_SECTIONS_DICTIONARY;

  //****************************************************************************
  //* PRIVATE INJECTIONS
  //****************************************************************************
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  //****************************************************************************
  //* CONSTRUCTOR
  //****************************************************************************
  constructor() {
    this.form = this.fb.group({
      roleName: ['', [Validators.required, Validators.maxLength(50)]],
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

  //****************************************************************************
  //* PUBLIC METHODS
  //****************************************************************************
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

  hasPermission(section: PermissionSection, action: PermissionAction): boolean {
    return this.store.permissions().some((p) => p.section === section && p.action === action);
  }

  onPermissionChange(event: Event, section: PermissionSection, action: PermissionAction) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.store.addPermission(action, section);
    } else {
      const index = this.store.permissions().findIndex((p) => p.section === section && p.action === action);
      if (index > -1) {
        this.store.removePermission(index);
      }
    }
  }

  getActionLabel(action: string): string {
    return this.actionsDictionary[action as keyof typeof this.actionsDictionary] || action;
  }

  getSectionLabel(section: string): string {
    return this.sectionsDictionary[section as keyof typeof this.sectionsDictionary] || section;
  }

  async saveRole() {
    const roleName = this.form.get('roleName')?.value;
    const success = await this.store.saveRole(roleName);
    if (success) {
      this.router.navigate(['/home/permissions']);
    }
  }
}
