import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@p1kka/ui/src/actions';
import { LayoutComponent, MenuItem } from '@ui';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ButtonComponent, LayoutComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly menuItems: MenuItem[] = [
    { label: 'Home', icon: 'home', route: '/home' },
    { label: 'About', icon: 'info', route: '/about' },
  ];
}
