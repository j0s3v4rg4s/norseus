import {
  Component,
  inject,
  viewChild,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { MenuItem } from './models/menu.model';
import { NavItemComponent } from '../../actions';
import { Router } from '@angular/router';

@Component({
  selector: 'ui-layout',
  imports: [MatSidenavModule, NavItemComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  readonly menuTitle = input<string>('');
  readonly menuItems = input<MenuItem[]>([]);

  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);

  private readonly sideNav = viewChild<MatSidenav>('sideNav');

  readonly isHandset = toSignal(
    this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  readonly currentUrl = toSignal(
    this.router.events.pipe(map(() => this.router.url)),
    { initialValue: this.router.url },
  );

  isMenuItemActive = (item: MenuItem) => {
    const url = this.currentUrl();
    return url.includes(item.route);
  };

  toggleSidenav() {
    if (this.isHandset()) {
      this.sideNav()?.toggle();
    }
  }
  closeSidenav() {
    if (this.isHandset()) {
      this.sideNav()?.close();
    }
  }
  openSidenav() {
    if (this.isHandset()) {
      this.sideNav()?.open();
    }
  }
}
