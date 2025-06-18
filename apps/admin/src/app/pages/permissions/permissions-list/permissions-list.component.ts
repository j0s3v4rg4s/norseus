import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@p1kka/ui/src/actions';
import { RouterModule } from '@angular/router';
import {
  SUPABASE,
  PERMISSIONS_ACTIONS_DICTIONARY,
  PERMISSIONS_SECTIONS_DICTIONARY,
  Permission,
  Role,
} from '@front/supabase';
import { SpinnerComponent } from '@p1kka/ui/src/feedback';
import { CdkTableModule } from '@angular/cdk/table';
import { ProfileSignalStore } from '@front/core/profile';
import { permissionsStore } from '../permissions.store';

interface RoleWithPermissions {
  role: Role;
  permissions: Permission[];
}

@Component({
  selector: 'app-permissions-list',
  imports: [CommonModule, ButtonComponent, RouterModule, SpinnerComponent, CdkTableModule],
  templateUrl: './permissions-list.component.html',
  styleUrls: ['./permissions-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [permissionsStore],
})
export class PermissionsListComponent {
  permissionsActionsDictionary = PERMISSIONS_ACTIONS_DICTIONARY;
  permissionsSectionsDictionary = PERMISSIONS_SECTIONS_DICTIONARY;
  displayedColumns = ['role', 'permissions', 'actions'];
  store = inject(permissionsStore);
  private profileStore = inject(ProfileSignalStore);

  constructor() {
    effect(() => {
      const loading = this.profileStore.loading();
      const facility = this.profileStore.facility();
      if (!loading && facility) {
        this.store.getAllRoles(facility.id);
      }
    });
  }

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

  get dataSource() {
    return this.store.roles();
  }
}
