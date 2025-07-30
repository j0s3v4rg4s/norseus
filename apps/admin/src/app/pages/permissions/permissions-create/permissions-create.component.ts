import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '@p1kka/ui/src/actions';
import { FormFieldComponent, InputDirective, SelectComponent, OptionComponent } from '@p1kka/ui/src/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  PERMISSIONS_ACTIONS_DICTIONARY,
  PERMISSIONS_SECTIONS_DICTIONARY,
  PERMISSIONS_ACTIONS,
  PERMISSIONS_SECTIONS,
  Enums,
  SUPABASE,
} from '@front/supabase';
import { CdkTableModule } from '@angular/cdk/table';
import { ProfileSignalStore } from '@front/core/profile';
import { permissionsStore } from '../permissions.store';

@Component({
  selector: 'app-permissions-create',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    FormFieldComponent,
    SelectComponent,
    OptionComponent,
    InputDirective,
    CdkTableModule
],
  templateUrl: './permissions-create.component.html',
  styleUrls: ['./permissions-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [permissionsStore],
})
export class PermissionsCreateComponent {
  form: FormGroup;
  actions = PERMISSIONS_ACTIONS;
  actionsDictionary = PERMISSIONS_ACTIONS_DICTIONARY;
  sections = PERMISSIONS_SECTIONS;
  sectionsDictionary = PERMISSIONS_SECTIONS_DICTIONARY;

  displayedColumns = ['action', 'section', 'delete'];
  store = inject(permissionsStore);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.form = this.fb.group({
      roleName: ['', [Validators.required, Validators.maxLength(50)]],
      action: ['', Validators.required],
      section: ['', Validators.required],
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
      .map(word => word.toUpperCase())
      .join('_');
  }

  async saveRole() {
    const roleName = this.form.get('roleName')?.value;
    const success = await this.store.createRole(roleName);
    if (success) {
      this.router.navigate(['/home/permissions']);
    }
  }
}
