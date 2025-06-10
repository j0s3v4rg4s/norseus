import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent, MenuItem } from '@ui';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, LayoutComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly menuItems: MenuItem[] = [
    { label: 'Home', icon: 'home', route: '/home' },
    { label: 'About', icon: 'info', route: '/about' },
    { label: 'Permisos', icon: 'lock', route: '/home/permissions' },
  ];
}
