import { Route } from '@angular/router';
import { ProgrammingListComponent } from './programming-list';
import { ProgrammingCreateComponent } from './programming-create';

export const PROGRAMMING_ROUTES: Route[] = [
  { path: '', component: ProgrammingListComponent },
  { path: 'create', component: ProgrammingCreateComponent },
];
