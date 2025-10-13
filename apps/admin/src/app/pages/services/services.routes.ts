import { Route } from '@angular/router';
import { ServicesListComponent } from './services-list/services-list.component';
import { ServicesCreateComponent } from './services-create/services-create.component';
import { ServicesEditComponent } from './services-edit/services-edit.component';
import { ServicesDetailComponent } from './services-detail/services-detail.component';
import { ServicesProgramClassesComponent } from './services-program-classes/services-program-classes.component';

export const SERVICES_ROUTES: Route[] = [
  { path: '', component: ServicesListComponent },
  { path: 'create', component: ServicesCreateComponent },
  { path: ':id/edit', component: ServicesEditComponent },
  { path: ':id/program-classes', component: ServicesProgramClassesComponent },
  { path: ':id', component: ServicesDetailComponent },
];
