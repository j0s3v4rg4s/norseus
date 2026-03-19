import { create } from 'zustand';
import type { FacilityModel, EmployeeModel } from '@models/facility';
import { getEmployeeFacilities } from '@front/facility';
import { getEmployee } from '@front/employees';
import { db } from '../firebase';

interface SessionState {
  facilities: FacilityModel[];
  selectedFacility: FacilityModel | null;
  currentEmployee: EmployeeModel | null;
  loading: boolean;
  completed: boolean;
  error: string | null;
  loadFacilities: (userId: string) => Promise<void>;
  setSelectedFacility: (facility: FacilityModel, userId: string) => Promise<void>;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  facilities: [],
  selectedFacility: null,
  currentEmployee: null,
  loading: false,
  error: null,
  completed: false,

  loadFacilities: async (userId: string) => {
    if (get().facilities.length > 0) return;

    set({ loading: true, error: null });
    try {
      const facilities = await getEmployeeFacilities(db, userId);
      const selectedFacility = facilities[0] ?? null;
      let currentEmployee: EmployeeModel | null = null;

      if (selectedFacility) {
        currentEmployee = (await getEmployee(db, selectedFacility.id as string, userId)) ?? null;
      }

      set({
        facilities,
        selectedFacility,
        currentEmployee,
        loading: false,
        completed: true,
      });
    } catch (error) {
      console.error('Error loading facilities:', error);
      set({
        loading: false,
        error: 'Failed to load facilities',
        completed: true,
      });
    }
  },

  setSelectedFacility: async (facility: FacilityModel, userId: string) => {
    set({ selectedFacility: facility, currentEmployee: null });
    const employee = (await getEmployee(db, facility.id as string, userId)) ?? null;
    set({ currentEmployee: employee });
  },

  resetSession: () => {
    set({ facilities: [], selectedFacility: null, currentEmployee: null, loading: false, error: null, completed: false });
  },
}));
