import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../marco/layout/models/menu.model';
import { MenuItemLinkComponent } from '../menu-item-link';
import { LayoutStore } from '../../marco/layout/layout.store';

@Component({
  selector: 'ui-sub-menu-container',
  templateUrl: './sub-menu-container.component.html',
  styleUrl: './sub-menu-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MenuItemLinkComponent],
  standalone: true,
})
export class SubMenuContainerComponent {
  isOpen = input.required<boolean>();
  items = input.required<MenuItem[]>();
  layoutStore = inject(LayoutStore);

  get isExpanded(): boolean {
    return this.layoutStore.visibleLargeMenu();
  }
}
