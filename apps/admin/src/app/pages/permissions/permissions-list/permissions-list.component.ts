import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';

import { CdkTableModule } from '@angular/cdk/table';
import { RouterModule } from '@angular/router';

import { ProfileSignalStore } from '@front/core/profile';
import { PERMISSIONS_ACTIONS_DICTIONARY, PERMISSIONS_SECTIONS_DICTIONARY, Permission } from '@front/supabase';
import { permissionsStore } from '../permissions.store';

@Component({
  selector: 'app-permissions-list',
  imports: [RouterModule, CdkTableModule],
  templateUrl: './permissions-list.component.html',
  styleUrls: ['./permissions-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [permissionsStore],
})
export class PermissionsListComponent {
  //****************************************************************************
  //* PUBLIC INJECTIONS
  //****************************************************************************
  store = inject(permissionsStore);

  //****************************************************************************
  //* PUBLIC INSTANCE PROPERTIES
  //****************************************************************************
  permissionsActionsDictionary = PERMISSIONS_ACTIONS_DICTIONARY;
  permissionsSectionsDictionary = PERMISSIONS_SECTIONS_DICTIONARY;
  displayedColumns = ['role', 'permissions', 'actions'];

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
        this.store.getAllRoles(facility.id);
      }
    });
  }

  //****************************************************************************
  //* PUBLIC COMPUTED PROPERTIES
  //****************************************************************************
  get dataSource() {
    return this.store.roles();
  }

  //****************************************************************************
  //* PUBLIC METHODS
  //****************************************************************************
  getPermissionsBySection(permissions: Permission[]) {
    return permissions.reduce(
      (acc, perm) => {
        if (!acc[perm.section]) acc[perm.section] = [];
        acc[perm.section].push(perm);
        return acc;
      },
      {} as Record<string, Permission[]>,
    );
  }

  getSectionKeys(permissions: Permission[]): string[] {
    return Object.keys(this.getPermissionsBySection(permissions));
  }

  getSectionLabel(section: string): string {
    return this.permissionsSectionsDictionary[section as keyof typeof this.permissionsSectionsDictionary] || section;
  }

  getActionLabel(action: string): string {
    return this.permissionsActionsDictionary[action as keyof typeof this.permissionsActionsDictionary] || action;
  }
}
