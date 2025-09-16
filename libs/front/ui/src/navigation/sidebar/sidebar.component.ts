import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { LayoutStore } from '../../marco/layout';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ui-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
})
export class SidebarComponent {
  layoutStore = inject(LayoutStore);
  openSubmenu = signal<string | null>(null);

  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;
    this.openSubmenu.set(this.openSubmenu() === key ? null : key);
  }
}
