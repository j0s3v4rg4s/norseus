import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ServiceSchedule } from '@models/services';
import { DAY_OF_WEEK_LABELS } from '@models/common';
import { ButtonComponent } from '@ui';
import { SchedulesStore } from '../../schedules.store';

export interface ScheduleEditModalData {
  schedule: ServiceSchedule;
  listSchedules: ServiceSchedule[];
  facilityId: string;
  serviceId: string;
}

@Component({
  selector: 'app-schedule-edit-modal',
  imports: [ReactiveFormsModule, MatDialogModule, ButtonComponent],
  templateUrl: './schedule-edit-modal.component.html',
  styleUrls: ['./schedule-edit-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SchedulesStore],
})
export class ScheduleEditModalComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ScheduleEditModalComponent>);
  private data = inject(MAT_DIALOG_DATA) as ScheduleEditModalData;
  private schedulesStore = inject(SchedulesStore);

  readonly DAY_OF_WEEK_LABELS = DAY_OF_WEEK_LABELS;

  schedule = this.data.schedule;
  listSchedules = this.data.listSchedules;
  facilityId = this.data.facilityId;
  serviceId = this.data.serviceId;
  errorMessage = signal('');
  isLoading = signal(false);

  form: FormGroup;
  isSaving = false;

  constructor() {
    this.form = this.fb.group({
      startTime: [this.schedule.startTime, [Validators.required]],
      duration: [this.schedule.durationMinutes, [Validators.required, Validators.min(1), Validators.max(1440)]],
      capacity: [this.schedule.capacity, [Validators.required, Validators.min(1)]],
      minReserveMinutes: [this.schedule.minReserveMinutes, [Validators.required, Validators.min(0)]],
      minCancelMinutes: [this.schedule.minCancelMinutes, [Validators.required, Validators.min(0)]],
      isActive: [this.schedule.isActive],
    });
  }

  async onSave() {
    this.isLoading.set(true);
    const newSchedule: ServiceSchedule = {
      ...this.schedule,
      startTime: this.form.get('startTime')?.value,
      durationMinutes: this.form.get('duration')?.value,
      capacity: this.form.get('capacity')?.value,
      minReserveMinutes: this.form.get('minReserveMinutes')?.value,
      minCancelMinutes: this.form.get('minCancelMinutes')?.value,
      isActive: this.form.get('isActive')?.value,
    };

    const actualSchedule = this.listSchedules.filter((schedule) => schedule.id !== newSchedule.id);
    const conflictError = this.schedulesStore.checkScheduleConflicts(actualSchedule, [newSchedule]);
    if (conflictError) {
      this.errorMessage.set(conflictError);
      this.isLoading.set(false);
      return;
    }
    this.dialogRef.close({action: 'update', schedule: newSchedule});

  }

  async onDelete() {
    this.dialogRef.close({action: 'delete', schedule: this.schedule});
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
