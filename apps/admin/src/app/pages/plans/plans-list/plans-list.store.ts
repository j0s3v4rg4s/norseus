import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Plan } from '@models/plans';
import { PlansService } from '@front/core/plans';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, from } from 'rxjs';

export interface PlansListState {
  plans: Plan[];
  loading: boolean;
  error: string | null;
}

export const initialState: PlansListState = {
  plans: [],
  loading: false,
  error: null,
};

export const PlansListStore = signalStore(
  withState(initialState),
  withMethods((store, plansService = inject(PlansService)) => ({
    loadPlans: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((facilityId) => from(plansService.getAllPlans(facilityId)).pipe(
          tap(plans => patchState(store, { plans, loading: false })),
          catchError(error => {
            patchState(store, { error: error.message, loading: false });
            return EMPTY;
          })
        ))
      )
    ),
    deletePlan: rxMethod<{ planId: string; facilityId: string }>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(({ planId, facilityId }) =>
          from(plansService.deletePlan(facilityId, planId)).pipe(
            tap(() => {
              patchState(store, (state) => ({
                plans: state.plans.filter((p) => p.id !== planId),
                loading: false,
              }));
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),
  }))
);
