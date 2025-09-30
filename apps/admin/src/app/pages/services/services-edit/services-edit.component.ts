import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-services-edit',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './services-edit.component.html',
  styleUrls: ['./services-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesEditComponent {
}
