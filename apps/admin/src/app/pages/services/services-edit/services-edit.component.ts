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
import { Service, ServiceSchedule } from '@models/services';
import { filter } from 'rxjs';

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
        listSchedules: this.currentServiceSchedules(),
      } as ScheduleEditModalData,
      disableClose: false,
    });

    dialogRef
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe((data) => {
        if (data.action === 'update') {
          this.schedulesStore.updateSchedule(data.schedule);
        } else if (data.action === 'delete') {
          this.schedulesStore.deleteSchedule(data.schedule.id);
        }
      });
  }

  saveService(): void {
    const facilityId = this.sessionStore.selectedFacility()?.id;
    const service = this.servicesStore.currentService() as Service;
    const { name, description } = this.form.value;
    const newService: Service = {
      ...service,
      name,
      description: description || null,
    };

    if (facilityId && newService) {
      Promise.all([
        this.schedulesStore.saveListSchedules(facilityId, newService.id),
        this.servicesStore.updateService(facilityId, newService),
      ]).then(() => {
        this.router.navigate(['/home/services']);
      });
    }
  }
}
