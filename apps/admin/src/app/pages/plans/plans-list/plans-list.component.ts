import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { PlansListStore } from './plans-list.store';
import { SessionSignalStore } from '@front/state/session';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmComponent } from '@ui';
import { filter } from 'rxjs';
import { Plan } from '@models/plans';

@Component({
  selector: 'app-plans-list',
  standalone: true,
  imports: [RouterModule, CdkTableModule, MatDialogModule],
  templateUrl: './plans-list.component.html',
  styleUrls: ['./plans-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlansListStore],
})
export class PlansListComponent {
  private readonly store = inject(PlansListStore);
  private readonly session = inject(SessionSignalStore);
  private readonly dialog = inject(MatDialog);

  readonly plans = this.store.plans;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly displayedColumns = ['name', 'cost', 'isActive', 'actions'];

  constructor() {
    effect(() => {
      const facilityId = this.session.selectedFacility()?.id;
      if (facilityId) {
        this.store.loadPlans(facilityId);
      }
    });
  }

  onDeletePlan(plan: Plan): void {
    const facilityId = this.session.selectedFacility()?.id;
    if (!facilityId) return;

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        message: `¿Estás seguro de querer eliminar el plan "${plan.name}"? Esta acción no se puede deshacer.`,
      },
    });

    dialogRef.afterClosed().pipe(filter(Boolean)).subscribe(() => {
      this.store.deletePlan({ planId: plan.id, facilityId });
    });
  }
}
