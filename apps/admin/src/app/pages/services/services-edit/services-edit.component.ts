import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { ButtonComponent, WeekCalendarComponent } from '@ui';
import { SessionSignalStore } from '@front/state/session';
import { ServicesStore } from '../services.store';
import { SchedulesStore } from '../schedules.store';
import { ScheduleFormComponent, ScheduleFormData } from '../common/schedule-form';
import { ScheduleEditModalComponent, ScheduleEditModalData } from '../common/schedule-edit-modal';
import { ServiceSchedule } from '@models/services';


@Component({
  selector: 'app-services-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, ButtonComponent, WeekCalendarComponent, ScheduleFormComponent],
  providers: [ServicesStore, SchedulesStore],
  templateUrl: './services-edit.component.html',
  styleUrls: ['./services-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesEditComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sessionStore = inject(SessionSignalStore);
  private fb = inject(FormBuilder);
  private servicesStore = inject(ServicesStore);
  private schedulesStore = inject(SchedulesStore);
  private dialog = inject(MatDialog);

  form: FormGroup;
  isLoading = this.servicesStore.isLoadingService;
  isSaving = this.servicesStore.isSaving;
  isDeleting = this.servicesStore.isDeleting;
  errorMessage = this.servicesStore.error;
  currentService = this.servicesStore.currentService;
  currentServiceSchedules = this.schedulesStore.schedules;
  conflictError = this.schedulesStore.conflictError;
  calendarSlots = this.schedulesStore.calendarSlots;
  internalErrorMessage = signal('');

  showErrorMessage = computed(() => this.internalErrorMessage() || this.errorMessage());

  scheduleFormComponent = viewChild(ScheduleFormComponent);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
    });

    effect(() => {
      const loading = this.sessionStore.loading();
      const facility = this.sessionStore.selectedFacility();
      const serviceId = this.route.snapshot.paramMap.get('id');

      if (!loading && facility && facility.id && serviceId) {
        this.servicesStore.loadService({ facilityId: facility.id, serviceId });
        this.schedulesStore.loadSchedules({ facilityId: facility.id, serviceId });
      }
    });

    effect(() => {
      const service = this.currentService();
      if (service) {
        this.form.patchValue({
          name: service.name,
          description: service.description || '',
        });
      }
    });
  }

  onScheduleFormSubmit(formData: ScheduleFormData): void {
    const success = this.schedulesStore.createSchedules(formData);
    if (success) {
      this.scheduleFormComponent()?.resetForm();
    }
  }

  onSlotClick(slotId: string): void {
    const schedule = this.schedulesStore.schedulesMap().get(slotId);
    const facility = this.sessionStore.selectedFacility();
    const serviceId = this.route.snapshot.paramMap.get('id');

    if (schedule && facility?.id && serviceId) {
      this.openScheduleModal(schedule, facility.id, serviceId);
    }
  }

  private openScheduleModal(schedule: ServiceSchedule, facilityId: string, serviceId: string): void {
    const dialogRef = this.dialog.open(ScheduleEditModalComponent, {
      data: {
        schedule,
        facilityId,
        serviceId,
      } as ScheduleEditModalData,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(() => {
      // Modal closed, no additional action needed for now
    });
  }

  saveService(): void {
    // TODO: Implement save service
  }
}
