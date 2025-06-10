import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@p1kka/ui/src/actions';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsComponent {}
