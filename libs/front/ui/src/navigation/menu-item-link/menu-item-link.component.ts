import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from '../../marco/layout/models/menu.model';

@Component({
  selector: 'ui-menu-item-link',
  templateUrl: './menu-item-link.component.html',
  styleUrl: './menu-item-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  standalone: true,
})
export class MenuItemLinkComponent {
  // Inputs usando signals
  item = input.required<MenuItem>();
  isActive = input<boolean>(false);

  // Computed properties para facilitar el template
  get isExternal(): boolean {
    return this.item().isExternal ?? false;
  }

  get route(): string | undefined {
    return this.item().route;
  }

  get label(): string {
    return this.item().label;
  }

  get icon(): string {
    return this.item().icon;
  }
}
