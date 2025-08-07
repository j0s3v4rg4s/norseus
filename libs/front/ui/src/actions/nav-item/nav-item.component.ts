import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';

import { MenuItem } from '../../marco/layout';

@Component({
  selector: 'ui-nav-item',
  imports: [RouterModule, MatRippleModule],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss',
})
export class NavItemComponent {
  /* ************************************************************************** */
  /* * PUBLIC INPUTS AND OUTPUTS                                              * */
  /* ************************************************************************** */

  isActive = input<boolean>(false);
  item = input.required<MenuItem>();
}
