import { ChangeDetectionStrategy, Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  SUPABASE,
  Permission,
} from '@front/supabase';
import { CdkTableModule } from '@angular/cdk/table';

@Component({
  selector: 'app-permissions-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    FormFieldComponent,
    SelectComponent,
    OptionComponent,
    InputDirective,
    CdkTableModule,
  ],
  templateUrl: './permissions-edit.component.html',
  styleUrls: ['./permissions-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsEditComponent {
  form: FormGroup;
  actions = PERMISSIONS_ACTIONS;
  actionsDictionary = PERMISSIONS_ACTIONS_DICTIONARY;
  sections = PERMISSIONS_SECTIONS;
  sectionsDictionary = PERMISSIONS_SECTIONS_DICTIONARY;

  displayedColumns = ['action', 'section', 'delete'];
  dataSource: Array<{ action: string; section: string; id?: string }> = [];
  duplicateError = signal(false);
  errorMessage = signal('');
  loading = signal(false);
  statusSaveMessage = signal('');

  private supabase = inject(SUPABASE);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private roleId: string | null = null;
  removedPermissions = new Set<string>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      roleName: ['', [Validators.required, Validators.maxLength(50)]],
      action: ['', Validators.required],
      section: ['', Validators.required],
    });
    effect(() => {
      this.roleId = this.route.snapshot.paramMap.get('id');
      if (this.roleId) {
        this.loadRole(this.roleId);
      }
    });
  }

  async loadRole(roleId: string) {
    this.loading.set(true);
    try {
      const { data: role, error } = await this.supabase
        .from('role')
        .select('*, permissions(*)')
        .eq('id', roleId)
        .single();
      if (error || !role) {
        this.statusSaveMessage.set('Error loading role.');
        return;
      }
      this.form.patchValue({
        roleName: role.name,
      });
      this.dataSource = (role.permissions || []).map((perm: Permission) => ({
        action: perm.action,
        section: perm.section,
        id: perm.id,
      }));
    } catch (e) {
      this.statusSaveMessage.set('Unexpected error loading role.');
    } finally {
      this.loading.set(false);
    }
  }

  addPermissionAction() {
    const action = this.form.get('action')?.value;
    const section = this.form.get('section')?.value;
    if (!action || !section) {
      this.duplicateError.set(true);
      this.errorMessage.set('Por favor, selecciona una acción y una sección.');
      return;
    }
    const exists = this.dataSource.some((item) => item.action === action && item.section === section);
    if (exists) {
      this.duplicateError.set(true);
      this.errorMessage.set('Esta combinación ya fue agregada.');
      return;
    }
    this.dataSource = [...this.dataSource, { action, section }];
    this.duplicateError.set(false);
    this.errorMessage.set('');
  }

  removePermissionAction(index: number) {
    const removed = this.dataSource[index];
    this.dataSource = this.dataSource.filter((_, i) => i !== index);
    if (removed.id) {
      this.removedPermissions.add(removed.id);
    }
  }

  getActionLabel(action: Enums<'permission_action'> | string): string {
    return this.actionsDictionary[action as Enums<'permission_action'>] || action;
  }
  getSectionLabel(section: Enums<'sections'> | string): string {
    return this.sectionsDictionary[section as Enums<'sections'>] || section;
  }

  private toUpperSnakeCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word.toUpperCase())
      .join('_');
  }

  async saveRole() {
    this.statusSaveMessage.set('');
    if (!this.form.get('roleName')?.value || this.form.get('roleName')?.invalid) {
      this.statusSaveMessage.set('Debes ingresar un nombre de rol válido.');
      return;
    }
    if (this.dataSource.length === 0) {
      this.statusSaveMessage.set('Debes agregar al menos una combinación de acción y sección.');
      return;
    }
    this.loading.set(true);
    try {
      const newNameRole = this.toUpperSnakeCase(this.form.get('roleName')?.value as string);
      const newPermissions = this.dataSource.filter((item) => !item.id).map((item) => ({
        action: item.action,
        section: item.section,
      }));
      const permissionsToDelete = Array.from(this.removedPermissions);
      const { error } = await this.supabase.rpc('update_role_with_permissions', {
        role_id: this.roleId,
        new_role_name: newNameRole,
        new_permissions: newPermissions,
        permissions_to_delete: permissionsToDelete,
      });
      if (error) {
        console.log(error);
        this.statusSaveMessage.set('Error al actualizar el rol.');
        this.loading.set(false);
        return;
      }
      this.router.navigate(['/home/permissions']);
    } catch (e) {
      this.statusSaveMessage.set('Error inesperado al guardar.');
    } finally {
      this.loading.set(false);
    }
  }
}
