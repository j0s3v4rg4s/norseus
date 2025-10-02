import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Timestamp } from 'firebase/firestore';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { Service, ServiceSchedule } from '@models/services';
import { DAY_OF_WEEK_LABELS, DayOfWeek } from '@models/common';
import { ServicesService } from '../services/services.service';
import { SchedulesService } from '../services/schedules.service';

interface ServiceCreateState {
  service: Omit<Service, 'id'> | null;
  schedules: ServiceSchedule[];
  conflictError: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string;
}

interface CreateSchedulesData {
  scheduleType: 'single' | 'multiple';
  days: DayOfWeek[];
  startTime: string;
  endTime?: string;
  duration: number;
  capacity: number;
  minReserveMinutes: number;
  minCancelMinutes: number;
}

interface CreateSingleScheduleData {
  day: DayOfWeek;
  startTime: string;
  duration: number;
  capacity: number;
  minReserveMinutes: number;
  minCancelMinutes: number;
}

interface CreateMultipleSchedulesData {
  days: DayOfWeek[];
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
  minReserveMinutes: number;
  minCancelMinutes: number;
}

const initialState: ServiceCreateState = {
  service: null,
  schedules: [],
  conflictError: '',
  isLoading: false,
  isSaving: false,
  error: '',
};

export const ServiceCreateStore = signalStore(
  withState(initialState),
  withComputed(({ schedules }) => ({
    schedulesMap: computed<Map<string, ServiceSchedule>>(() => {
      const scheduleList = schedules();
      const map = new Map<string, ServiceSchedule>();
      scheduleList.forEach((schedule) => {
        if (schedule.id) {
          map.set(schedule.id, schedule);
        }
      });
      return map;
    }),
    hasSchedules: computed<boolean>(() => schedules().length > 0),
  })),
  withMethods((store) => {
    const servicesService = inject(ServicesService);
    const schedulesService = inject(SchedulesService);

    return {
      setServiceData(data: Omit<Service, 'id'>): void {
        patchState(store, { service: data });
      },

      createSchedules(data: CreateSchedulesData): boolean {
        patchState(store, { conflictError: '', isLoading: true });

        const newSchedules: ServiceSchedule[] = [];

        try {
          if (data.scheduleType === 'single') {
            for (const day of data.days) {
              const schedule = createSingleSchedule({
                day,
                startTime: data.startTime,
                duration: data.duration,
                capacity: data.capacity,
                minReserveMinutes: data.minReserveMinutes,
                minCancelMinutes: data.minCancelMinutes,
              });
              if (schedule) {
                newSchedules.push(schedule);
              }
            }
          } else {
            if (!data.endTime) {
              patchState(store, {
                conflictError: 'La hora de fin es requerida para horarios múltiples.',
                isLoading: false,
              });
              return false;
            }

            const schedules = createMultipleSchedules({
              days: data.days,
              startTime: data.startTime,
              endTime: data.endTime,
              duration: data.duration,
              capacity: data.capacity,
              minReserveMinutes: data.minReserveMinutes,
              minCancelMinutes: data.minCancelMinutes,
            });
            newSchedules.push(...schedules);
          }

          if (newSchedules.length === 0) {
            patchState(store, {
              conflictError: 'No se pudieron crear horarios. Verifique los datos.',
              isLoading: false,
            });
            return false;
          }

          const conflictError = checkScheduleConflicts(store.schedules(), newSchedules);
          if (conflictError) {
            patchState(store, { conflictError, isLoading: false });
            return false;
          }

          patchState(store, (state) => ({
            schedules: [...state.schedules, ...newSchedules],
            isLoading: false,
          }));

          return true;
        } catch (error) {
          patchState(store, {
            conflictError: 'Error al crear los horarios. Intente nuevamente.',
            isLoading: false,
          });
          return false;
        }
      },

      deleteSchedule(scheduleId: string): void {
        patchState(store, (state) => ({
          schedules: state.schedules.filter((s) => s.id !== scheduleId),
        }));
      },

      saveServiceWithSchedules(facilityId: string) {
        const serviceData = store.service();
        const schedules = store.schedules();

        if (!serviceData) {
          patchState(store, { error: 'No se ha configurado la información del servicio' });
          return of(null);
        }

        patchState(store, { isSaving: true, error: '' });

        return servicesService.createService(facilityId, serviceData).pipe(
          switchMap(() => {
            const serviceId = (serviceData as Service).id;
            if (!serviceId) {
              throw new Error('No se pudo obtener el ID del servicio creado');
            }

            if (schedules.length === 0) {
              return of(serviceId);
            }

            const scheduleObservables = schedules.map((schedule) => {
              const { id, ...scheduleWithoutId } = schedule;
              return schedulesService.createSchedule(facilityId, serviceId, scheduleWithoutId);
            });

            return forkJoin(scheduleObservables).pipe(switchMap(() => of(serviceId)));
          }),
          tap(() => {
            patchState(store, { isSaving: false });
          }),
          catchError((error) => {
            patchState(store, {
              isSaving: false,
              error: 'Error al guardar el servicio. Intente nuevamente.',
            });
            throw error;
          })
        );
      },

      reset(): void {
        patchState(store, initialState);
      },
    };
  })
);function createSingleSchedule(data: CreateSingleScheduleData): ServiceSchedule | null {
  if (!data.day || !data.startTime) {
    return null;
  }

  return {
    id: generateScheduleId(),
    dayOfWeek: data.day,
    startTime: data.startTime,
    durationMinutes: Number(data.duration),
    capacity: Number(data.capacity),
    minReserveMinutes: Number(data.minReserveMinutes),
    minCancelMinutes: Number(data.minCancelMinutes),
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

function createMultipleSchedules(data: CreateMultipleSchedulesData): ServiceSchedule[] {
  const schedules: ServiceSchedule[] = [];

  if (!data.days.length || !data.startTime || !data.endTime) {
    return schedules;
  }

  const timeSlots = generateTimeSlots(data.startTime, data.endTime, Number(data.duration));

  for (const day of data.days) {
    for (const slot of timeSlots) {
      schedules.push({
        id: generateScheduleId(),
        dayOfWeek: day,
        startTime: slot,
        durationMinutes: Number(data.duration),
        capacity: Number(data.capacity),
        minReserveMinutes: Number(data.minReserveMinutes),
        minCancelMinutes: Number(data.minCancelMinutes),
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  }

  return schedules;
}

function generateTimeSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  let currentMinutes = startMinutes;
  while (currentMinutes <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    currentMinutes += durationMinutes;
  }

  return slots;
}

function generateScheduleId(): string {
  return `schedule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function checkScheduleConflicts(existingSchedules: ServiceSchedule[], newSchedules: ServiceSchedule[]): string | null {
  for (const newSchedule of newSchedules) {
    for (const existingSchedule of existingSchedules) {
      if (schedulesOverlap(newSchedule, existingSchedule)) {
        const newScheduleInfo = formatScheduleInfo(newSchedule);
        const existingScheduleInfo = formatScheduleInfo(existingSchedule);
        return `Conflicto de horarios: El horario ${newScheduleInfo} entra en conflicto con el horario existente ${existingScheduleInfo}.`;
      }
    }
  }

  return null;
}

function schedulesOverlap(schedule1: ServiceSchedule, schedule2: ServiceSchedule): boolean {
  if (schedule1.dayOfWeek !== schedule2.dayOfWeek) {
    return false;
  }

  const start1 = timeToMinutes(schedule1.startTime);
  const end1 = start1 + schedule1.durationMinutes;
  const start2 = timeToMinutes(schedule2.startTime);
  const end2 = start2 + schedule2.durationMinutes;

  return start1 < end2 && start2 < end1;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatScheduleInfo(schedule: ServiceSchedule): string {
  const dayLabel = DAY_OF_WEEK_LABELS[schedule.dayOfWeek];
  const endTime = calculateEndTime(schedule.startTime, schedule.durationMinutes);
  return `${dayLabel} de ${schedule.startTime} a ${endTime}`;
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}


