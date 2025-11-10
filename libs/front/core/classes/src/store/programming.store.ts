import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';

import { Service, ServiceSchedule } from '@models/services';
import { EmployeeModel } from '@models/facility';
import { ClassModel, ProgramType, ProgramDraft } from '@models/classes';
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
  programs: ProgramDraft[];
  editingProgramId: string | null;
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
  programs: [],
  editingProgramId: null,
  error: '',
  serviceId: null,
};

export const ProgrammingStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    confirmedPrograms: computed(() => store.programs().filter((p) => p.isConfirmed)),
    activeProgram: computed(() => store.programs().find((p) => !p.isConfirmed) || null),
    isEditingExistingProgram: computed(() => {
      const activeProgram = store.programs().find((p) => !p.isConfirmed);
      return activeProgram ? store.editingProgramId() === activeProgram.id : false;
    }),
    canProceedToStep2: computed(() => {
      return store.programs().filter((p) => p.isConfirmed).length > 0;
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

      createProgram(): void {
        const newProgram: ProgramDraft = {
          id: `temp-${Date.now()}`,
          title: '',
          slotIds: [],
          description: '',
          isConfirmed: false,
          coachAssignments: {},
        };

        patchState(store, {
          programs: [...store.programs(), newProgram],
          editingProgramId: null,
        });
      },

      updateProgram(update: { programId: string; title?: string; slotIds?: string[] }): void {
        const programs = store.programs();
        const updatedPrograms = programs.map((p) => {
          if (p.id === update.programId) {
            return {
              ...p,
              ...(update.title !== undefined && { title: update.title }),
              ...(update.slotIds !== undefined && { slotIds: update.slotIds }),
            };
          }
          return p;
        });

        patchState(store, { programs: updatedPrograms });

        if (update.slotIds !== undefined) {
          this.updateSlotSelection();
        }
      },

      confirmProgram(programId: string): void {
        const programs = store.programs();
        const program = programs.find((p) => p.id === programId);

        if (!program || !program.title || program.slotIds.length === 0) {
          patchState(store, { error: 'El programa debe tener título y al menos un slot seleccionado' });
          return;
        }

        const updatedPrograms = programs.map((p) => (p.id === programId ? { ...p, isConfirmed: true } : p));

        patchState(store, {
          programs: updatedPrograms,
          error: '',
        });

        this.updateSlotSelection();
      },

      editProgram(programId: string): void {
        const programs = store.programs();
        const updatedPrograms = programs.map((p) => (p.id === programId ? { ...p, isConfirmed: false } : p));

        patchState(store, {
          programs: updatedPrograms,
          editingProgramId: programId,
        });

        this.updateSlotSelection();
      },

      cancelEditProgram(programId: string): void {
        const programs = store.programs();
        const updatedPrograms = programs.map((p) => (p.id === programId ? { ...p, isConfirmed: true } : p));

        patchState(store, {
          programs: updatedPrograms,
          editingProgramId: null,
          error: '',
        });

        this.updateSlotSelection();
      },

      deleteProgram(programId: string): void {
        const programs = store.programs();
        const updatedPrograms = programs.filter((p) => p.id !== programId);

        patchState(store, {
          programs: updatedPrograms,
          editingProgramId: null,
          error: '',
        });

        this.updateSlotSelection();
      },

      updateSlotSelection(): void {
        const programs = store.programs();
        const activeProgram = programs.find((p) => !p.isConfirmed);
        const confirmedPrograms = programs.filter((p) => p.isConfirmed);

        const confirmedSlotIds = new Set(confirmedPrograms.flatMap((p) => p.slotIds));
        const activeSlotIds = new Set(activeProgram?.slotIds || []);

        const updatedSlots = store.dateCalendarSlots().map((slot) => {
          const isConfirmed = confirmedSlotIds.has(slot.id);
          const isActiveSelection = activeSlotIds.has(slot.id);

          return {
            ...slot,
            color: isConfirmed ? CalendarColor.GREEN : CalendarColor.BLUE,
            isSelected: isActiveSelection && !isConfirmed,
          };
        });

        patchState(store, { dateCalendarSlots: updatedSlots });
      },

      updateProgramDescription(programId: string, description: string): void {
        const programs = store.programs();
        const updatedPrograms = programs.map((p) => (p.id === programId ? { ...p, description } : p));

        patchState(store, { programs: updatedPrograms });
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

      setProgramCoachAssignment(programId: string, classId: string, instructorId: string): void {
        const programs = store.programs();
        const updatedPrograms = programs.map((p) => {
          if (p.id === programId) {
            return {
              ...p,
              coachAssignments: {
                ...p.coachAssignments,
                [classId]: instructorId,
              },
            };
          }
          return p;
        });

        patchState(store, { programs: updatedPrograms });
      },

      assignSameCoachToProgram(programId: string, instructorId: string): void {
        const programs = store.programs();
        const program = programs.find((p) => p.id === programId);

        if (!program) return;

        const coachAssignments: Record<string, string> = {};
        program.slotIds.forEach((slotId) => {
          coachAssignments[slotId] = instructorId;
        });

        const updatedPrograms = programs.map((p) => (p.id === programId ? { ...p, coachAssignments } : p));

        patchState(store, { programs: updatedPrograms });
      },

      clearProgramCoachAssignment(programId: string, instructorId: string): void {
        const programs = store.programs();
        const program = programs.find((p) => p.id === programId);

        if (!program) return;

        const coachAssignments: Record<string, string> = {};
        Object.entries(program.coachAssignments).forEach(([slotId, assignedId]) => {
          if (assignedId !== instructorId) {
            coachAssignments[slotId] = assignedId;
          }
        });

        const updatedPrograms = programs.map((p) => (p.id === programId ? { ...p, coachAssignments } : p));

        patchState(store, { programs: updatedPrograms });
      },

      generateClassesFromPrograms(facilityId: string): ClassModel[] {
        const programs = store.confirmedPrograms();
        const schedulesMap = store.schedulesMap();
        const dateCalendarSlotsMap = store.dateCalendarSlotsMap();
        const serviceId = store.serviceId();

        if (!serviceId) return [];

        const allClasses: ClassModel[] = [];

        programs.forEach((program) => {
          program.slotIds.forEach((slotId) => {
            const slot = dateCalendarSlotsMap[slotId];
            if (!slot) return;

            const schedule = schedulesMap[slot.data?.id || ''];
            const instructorId = program.coachAssignments[slotId] || null;

            const classModel: ClassModel = {
              id: `temp-${slotId}`,
              serviceId,
              facilityId,
              date: Timestamp.fromDate(slot.date),
              capacity: schedule?.capacity || 0,
              scheduleId: schedule?.id || '',
              startAt: slot.startTime,
              duration: slot.durationMinutes,
              instructorId,
              userBookings: [],
              program:
                program.description && program.description.trim() !== ''
                  ? {
                      type: ProgramType.RICH_TEXT,
                      value: program.description,
                    }
                  : null,
              programTitle: program.title,
            };

            allClasses.push(classModel);
          });
        });

        return allClasses;
      },

      async saveProgramClasses(facilityId: string): Promise<string[]> {
        const classes = this.generateClassesFromPrograms(facilityId);

        if (classes.length === 0) {
          throw new Error('No classes to save');
        }

        try {
          patchState(store, { isLoading: true, error: '' });

          const classIds = await classesService.createMultipleClasses(facilityId, classes);

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
