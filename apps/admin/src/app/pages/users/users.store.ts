import { computed, inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';

import { EmployeeService } from '@front/core/employee';
import { EmployeeModel } from '@models/facility';
import { Role } from '@front/core/roles';
import { RolesService } from '@front/core/roles';
import { CreateEmployeeRequest, DeleteEmployeeRequest } from '@models/facility';
import { SessionSignalStore } from '@front/state/session';

export type EmployeeProfile = EmployeeModel & {
  role?: Role | null;
  email?: string;
};

type EmployeeState = {
  isLoading: boolean;
  errorMessage: string;
  statusSaveMessage: string;
  employees: EmployeeProfile[];
  employee: EmployeeProfile | null;
  roles: Role[];
};

export const initialState: EmployeeState = {
  isLoading: false,
  errorMessage: '',
  statusSaveMessage: '',
  employees: [],
  employee: null,
  roles: [],
};

export const UsersStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    employeesWithRoles: computed(() => {
      const rolesMap = new Map(store.roles().map((role) => [role.id, role]));
      return store.employees().map((employee) => ({
        ...employee,
        role: rolesMap.get(employee.roleId || ''),
      }));
    }),
  })),
  withMethods((store) => {
    const employeeService = inject(EmployeeService);
    const rolesService = inject(RolesService);
    const sessionStore = inject(SessionSignalStore);
    const facilityId = computed(() => sessionStore.selectedFacility()?.id);

    const loadRoles = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) =>
          rolesService.getAllRoles(id).pipe(
            tap({
              next: (roles: Role[]) => patchState(store, { roles }),
              finalize: () => patchState(store, { isLoading: false }),
            }),
            catchError(() => {
              patchState(store, { isLoading: false, errorMessage: 'Error loading roles.' });
              return EMPTY;
            })
          )
        )
      )
    );

    const loadEmployees = rxMethod<string>(
      pipe(
        switchMap((id) =>
          employeeService.getEmployees(id).pipe(
            tap({
              next: (employees: EmployeeModel[]) => patchState(store, { employees }),
              finalize: () => patchState(store, { isLoading: false }),
            }),
            catchError(() => {
              patchState(store, { isLoading: false, errorMessage: 'Error loading employees.' });
              return EMPTY;
            })
          )
        )
      ) 
    );

    const loadEmployee = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((employeeId) =>
          employeeService.getEmployee(facilityId() || '', employeeId).pipe(
            tap({
              next: (employee: EmployeeModel | undefined) => patchState(store, { employee: employee as EmployeeProfile }),
              finalize: () => patchState(store, { isLoading: false }),
            }),
            catchError(() => {
              patchState(store, { isLoading: false, errorMessage: 'Error loading employee.' });
              return EMPTY;
            })
          )
        )
      )
    );

    const createEmployee = async (payload: Omit<CreateEmployeeRequest, 'facilityId'>) => {
      patchState(store, { isLoading: true, statusSaveMessage: '' });
      const currentFacilityId = facilityId();
      if (!currentFacilityId) {
        patchState(store, { isLoading: false, statusSaveMessage: 'No facility selected.' });
        return false;
      }

      try {
        await employeeService.createEmployee({ ...payload, facilityId: currentFacilityId });
        patchState(store, { isLoading: false });
        return true;
      } catch (e: unknown) {
        patchState(store, {
          isLoading: false,
          statusSaveMessage: (e as Error).message || 'Error creating employee.',
        });
        return false;
      }
    };

    const updateEmployee = async (employeeId: string, payload: { name: string; roleId: string }) => {
      patchState(store, { isLoading: true, statusSaveMessage: '' });
      const currentFacilityId = facilityId();
      if (!currentFacilityId) {
        patchState(store, { isLoading: false, statusSaveMessage: 'No facility selected.' });
        return false;
      }

      try {
        await employeeService.updateEmployee(currentFacilityId, employeeId, payload);
        patchState(store, { isLoading: false });
        return true;
      } catch (e: unknown) {
        patchState(store, {
          isLoading: false,
          statusSaveMessage: (e as Error).message || 'Error updating employee.',
        });
        return false;
      }
    };

    const deleteEmployee = async (userId: string) => {
      patchState(store, { isLoading: true, statusSaveMessage: '' });
      const currentFacilityId = facilityId();
      if (!currentFacilityId) {
        patchState(store, { isLoading: false, statusSaveMessage: 'No facility selected.' });
        return false;
      }

      const payload: DeleteEmployeeRequest = { userId, facilityId: currentFacilityId };

      try {
        await employeeService.deleteEmployee(payload);
        patchState(store, { isLoading: false });
        return true;
      } catch (e: unknown) {
        patchState(store, {
          isLoading: false,
          statusSaveMessage: (e as Error).message || 'Error deleting employee.',
        });
        return false;
      }
    };

    return {
      loadRoles,
      loadEmployees,
      loadEmployee,
      createEmployee,
      updateEmployee,
      deleteEmployee,
    };
  })
);
