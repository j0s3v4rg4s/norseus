import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { LayoutStore } from '../../marco/layout';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuSectionComponent } from '../menu-section';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'ui-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NgOptimizedImage, MenuSectionComponent],
  animations: [
    trigger('logoSlide', [
      state('in', style({ transform: 'translateX(0)', opacity: 1 })),
      state('out', style({ transform: 'translateX(-100%)', opacity: 0 })),
      transition('void => in', [style({ transform: 'translateX(-100%)', opacity: 0 }), animate('400ms ease-out')]),
      transition('in => out', [animate('300ms ease-in')]),
      transition('out => in', [style({ transform: 'translateX(-100%)', opacity: 0 }), animate('400ms ease-out')]),
    ]),
    trigger('iconSlide', [
      state('in', style({ transform: 'translateX(0)', opacity: 1 })),
      state('out', style({ transform: 'translateX(100%)', opacity: 0 })),
      transition('void => in', [style({ transform: 'translateX(100%)', opacity: 0 }), animate('600ms ease-out')]),
      transition('in => out', [animate('500ms ease-in')]),
      transition('out => in', [style({ transform: 'translateX(100%)', opacity: 0 }), animate('600ms ease-out')]),
    ]),
  ],
})
export class SidebarComponent {
  layoutStore = inject(LayoutStore);
  openSubmenu = signal<string | null>(null);
  private breakpointObserver = inject(BreakpointObserver);

  private readonly isLargeScreen = toSignal(
    this.breakpointObserver.observe('(min-width: 1280px)').pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  logoExpandedState = computed(() => {
    if (!this.isLargeScreen()) {
      return this.layoutStore.logo() ? 'in' : 'out';
    }
    return this.layoutStore.visibleLargeMenu() && this.layoutStore.logo() ? 'in' : 'out';
  });

  logoCollapsedState = computed(() => {
    if (!this.isLargeScreen()) {
      return 'out';
    }
    return !this.layoutStore.visibleLargeMenu() && this.layoutStore.icon() ? 'in' : 'out';
  });

  toggleSubmenu(event: { section: string; index: number }) {
    const key = `${event.section}-${event.index}`;
    this.openSubmenu.set(this.openSubmenu() === key ? null : key);
  }

  closeSidebar() {
    this.layoutStore.setMobileOpen(false);
  }
}
