import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@p1kka/ui/src/actions';
import { FormFieldComponent, InputDirective, SelectComponent, OptionComponent } from '@p1kka/ui/src/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PERMISSIONS_ACTIONS_DICTIONARY, PERMISSIONS_SECTIONS_DICTIONARY, PERMISSIONS_ACTIONS, PERMISSIONS_SECTIONS } from '@front/supabase';

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
    InputDirective
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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      roleName: ['', [Validators.required, Validators.maxLength(50)]],
      action: [this.actions[0], Validators.required],
      section: [this.sections[0], Validators.required],
    });
  }
}
