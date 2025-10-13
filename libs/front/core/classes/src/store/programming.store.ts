import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';

import { Service, ServiceSchedule } from '@models/services';
import { EmployeeModel } from '@models/facility';
import { ClassModel, ProgramType } from '@models/classes';
import { ServicesService, SchedulesService } from '@front/core/services';
import { EmployeeService } from '@front/core/employee';
import { ClassesService } from '../services';
import { LoggerService } from '@front/utils';
import { getDatesForDayOfWeek, getCurrentWeekRange, ClassCalendarSlot, CalendarColor } from '@ui';

interface ProgrammingState {
  isLoading: boolean;
  currentStep: number;
  services: Service[];
  employees: EmployeeModel[];
  schedules: ServiceSchedule[];
  dateCalendarSlots: ClassCalendarSlot<ServiceSchedule>[];
  programClasses: ClassModel[];
  error: string;
  serviceId: string | null;
}

const initialState: ProgrammingState = {
  isLoading: false,
  currentStep: 1,
  services: [],
  employees: [],
  schedules: [],
  dateCalendarSlots: [],
  programClasses: [],
  error: '',
  serviceId: null,
};

export const ProgrammingStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    activeSlots: computed(() =>
      store
        .dateCalendarSlots()
        .filter((slot) => slot.isSelected)
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    ),
    canProceedToStep2: computed(() => {
      return store.serviceId() !== null && store.dateCalendarSlots().filter((slot) => slot.isSelected).length > 0;
    }),
    dateCalendarSlotsMap: computed(() => {
      return store.dateCalendarSlots().reduce(
        (acc, slot) => {
          acc[slot.id] = slot;
          return acc;
        },
        {} as Record<string, ClassCalendarSlot<ServiceSchedule>>,
      );
    }),
    schedulesMap: computed(() => {
      return store.schedules().reduce(
        (acc, schedule) => {
          acc[schedule.id] = schedule;
          return acc;
        },
        {} as Record<string, ServiceSchedule>,
      );
    }),
  })),
  withMethods((store) => {
    const servicesService = inject(ServicesService);
    const employeeService = inject(EmployeeService);
    const schedulesService = inject(SchedulesService);
    const classesService = inject(ClassesService);
    const logger = inject(LoggerService);

    return {
      loadServices: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: '' })),
          switchMap((facilityId) =>
            servicesService.getAllServices(facilityId).pipe(
              tap({
                next: (services: Service[]) => patchState(store, { services }),
                finalize: () => patchState(store, { isLoading: false }),
              }),
              catchError((error) => {
                logger.error('Error loading services:', error);
                patchState(store, {
                  isLoading: false,
                  error: 'Error al cargar los servicios.',
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      loadEmployees: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: '' })),
          switchMap((facilityId) =>
            employeeService.getEmployees(facilityId).pipe(
              tap({
                next: (employees: EmployeeModel[]) => patchState(store, { employees }),
                finalize: () => patchState(store, { isLoading: false }),
              }),
              catchError((error) => {
                logger.error('Error loading employees:', error);
                patchState(store, {
                  isLoading: false,
                  error: 'Error al cargar los empleados.',
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      loadSchedules: rxMethod<{ facilityId: string; serviceId: string }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: '' })),
          switchMap(({ facilityId, serviceId }) =>
            schedulesService.getAllSchedules(facilityId, serviceId).pipe(
              tap({
                next: (schedules: ServiceSchedule[]) => {
                  patchState(store, { schedules, dateCalendarSlots: [] });

                  if (schedules.length > 0) {
                    const { startDate, endDate } = getCurrentWeekRange();
                    const newSlots: ClassCalendarSlot<ServiceSchedule>[] = [];

                    schedules.forEach((schedule) => {
                      const datesForSchedule = getDatesForDayOfWeek(startDate, endDate, schedule.dayOfWeek);

                      datesForSchedule.forEach((date: Date) => {
                        const slotId = `${schedule.id}-${date.toISOString().split('T')[0]}`;

                        const slotDate = new Date(date);
                        const [hours, minutes] = schedule.startTime.split(':').map(Number);
                        slotDate.setHours(hours, minutes, 0, 0);

                        const newSlot: ClassCalendarSlot<ServiceSchedule> = {
                          id: slotId,
                          date: slotDate,
                          startTime: schedule.startTime,
                          durationMinutes: schedule.durationMinutes,
                          isSelected: false,
                          disabled: !schedule.isActive,
                          displayLabel: schedule.startTime,
                          displaySubLabel: `${schedule.durationMinutes} min <br> Cap: ${schedule.capacity}`,
                          data: schedule,
                          color: CalendarColor.BLUE,
                        };
                        newSlots.push(newSlot);
                      });
                    });

                    if (newSlots.length > 0) {
                      patchState(store, {
                        dateCalendarSlots: newSlots,
                      });
                    }
                  }
                },
                finalize: () => patchState(store, { isLoading: false }),
              }),
              catchError((error) => {
                logger.error('Error loading schedules:', error);
                patchState(store, {
                  isLoading: false,
                  error: 'Error al cargar los horarios.',
                  schedules: [],
                  dateCalendarSlots: [],
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      generateDateCalendarSlots(startDate: Date, endDate: Date): void {
        const schedules = store.schedules();
        const existingSlots = store.dateCalendarSlots();
        const newSlots: ClassCalendarSlot<ServiceSchedule>[] = [];

        schedules.forEach((schedule) => {
          const datesForSchedule = getDatesForDayOfWeek(startDate, endDate, schedule.dayOfWeek);

          datesForSchedule.forEach((date: Date) => {
            const slotId = `${schedule.id}-${date.toISOString().split('T')[0]}`;
            const existingSlot = store.dateCalendarSlotsMap()[slotId];

            if (!existingSlot) {
              const slotDate = new Date(date);
              const [hours, minutes] = schedule.startTime.split(':').map(Number);
              slotDate.setHours(hours, minutes, 0, 0);

              const newSlot: ClassCalendarSlot<ServiceSchedule> = {
                id: slotId,
                date: slotDate,
                startTime: schedule.startTime,
                durationMinutes: schedule.durationMinutes,
                isSelected: false,
                disabled: false,
                displayLabel: schedule.startTime,
                displaySubLabel: `${schedule.durationMinutes} min <br> Cap: ${schedule.capacity}`,
                data: schedule,
                color: CalendarColor.BLUE,
              };
              newSlots.push(newSlot);
            }
          });
        });

        if (newSlots.length > 0) {
          patchState(store, {
            dateCalendarSlots: [...existingSlots, ...newSlots],
          });
        }
      },

      toggleSlotSelection(slotId: string): void {
        const currentSlots = store.dateCalendarSlots();
        const updatedSlots = currentSlots.map((slot) =>
          slot.id === slotId ? { ...slot, isSelected: !slot.isSelected } : slot,
        );

        patchState(store, {
          dateCalendarSlots: updatedSlots,
        });
      },

      setSlotSelection(slotId: string, isSelected: boolean): void {
        const currentSlots = store.dateCalendarSlots();
        const updatedSlots = currentSlots.map((slot) => (slot.id === slotId ? { ...slot, isSelected } : slot));

        patchState(store, {
          dateCalendarSlots: updatedSlots,
        });
      },

      setServiceId(serviceId: string): void {
        patchState(store, { serviceId });
      },

      decrementCurrentStep(): void {
        patchState(store, { currentStep: store.currentStep() - 1 });
      },

      incrementCurrentStep(): void {
        patchState(store, { currentStep: store.currentStep() + 1 });
      },

      canGoToNextStep(): boolean {
        return store.canProceedToStep2();
      },

      generateProgramClasses(facilityId: string, programDescription?: string): void {
        const activeSlots = store.activeSlots();
        const schedulesMap = store.schedulesMap();
        const serviceId = store.serviceId();
        const existingClasses = store.programClasses();

        if (!serviceId) return;

        const programClasses: ClassModel[] = activeSlots.map((slot) => {
          const schedule = schedulesMap[slot.data?.id || ''];
          const slotId = `temp-${slot.id}`;

          const existingClass = existingClasses.find((cls) => cls.id === slotId);

          return {
            id: slotId,
            serviceId,
            facilityId,
            date: Timestamp.fromDate(slot.date),
            capacity: schedule?.capacity || 0,
            scheduleId: schedule?.id,
            startAt: slot.startTime,
            duration: slot.durationMinutes,
            instructorId: existingClass?.instructorId || null,
            userBookings: [],
            program:
              programDescription && programDescription.trim() !== ''
                ? {
                    type: ProgramType.RICH_TEXT,
                    value: programDescription,
                  }
                : null,
          };
        });

        patchState(store, { programClasses });
      },

      setCoachAssignment(classId: string, instructorId: string): void {
        const currentClasses = store.programClasses();
        const updatedClasses = currentClasses.map((cls) => (cls.id === classId ? { ...cls, instructorId } : cls));

        patchState(store, { programClasses: updatedClasses });
      },

      assignSameCoachToAll(instructorId: string): void {
        const currentClasses = store.programClasses();
        const updatedClasses = currentClasses.map((cls) => ({
          ...cls,
          instructorId,
        }));

        patchState(store, { programClasses: updatedClasses });
      },

      clearCoachAssignment(instructorId: string): void {
        const currentClasses = store.programClasses();
        const updatedClasses = currentClasses.map((cls) =>
          cls.instructorId === instructorId ? { ...cls, instructorId: null } : cls,
        );

        patchState(store, { programClasses: updatedClasses });
      },

      async saveProgramClasses(facilityId: string): Promise<string[]> {
        const currentClasses = store.programClasses();

        if (currentClasses.length === 0) {
          throw new Error('No classes to save');
        }

        try {
          patchState(store, { isLoading: true, error: '' });

          const classIds = await classesService.createMultipleClasses(facilityId, currentClasses);

          patchState(store, { isLoading: false });
          return classIds;
        } catch (error) {
          logger.error('Error saving program classes:', error);
          patchState(store, {
            isLoading: false,
            error: 'Error al guardar las clases del programa.',
          });
          throw error;
        }
      },

      reset(): void {
        patchState(store, initialState);
      },
    };
  }),
);
