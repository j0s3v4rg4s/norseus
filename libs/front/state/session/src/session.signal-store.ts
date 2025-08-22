import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ProfileService, ProfileServiceError } from '@front/core/profile';
import { FacilityService, FacilityServiceError } from '@front/core/facility';
import { ProfileModel } from '@models/user';
import { FacilityModel } from '@models/facility';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, combineLatest, catchError, of } from 'rxjs';
import { LoggerService } from '@front/utils/logger';

export interface SessionState {
  profile: ProfileModel | null;
  facilities: FacilityModel[];
  selectedFacility: FacilityModel | null;
  loading: boolean;
  error: {
    profileError: unknown | null;
    facilityError: unknown | null;
  } | null;
}

const initialState: SessionState = {
  profile: null,
  facilities: [],
  selectedFacility: null,
  loading: false,
  error: null,
};

export const SessionSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, profileService = inject(ProfileService), facilityService = inject(FacilityService), loggerService = inject(LoggerService)) => {
    const handleServiceError = (error: unknown, methodName: string) => {
      loggerService.error(`🚨 Session Store Error (${methodName}):`, {
        message: error instanceof Error ? error.message : String(error),
        service:
          error instanceof ProfileServiceError
            ? 'ProfileService'
            : error instanceof FacilityServiceError
              ? 'FacilityService'
              : 'Unknown',
        userId:
          error instanceof ProfileServiceError || error instanceof FacilityServiceError ? error.userId : 'unknown',
        originalError:
          error instanceof ProfileServiceError || error instanceof FacilityServiceError
            ? error.originalError
            : error,
      });

      const profileError = error instanceof ProfileServiceError ? error.originalError : null;
      const facilityError = error instanceof FacilityServiceError ? error.originalError : null;

      patchState(store, {
        loading: false,
        error: { profileError, facilityError },
      });

      return of(null);
    };

    return {
      initAsEmployer: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap((userId) =>
            combineLatest([profileService.getProfile(userId), facilityService.getEmployeeFacilities(userId)]),
          ),
          tap(([profile, facilities]) => {
            patchState(store, {
              profile,
              facilities,
              selectedFacility: facilities[0] || null,
              loading: false,
            });
          }),
        ),
      ),
      initAsClient: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap((userId) =>
            combineLatest([profileService.getProfile(userId), facilityService.getClientFacilities(userId)]),
          ),
          tap(([profile, facilities]) => {
            patchState(store, {
              profile,
              facilities,
              selectedFacility: facilities.length === 1 ? facilities[0] : null,
              loading: false,
            });
          }),
          catchError((error) => handleServiceError(error, 'initAsClient')),
        ),
      ),
    };
  }),
);
