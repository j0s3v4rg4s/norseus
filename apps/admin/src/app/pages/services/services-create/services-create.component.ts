import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ButtonComponent, DaySelectorComponent, SelectModule, SwitchOption, SwitchSelectorComponent, TooltipModule } from '@ui';
import { SessionSignalStore } from '@front/state/session';
import { ServicesService } from '@front/core/services';
import { Service } from '@models/services';
import { Timestamp } from 'firebase/firestore';
import { LoggerService } from '@front/utils/logger';
import { DAYS_OF_WEEK } from '@models/common';

@Component({
  selector: 'app-services-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, SelectModule, ButtonComponent, DaySelectorComponent, TooltipModule, SwitchSelectorComponent],
  templateUrl: './services-create.component.html',
  styleUrls: ['./services-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesCreateComponent {
  private router = inject(Router);
  private sessionStore = inject(SessionSignalStore);
  private fb = inject(FormBuilder);
  private servicesService = inject(ServicesService);
  private logger = inject(LoggerService);
  DAYS_OF_WEEK = [...DAYS_OF_WEEK];

  form: FormGroup;
  isLoading = false;
  errorMessage = '';

  minReserveTooltip =
    'Los usuarios solo podrán reservar si faltan al menos estos minutos para que inicie la clase. Por ejemplo, si se coloca 10, las reservas se cierran 10 minutos antes de que comience la clase.';
  minCancelTooltip =
    'Los usuarios solo podrán cancelar si faltan al menos estos minutos para que inicie la clase. Por ejemplo, si se coloca 10, las cancelaciones se cierran 10 minutos antes de que comience la clase.';

  readonly typeSchedule: SwitchOption<string>[] = [
    {name: 'Horario unico', value: 'single'},
    {name: 'Rangos de horarios', value: 'multiple'},
  ]

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  async saveService() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const facility = this.sessionStore.selectedFacility();
    if (!facility) {
      this.errorMessage = 'No se ha seleccionado una instalación';
      this.isLoading = false;
      return;
    }

    const { name, description } = this.form.value;
    const serviceData: Omit<Service, 'id'> = {
      name,
      description: description || undefined,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    try {
      await this.servicesService.createService(facility.id as string, serviceData).toPromise();
      this.router.navigate(['/home/services']);
    } catch (error) {
      this.errorMessage = 'Error al crear el servicio. Intente nuevamente.';
      this.logger.error('Error creating service:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
