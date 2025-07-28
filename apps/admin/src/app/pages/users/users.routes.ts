import { Route } from '@angular/router';
import { UsersListComponent } from './users-list/users-list.component';
import { UsersCreateComponent } from './users-create/users-create.component';
import { UsersEditComponent } from './users-edit/users-edit.component';

export const USERS_ROUTES: Route[] = [
  { path: '', component: UsersListComponent },
  { path: 'create', component: UsersCreateComponent },
  { path: ':id/edit', component: UsersEditComponent },
];
