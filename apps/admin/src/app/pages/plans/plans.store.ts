import { signalStore, withState } from '@ngrx/signals';

export interface PlansState {
  loading: boolean;
  error: string | null;
}

export const initialState: PlansState = {
  loading: false,
  error: null,
};

export const PlansStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
);
