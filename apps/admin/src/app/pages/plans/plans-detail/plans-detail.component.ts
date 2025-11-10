import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SessionSignalStore } from '@front/state/session';
import { PlansDetailStore } from './plans-detail.store';
import { ClassLimitTypeNames, PlanDurationNames } from '@models/plans';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plans-detail',
  imports: [RouterModule, CommonModule],
  templateUrl: './plans-detail.component.html',
  styleUrl: './plans-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlansDetailStore],
})
export class PlansDetailComponent {
  private readonly store = inject(PlansDetailStore);
  private readonly session = inject(SessionSignalStore);
  private readonly route = inject(ActivatedRoute);

  readonly plan = this.store.plan;
  readonly services = this.store.services;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly planDurationNames = PlanDurationNames;
  readonly classLimitTypeNames = ClassLimitTypeNames;

  readonly includedServices = computed(() => {
    const plan = this.plan();
    const services = this.services();
    if (!plan || !services) {
      return [];
    }
    return plan.services.map((planService) => {
      const service = services.find((s) => s.id === planService.serviceId);
      return {
        ...planService,
        name: service?.name || 'Servicio no encontrado',
      };
    });
  });

  planId: string;

  constructor() {
    this.planId = this.route.snapshot.paramMap.get('id') || '';
    effect(() => {
      const facilityId = this.session.selectedFacility()?.id;
      if (facilityId && this.planId) {
        this.store.loadPlan({ facilityId, planId: this.planId });
        this.store.loadServices(facilityId);
      }
    })
  }
}
