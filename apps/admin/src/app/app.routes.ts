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
          import('./pages/permissions/permissions.component').then(
            (m) => m.PermissionsComponent,
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
