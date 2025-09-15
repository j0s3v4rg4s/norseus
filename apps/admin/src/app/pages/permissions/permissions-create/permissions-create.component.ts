import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';

import { ButtonComponent, SelectModule } from '@ui';
import {
  PERMISSIONS_ACTIONS,
  PERMISSIONS_ACTIONS_DICTIONARY,
  PERMISSIONS_SECTIONS,
  PERMISSIONS_SECTIONS_DICTIONARY,
} from '@front/core/roles';
import { PermissionAction, PermissionSection } from '@models/permissions';
import { permissionsStore } from '../permissions.store';

@Component({
  selector: 'app-permissions-create',
  imports: [ReactiveFormsModule, RouterModule, ButtonComponent, SelectModule, CdkTableModule],
  templateUrl: './permissions-create.component.html',
  styleUrls: ['./permissions-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [permissionsStore],
})
export class PermissionsCreateComponent {
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
  private fb = inject(FormBuilder);

  //****************************************************************************
  //* CONSTRUCTOR
  //****************************************************************************
  constructor() {
    this.form = this.fb.group({
      roleName: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  //****************************************************************************
  //* PUBLIC METHODS
  //****************************************************************************
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
    const success = await this.store.createRole(roleName);
    if (success) {
      this.router.navigate(['/home/permissions']);
    }
  }

  //****************************************************************************
  //* PRIVATE METHODS
  //****************************************************************************
  /**
   * Converts a string to UPPER_SNAKE_CASE.
   * Example: "admin user" => "ADMIN_USER"
   */
  private toUpperSnakeCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+/g, ' ') // Replace non-alphanumeric with space
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.toUpperCase())
      .join('_');
  }
}
