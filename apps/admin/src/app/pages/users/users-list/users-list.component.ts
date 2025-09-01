import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import { RouterModule } from '@angular/router';

import { SessionSignalStore } from '@front/state/session';
import { UsersStore } from './../users.store';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [RouterModule, CdkTableModule],
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
      if (!loading && facility) {
        this.store.loadEmployees(facility.id as string);
      }
    });
  }
}
