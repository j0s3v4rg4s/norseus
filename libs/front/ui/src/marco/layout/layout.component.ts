import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { MenuItem } from './models/menu.model';
import { LayoutStore } from './layout.store';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../../navigation";

@Component({
  selector: 'ui-layout',
  imports: [MatSidenavModule, CommonModule, SidebarComponent, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  /* ************************************************************************** */
  /* * PUBLIC INPUTS AND OUTPUTS                                              * */
  /* ************************************************************************** */

  /* ************************************************************************** */
  /* * PRIVATE VIEW QUERIES                                                   * */
  /* ************************************************************************** */

  private readonly sideNav = viewChild<MatSidenav>('sideNav');

  /* ************************************************************************** */
  /* * PRIVATE INJECTIONS                                                     * */
  /* ************************************************************************** */

  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  layoutStore = inject(LayoutStore);

  /* ************************************************************************** */
  /* * PUBLIC SIGNALS                                                         * */
  /* ************************************************************************** */

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

  /* ************************************************************************** */
  /* * PUBLIC METHODS                                                         * */
  /* ************************************************************************** */

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

  toggleSidenav() {
    if (this.isHandset()) {
      this.sideNav()?.toggle();
    }
  }
}
