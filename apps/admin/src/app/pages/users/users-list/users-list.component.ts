import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';

import { ButtonComponent } from '@p1kka/ui/src/actions';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from '@p1kka/ui/src/feedback';
import { CdkTableModule } from '@angular/cdk/table';
import { ProfileSignalStore } from '@front/core/profile';
import { usersStore } from './../users.store';
import { Role } from '@front/supabase';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [ButtonComponent, RouterModule, SpinnerComponent, CdkTableModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [usersStore],
})
export class UsersListComponent {
  displayedColumns = ['name', 'role', 'actions'];
  store = inject(usersStore);
  private profileStore = inject(ProfileSignalStore);

  constructor() {
    effect(() => {
      const loading = this.profileStore.loading();
      const facility = this.profileStore.facility();
      if (!loading && facility) {
        this.store.loadUsers(facility.id);
      }
    });
  }

  getRoleName(role: Role | null): string {
    return role?.name ?? 'N/A';
  }
}
