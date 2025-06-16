import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
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
})
export class PermissionsListComponent implements OnInit {
  private supabase = inject(SUPABASE);
  rolesWithPermissions = signal<RoleWithPermissions[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  permissionsActionsDictionary = PERMISSIONS_ACTIONS_DICTIONARY;
  permissionsSectionsDictionary = PERMISSIONS_SECTIONS_DICTIONARY;
  displayedColumns = ['role', 'permissions', 'actions'];

  async ngOnInit() {
    this.loading.set(true);
    this.error.set(null);
    try {
      // Fetch all roles with their permissions in a single query
      const { data: roles, error: rolesError } = await this.supabase.from('role').select('*, permissions(*)');

      if (rolesError) throw rolesError;
      // Map roles and their permissions
      const grouped: RoleWithPermissions[] = (roles || []).map(
        ({ permissions, ...role }: Role & { permissions: Permission[] }) => ({
          role,
          permissions: permissions || [],
        }),
      );
      this.rolesWithPermissions.set(grouped);
    } catch (e: any) {
      this.error.set(e.message || 'Error fetching roles or permissions');
    } finally {
      this.loading.set(false);
    }
  }

  getPermissionsBySection(permissions: Permission[]) {
    // Returns: { [section: string]: Permission[] }
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
    return this.rolesWithPermissions();
  }
}
