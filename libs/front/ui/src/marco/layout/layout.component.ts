import {
  Component,
  inject,
  viewChild,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavItemComponent } from '@p1kka/ui/src/actions';
import { MenuItem } from './models/menu.model';

@Component({
  selector: 'ui-layout',
  imports: [CommonModule, MatSidenavModule, NavItemComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  readonly menuItems = input<MenuItem[]>([]);

  private breakpointObserver = inject(BreakpointObserver);

  private readonly sideNav = viewChild<MatSidenav>('sideNav');

  readonly isHandset = toSignal(
    this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

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
