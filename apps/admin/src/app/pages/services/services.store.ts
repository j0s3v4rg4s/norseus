import { inject, computed } from '@angular/core';
import { patchState, signalStore, withMethods, withState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { forkJoin, of, EMPTY, pipe, from } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

import { Service, ServiceSchedule } from '@models/services';
import { ServicesService, SchedulesService } from '@front/core/services';
import { LoggerService } from '@front/utils';

interface ServicesState {
  isSaving: boolean;
  isDeleting: boolean;
  isLoading: boolean;
  isLoadingService: boolean;
  isLoadingSchedules: boolean;
  error: string;
  services: Service[];
  currentService: Service | null;
  currentServiceSchedules: ServiceSchedule[];
}

const initialState: ServicesState = {
  isSaving: false,
  isDeleting: false,
  isLoading: false,
  isLoadingService: false,
  isLoadingSchedules: false,
  error: '',
  services: [],
  currentService: null,
  currentServiceSchedules: [],
};

export const ServicesStore = signalStore(
  withState(initialState),
  withComputed((store) => ({ services: computed(() => store.services()) })),
  withMethods((store) => {
    const servicesService = inject(ServicesService);
    const schedulesService = inject(SchedulesService);
    const logger = inject(LoggerService);

    return {
      loadServices: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((id) =>
            servicesService.getAllServices(id).pipe(
              tap({
                next: (services: Service[]) => patchState(store, { services }),
                finalize: () => patchState(store, { isLoading: false }),
              }),
              catchError((error) => {
                logger.error('Error loading services:', error);
                patchState(store, {
                  isLoading: false,
                  error: 'Error loading services.',
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      createServiceWithSchedules(facilityId: string, serviceData: Omit<Service, 'id'>, schedules: ServiceSchedule[]) {
        patchState(store, { isSaving: true, error: '' });

        return servicesService.createService(facilityId, serviceData).pipe(
          switchMap((serviceId) => {
            if (schedules.length === 0) {
              return of(serviceId);
            }

            const scheduleObservables = schedules.map((schedule) =>
              from(schedulesService.createSchedule(facilityId, serviceId, schedule)),
            );

            return forkJoin(scheduleObservables).pipe(switchMap(() => of(serviceId)));
          }),
          tap({
            next: () => {
              patchState(store, { isSaving: false });
            },
            error: (error) => {
              logger.error('Error creating service with schedules:', error);
              patchState(store, {
                isSaving: false,
                error: 'Error al guardar el servicio. Intente nuevamente.',
              });
            },
          }),
        );
      },

      loadService: rxMethod<{ facilityId: string; serviceId: string }>(
        pipe(
          tap(() => patchState(store, { isLoadingService: true, error: '' })),
          switchMap(({ facilityId, serviceId }) =>
            servicesService.getServiceById(facilityId, serviceId).pipe(
              tap({
                next: (service: Service | undefined) => {
                  if (service) {
                    patchState(store, { currentService: service });
                  } else {
                    patchState(store, {
                      currentService: null,
                      error: 'Servicio no encontrado',
                    });
                  }
                },
                finalize: () => patchState(store, { isLoadingService: false }),
              }),
              catchError((error) => {
                logger.error('Error loading service:', error);
                patchState(store, {
                  isLoadingService: false,
                  error: 'Error al cargar el servicio.',
                  currentService: null,
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      loadServiceSchedules: rxMethod<{ facilityId: string; serviceId: string }>(
        pipe(
          tap(() => patchState(store, { isLoadingSchedules: true, error: '' })),
          switchMap(({ facilityId, serviceId }) =>
            schedulesService.getAllSchedules(facilityId, serviceId).pipe(
              tap({
                next: (schedules: ServiceSchedule[]) => patchState(store, { currentServiceSchedules: schedules }),
                finalize: () => patchState(store, { isLoadingSchedules: false }),
              }),
              catchError((error) => {
                logger.error('Error loading service schedules:', error);
                patchState(store, {
                  isLoadingSchedules: false,
                  error: 'Error al cargar los horarios del servicio.',
                  currentServiceSchedules: [],
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      updateService: async (facilityId: string, service: Service) => {
        patchState(store, { isSaving: true, error: '' });
        try {
          await servicesService.updateService(facilityId, service);
          patchState(store, { isSaving: false, currentService: service });
        } catch (error) {
          logger.error('Error updating service:', error);
          patchState(store, { isSaving: false, error: 'Error al actualizar el servicio. Intente nuevamente.' });
        }
      },

      deleteService: rxMethod<{ facilityId: string; serviceId: string }>(
        pipe(
          tap(() => patchState(store, { isDeleting: true, error: '' })),
          switchMap(({ facilityId, serviceId }) =>
            servicesService.deleteService(facilityId, serviceId).pipe(
              tap({
                next: () => {
                  patchState(store, {
                    isDeleting: false,
                    currentService: null,
                    currentServiceSchedules: [],
                  });
                },
                error: (error) => {
                  logger.error('Error deleting service:', error);
                  patchState(store, {
                    isDeleting: false,
                    error: 'Error al eliminar el servicio. Intente nuevamente.',
                  });
                },
              }),
              catchError((error) => {
                logger.error('Error deleting service:', error);
                patchState(store, {
                  isDeleting: false,
                  error: 'Error al eliminar el servicio. Intente nuevamente.',
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      reset(): void {
        patchState(store, initialState);
      },
    };
  }),
);
