import { Component, ChangeDetectionStrategy, input, inject, viewChild, ElementRef, AfterViewInit, signal } from '@angular/core';
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
export class SubMenuContainerComponent implements AfterViewInit {
  isOpen = input.required<boolean>();
  items = input.required<MenuItem[]>();
  layoutStore = inject(LayoutStore);
  subMenuList = viewChild<ElementRef<HTMLUListElement>>('subMenuList');
  subMenuListHeight = signal<number>(0);

  get isExpanded(): boolean {
    return this.layoutStore.visibleLargeMenu();
  }

  ngAfterViewInit(): void {
    const element = this.subMenuList()?.nativeElement;
    if (element) {
      this.subMenuListHeight.set(element.clientHeight);
    }
  }
}
