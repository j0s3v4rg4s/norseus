import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '@p1kka/ui/src/actions';
import { FormFieldComponent, InputDirective, SelectComponent, OptionComponent } from '@p1kka/ui/src/forms';
import { usersStore } from '../users.store';
import { ProfileSignalStore } from '@front/core/profile';
import { USER_TYPES, USER_TYPES_DICTIONARY } from '@front/supabase';

@Component({
  selector: 'app-users-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    FormFieldComponent,
    SelectComponent,
    OptionComponent,
    InputDirective
],
  templateUrl: './users-create.component.html',
  styleUrls: ['./users-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [usersStore],
})
export class UsersCreateComponent {
  form: FormGroup;
  store = inject(usersStore);
  private router = inject(Router);
  private profileStore = inject(ProfileSignalStore);
  readonly userTypes = USER_TYPES;
  readonly userTypesDictionary = USER_TYPES_DICTIONARY;
  private fb = inject(FormBuilder);


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
