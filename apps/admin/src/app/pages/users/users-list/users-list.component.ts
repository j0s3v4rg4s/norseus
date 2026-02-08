import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import { RouterModule } from '@angular/router';

import { SessionSignalStore } from '@front/state/session';
import { UsersStore } from './../users.store';
import { CDKSelectModule } from '@ui';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [RouterModule, CdkTableModule, CDKSelectModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsersStore],
})
export class UsersListComponent {
  displayedColumns = ['name', 'role', 'actions'];
  store = inject(UsersStore);
  private sessionStore = inject(SessionSignalStore);

  constructor() {
    effect(() => {
      const loading = this.sessionStore.loading();
      const facility = this.sessionStore.selectedFacility();
      if (!loading && facility && facility.id) {
        this.store.loadEmployees(facility.id);
        this.store.loadRoles(facility.id);
      }
    });
  }
}
