import { Route } from '@angular/router';

export const plansRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./plans-list').then((m) => m.PlansListComponent),
  },
  {
    path: 'create',
    loadComponent: () => import('./plans-create').then((m) => m.PlansCreateComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./plans-edit').then((m) => m.PlansEditComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./plans-detail').then((m) => m.PlansDetailComponent),
  },
];
