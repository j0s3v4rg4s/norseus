import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutStore } from '../../marco/layout/layout.store';

@Component({
  selector: 'ui-header',
  imports: [CommonModule],
  templateUrl: './ui-header.component.html',
  styleUrl: './ui-header.component.scss'
})
export class UiHeaderComponent {
  layoutStore = inject(LayoutStore);

  toggleSidebar() {
    if(window.innerWidth >= 1280) {
      this.layoutStore.toggleExpanded();
    } else {
      this.layoutStore.toggleMobileOpen();
    }
  }

}
