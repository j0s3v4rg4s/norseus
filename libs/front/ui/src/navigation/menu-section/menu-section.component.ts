import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../marco/layout/models/menu.model';
import { MenuItemLinkComponent } from '../menu-item-link';
import { SubMenuContainerComponent } from '../sub-menu-container';

@Component({
  selector: 'ui-menu-section',
  templateUrl: './menu-section.component.html',
  styleUrl: './menu-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MenuItemLinkComponent, SubMenuContainerComponent],
  standalone: true,
})
export class MenuSectionComponent {
  title = input.required<string>();
  items = input.required<MenuItem[]>();
  isExpanded = input<boolean>(true);
  section = input.required<string>();
  openSubmenu = input<string | null>(null);
  toggleSubmenu = output<{ section: string; index: number }>();

  handleToggleSubmenu(index: number): void {
    this.toggleSubmenu.emit({
      section: this.section(),
      index: index,
    });
  }
}
