import { create } from 'zustand';
import type { FacilityModel } from '@models/facility';
import { getEmployeeFacilities } from '@front/facility';
import { db } from '../firebase';

interface SessionState {
  facilities: FacilityModel[];
  selectedFacility: FacilityModel | null;
  loading: boolean;
  error: string | null;
  loadFacilities: (userId: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  facilities: [],
  selectedFacility: null,
  loading: false,
  error: null,

  loadFacilities: async (userId: string) => {
    if (get().facilities.length > 0) return;

    set({ loading: true, error: null });
    try {
      const facilities = await getEmployeeFacilities(db, userId);
      set({
        facilities,
        selectedFacility: facilities[0] ?? null,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: 'Failed to load facilities',
      });
    }
  },
}));
