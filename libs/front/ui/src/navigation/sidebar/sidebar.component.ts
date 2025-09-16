import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { LayoutStore } from '../../marco/layout';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuSectionComponent } from '../menu-section';

@Component({
  selector: 'ui-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NgOptimizedImage, MenuSectionComponent],
})
export class SidebarComponent {
  layoutStore = inject(LayoutStore);
  openSubmenu = signal<string | null>(null);

  toggleSubmenu(event: { section: string; index: number }) {
    const key = `${event.section}-${event.index}`;
    this.openSubmenu.set(this.openSubmenu() === key ? null : key);
  }
}
