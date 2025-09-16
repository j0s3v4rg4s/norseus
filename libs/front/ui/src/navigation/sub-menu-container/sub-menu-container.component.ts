import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../marco/layout/models/menu.model';
import { MenuItemLinkComponent } from '../menu-item-link';

@Component({
  selector: 'ui-sub-menu-container',
  templateUrl: './sub-menu-container.component.html',
  styleUrl: './sub-menu-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MenuItemLinkComponent],
  standalone: true,
})
export class SubMenuContainerComponent {
  // Inputs usando signals
  isOpen = input.required<boolean>();
  items = input.required<MenuItem[]>();
}
