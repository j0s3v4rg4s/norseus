import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';

import {
  ButtonComponent,
  ConfirmComponent,
  WeekCalendarComponent,
} from '@ui';
import { SessionSignalStore } from '@front/state/session';
import { ServicesStore } from '../services.store';
import { Service } from '@models/services';
import { Timestamp } from 'firebase/firestore';
import { LoggerService } from '@front/utils/logger';
import { SchedulesStore } from '../schedules.store';
import { ScheduleFormComponent, ScheduleFormData } from '../common/schedule-form';

@Component({
  selector: 'app-services-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    WeekCalendarComponent,
    MatDialogModule,
    ScheduleFormComponent,
  ],
  providers: [SchedulesStore, ServicesStore],
  templateUrl: './services-create.component.html',
  styleUrls: ['./services-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesCreateComponent {
  private router = inject(Router);
  private sessionStore = inject(SessionSignalStore);
  private fb = inject(FormBuilder);
  private logger = inject(LoggerService);
  private dialog = inject(MatDialog);
  private schedulesStore = inject(SchedulesStore);
  private servicesStore = inject(ServicesStore);

  form: FormGroup;
  isLoading = this.servicesStore.isSaving;
  errorMessage = this.servicesStore.error;
  internalErrorMessage = signal('');
  showErrorMessage = computed(() => this.internalErrorMessage() || this.errorMessage());
  schedules = this.schedulesStore.schedules;
  conflictError = this.schedulesStore.conflictError;
  calendarSlots = this.schedulesStore.calendarSlots;
  scheduleFormComponent = viewChild(ScheduleFormComponent);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  onScheduleFormSubmit(formData: ScheduleFormData): void {
    const success = this.schedulesStore.createSchedules(formData);
    if (success) {
      this.scheduleFormComponent()?.resetForm();
    }
  }

  handleScheduleClick(slotId: string): void {
    this.dialog
      .open(ConfirmComponent, {
        data: { message: '¿Estás seguro de querer eliminar este horario?' },
      })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => {
        this.schedulesStore.deleteSchedule(slotId);
      });
  }

  saveService(): void {
    this.internalErrorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const facility = this.sessionStore.selectedFacility();
    if (!facility) {
      this.internalErrorMessage.set('No se ha seleccionado una instalación');
      return;
    }

    const schedules = this.schedulesStore.schedules();

    if (schedules.length === 0) {
      this.internalErrorMessage.set('No se han creado horarios');
      return;
    }

    const { name, description } = this.form.value;
    const serviceData: Omit<Service, 'id'> = {
      name,
      description: description || null,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    this.servicesStore.createServiceWithSchedules(facility.id as string, serviceData, schedules).subscribe({
      next: () => {
        this.router.navigate(['/home/services']);
      }
    });
  }
}
