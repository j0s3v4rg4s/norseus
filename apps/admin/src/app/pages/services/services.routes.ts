import { Route } from '@angular/router';
import { ServicesListComponent } from './services-list/services-list.component';
import { ServicesCreateComponent } from './services-create/services-create.component';
import { ServicesEditComponent } from './services-edit/services-edit.component';

export const SERVICES_ROUTES: Route[] = [
  { path: '', component: ServicesListComponent },
  { path: 'create', component: ServicesCreateComponent },
  { path: ':id/edit', component: ServicesEditComponent },
];
