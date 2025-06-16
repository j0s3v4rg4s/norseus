import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@p1kka/ui/src/actions';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-permissions-list',
  imports: [CommonModule, ButtonComponent, RouterModule],
  templateUrl: './permissions-list.component.html',
  styleUrls: ['./permissions-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsListComponent {}
