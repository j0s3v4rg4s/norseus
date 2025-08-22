import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';

import { CdkTableModule } from '@angular/cdk/table';
import { RouterModule } from '@angular/router';


import { PERMISSIONS_ACTIONS_DICTIONARY, PERMISSIONS_SECTIONS_DICTIONARY, PermissionsBySection, PermissionSection, PermissionAction } from '@front/core/roles';
import { permissionsStore } from '../permissions.store';
import { SessionSignalStore } from '@front/state/session';

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
  private sessionStore = inject(SessionSignalStore);

  //****************************************************************************
  //* CONSTRUCTOR
  //****************************************************************************
  constructor() {
    effect(() => {
      const loading = this.sessionStore.loading();
      const facility = this.sessionStore.selectedFacility();
      if (!loading && facility) {
        this.store.getAllRoles(facility.id as string);
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
  getPermissionsBySection(permissions: PermissionsBySection): PermissionsBySection {
    return permissions || {};
  }

  getSectionKeys(permissions: PermissionsBySection): PermissionSection[] {
    return Object.keys(permissions || {}) as PermissionSection[];
  }

  getSectionLabel(section: string): string {
    return this.permissionsSectionsDictionary[section as keyof typeof this.permissionsSectionsDictionary] || section;
  }

  getActionLabel(action: string | PermissionAction): string {
    return this.permissionsActionsDictionary[action as keyof typeof this.permissionsActionsDictionary] || String(action);
  }
}
