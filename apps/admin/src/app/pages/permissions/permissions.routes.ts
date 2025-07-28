import { Route } from '@angular/router';
import { PermissionsListComponent } from './permissions-list/permissions-list.component';
import { PermissionsCreateComponent } from './permissions-create/permissions-create.component';
import { PermissionsEditComponent } from './permissions-edit/permissions-edit.component';

export const PERMISSIONS_ROUTES: Route[] = [
  { path: '', component: PermissionsListComponent },
  { path: 'create', component: PermissionsCreateComponent },
  { path: ':id/edit', component: PermissionsEditComponent },
];
