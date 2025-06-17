import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    children: [
      {
        path: 'permissions',
        loadComponent: () =>
          import('./pages/permissions/permissions-list/permissions-list.component').then(
            (m) => m.PermissionsListComponent,
          ),
      },
      {
        path: 'permissions/create',
        loadComponent: () =>
          import('./pages/permissions/permissions-create/permissions-create.component').then(
            (m) => m.PermissionsCreateComponent,
          ),
      },
      {
        path: 'permissions/:id/edit',
        loadComponent: () =>
          import('./pages/permissions/permissions-edit/permissions-edit.component').then(
            (m) => m.PermissionsEditComponent,
          ),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
