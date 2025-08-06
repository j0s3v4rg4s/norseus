import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';

import { CdkTableModule } from '@angular/cdk/table';
import { RouterModule } from '@angular/router';

import { ProfileSignalStore } from '@front/core/profile';
import { Role } from '@front/supabase';
import { usersStore } from './../users.store';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [RouterModule, CdkTableModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [usersStore],
})
export class UsersListComponent {
  //****************************************************************************
  //* PUBLIC INSTANCE PROPERTIES
  //****************************************************************************
  displayedColumns = ['name', 'role', 'actions'];

  //****************************************************************************
  //* PUBLIC INJECTIONS
  //****************************************************************************
  store = inject(usersStore);

  //****************************************************************************
  //* PRIVATE INJECTIONS
  //****************************************************************************
  private profileStore = inject(ProfileSignalStore);

  //****************************************************************************
  //* CONSTRUCTOR
  //****************************************************************************
  constructor() {
    effect(() => {
      const loading = this.profileStore.loading();
      const facility = this.profileStore.facility();
      if (!loading && facility) {
        this.store.loadUsers(facility.id);
      }
    });
  }

  //****************************************************************************
  //* PUBLIC METHODS
  //****************************************************************************
  getRoleName(role: Role | null): string {
    return role?.name ?? 'N/A';
  }
}
