import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@p1kka/ui/src/actions';
import { FormFieldComponent, InputDirective, SelectComponent, OptionComponent } from '@p1kka/ui/src/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PERMISSIONS_ACTIONS_DICTIONARY, PERMISSIONS_SECTIONS_DICTIONARY, PERMISSIONS_ACTIONS, PERMISSIONS_SECTIONS, Enums } from '@front/supabase';
import { CdkTableModule } from '@angular/cdk/table';

@Component({
  selector: 'app-permissions-create',
  imports: [
    CommonModule,
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
})
export class PermissionsCreateComponent {
  form: FormGroup;
  actions = PERMISSIONS_ACTIONS;
  actionsDictionary = PERMISSIONS_ACTIONS_DICTIONARY;
  sections = PERMISSIONS_SECTIONS;
  sectionsDictionary = PERMISSIONS_SECTIONS_DICTIONARY;

  // Table logic
  displayedColumns = ['action', 'section', 'delete'];
  dataSource: Array<{ action: string; section: string }> = [];
  duplicateError = signal(false);
  errorMessage = signal('');

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      roleName: ['', [Validators.required, Validators.maxLength(50)]],
      action: ['', Validators.required],
      section: ['', Validators.required],
    });
  }

  addPermissionAction() {
    const action = this.form.get('action')?.value;
    const section = this.form.get('section')?.value;
    if (!action || !section) {
      this.duplicateError.set(true);
      this.errorMessage.set('Por favor, selecciona una acción y una sección.');
      return;
    }
    const exists = this.dataSource.some(item => item.action === action && item.section === section);
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
    this.dataSource = this.dataSource.filter((_, i) => i !== index);
  }

  getActionLabel(action: Enums<'permission_action'> | string): string {
    return this.actionsDictionary[action as Enums<'permission_action'>] || action;
  }
  getSectionLabel(section: Enums<'sections'> | string): string {
    return this.sectionsDictionary[section as Enums<'sections'>] || section;
  }
}
