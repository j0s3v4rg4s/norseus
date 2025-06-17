import { Injectable, computed, inject, signal } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Profile, Facility, SUPABASE } from '@front/supabase';

export interface ProfileState {
  profile: Profile | null;
  facility: Facility | null;
  loading: boolean;
  error: unknown | null;
}

const initialState: ProfileState = {
  profile: null,
  facility: null,
  loading: false,
  error: null,
};

export const ProfileSignalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, supabase = inject(SUPABASE)) => ({
    async loadProfile(userId: string) {
      patchState(store, { loading: true, error: null });
      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: facilities, error: facilitiesError } = await supabase.from('facility').select('*');

      if (profileError || facilitiesError) {
        patchState(store, { error: profileError || facilitiesError || null, loading: false });
        return;
      }
      patchState(store, { profile, facility: facilities[0] || null, loading: false });
    },
  })),
);
