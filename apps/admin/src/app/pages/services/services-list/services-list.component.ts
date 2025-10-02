import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';

import { SessionSignalStore } from '@front/state/session';
import { ServicesStore } from './../services.store';
import { ConfirmComponent } from '@ui';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [RouterModule, CdkTableModule, MatDialogModule],
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServicesStore],
})
export class ServicesListComponent {
  displayedColumns = ['name', 'description', 'isActive', 'actions'];
  store = inject(ServicesStore);
  private sessionStore = inject(SessionSignalStore);
  private dialog = inject(MatDialog);

  constructor() {
    effect(() => {
      const loading = this.sessionStore.loading();
      const facility = this.sessionStore.selectedFacility();
      if (!loading && facility && facility.id) {
        this.store.loadServices(facility.id);
      }
    });
  }

  deleteService(serviceId: string): void {
    const facility = this.sessionStore.selectedFacility();

    if (!facility) {
      return;
    }

    this.dialog
      .open(ConfirmComponent, {
        data: { message: '¿Estás seguro de querer eliminar este servicio? Esta acción no se puede deshacer.' },
      })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => {
        this.store.deleteService({
          facilityId: facility.id as string,
          serviceId
        });

        this.store.loadServices(facility.id as string);
      });
  }
}
