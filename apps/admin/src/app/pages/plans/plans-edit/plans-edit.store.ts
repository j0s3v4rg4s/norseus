import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Plan } from '@models/plans';
import { Service } from '@models/services';
import { PlansService } from '@front/core/plans';
import { ServicesService } from '@front/core/services';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, from } from 'rxjs';
import { LoggerService } from '@front/utils';

export interface PlansEditState {
  plan: Plan | null;
  services: Service[];
  loading: boolean;
  error: string | null;
}

export const initialState: PlansEditState = {
  plan: null,
  services: [],
  loading: false,
  error: null,
};

export const PlansEditStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      plansService = inject(PlansService),
      servicesService = inject(ServicesService),
      logger = inject(LoggerService)
    ) => ({
      loadServices: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap((facilityId) =>
            from(servicesService.getAllServices(facilityId)).pipe(
              tap((services) => patchState(store, { services, loading: false })),
              catchError((error) => {
                patchState(store, { error: error.message, loading: false });
                return EMPTY;
              })
            )
          )
        )
      ),
      loadPlan: rxMethod<{ facilityId: string; planId: string }>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(({ facilityId, planId }) =>
            from(plansService.getPlanById(facilityId, planId)).pipe(
              tap((plan) => patchState(store, { plan, loading: false })),
              catchError((error) => {
                patchState(store, { error: error.message, loading: false });
                return EMPTY;
              })
            )
          )
        )
      ),
      async updatePlan(plan: Plan, facilityId: string): Promise<void> {
        patchState(store, { loading: true });
        try {
          await plansService.updatePlan(facilityId, plan);
          patchState(store, { loading: false });
        } catch (error) {
          patchState(store, { error: (error as Error).message, loading: false });
          logger.error('Error updating plan:', error);
        }
      },
    })
  )
);
