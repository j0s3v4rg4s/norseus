import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../marco/layout';
import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'ui-nav-item',
  imports: [CommonModule, RouterModule, MatRippleModule],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss',
})
export class NavItemComponent {
  isActive = input<boolean>(false);
  item = input.required<MenuItem>();
}
