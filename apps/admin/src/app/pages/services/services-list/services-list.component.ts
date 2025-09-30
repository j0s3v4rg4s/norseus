import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [RouterModule, CdkTableModule],
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesListComponent {
  displayedColumns = ['name', 'description', 'isActive', 'actions'];
}
