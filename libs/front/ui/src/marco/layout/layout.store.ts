import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals'
import { MenuItem } from './models/menu.model';
import { computed } from '@angular/core';

type LayoutState = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  title: string | null;
  menuItems: MenuItem[];
  logo: string | null;
  icon: string | null;
}

const initialState: LayoutState  ={
  isExpanded: false,
  isMobileOpen: false,
  menuItems: [],
  logo: null,
  title: null,
  icon: null,
}

export const LayoutStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(store => ({
    visibleLargeMenu: computed(() => store.isExpanded() || store.isMobileOpen()),
  })),
  withMethods(store => ({
    setExpanded: (value: boolean) => patchState(store, { isExpanded: value }),
    toggleExpanded: () => patchState(store, { isExpanded: !store.isExpanded() }),
    setMobileOpen: (value: boolean) => patchState(store, { isMobileOpen: value }),
    toggleMobileOpen: () => patchState(store, { isMobileOpen: !store.isMobileOpen() }),
    setTitle: (value: string) => patchState(store, { title: value }),
    setMenuItems: (value: MenuItem[]) => patchState(store, { menuItems: value }),
    setLogo: (value: string) => patchState(store, { logo: value }),
    setIcon: (value: string) => patchState(store, { icon: value }),
  }))
)
