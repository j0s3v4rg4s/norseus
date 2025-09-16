import { Route } from '@angular/router';
import { LayoutComponent } from '@ui';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'home',
    component: LayoutComponent,
    children: [
      {
        path: 'permissions',
        loadChildren: () => import('./pages/permissions/permissions.routes').then((m) => m.PERMISSIONS_ROUTES),
      },
      {
        path: 'users',
        loadChildren: () => import('./pages/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
