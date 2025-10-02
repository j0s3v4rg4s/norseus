import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ServiceSchedule } from '@models/services';
import { DAY_OF_WEEK_LABELS } from '@models/common';
import { ButtonComponent } from '@ui';

export interface ScheduleEditModalData {
  schedule: ServiceSchedule;
  facilityId: string;
  serviceId: string;
}

@Component({
  selector: 'app-schedule-edit-modal',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, ButtonComponent],
  templateUrl: './schedule-edit-modal.component.html',
  styleUrls: ['./schedule-edit-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleEditModalComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ScheduleEditModalComponent>);
  private data = inject(MAT_DIALOG_DATA) as ScheduleEditModalData;

  readonly DAY_OF_WEEK_LABELS = DAY_OF_WEEK_LABELS;

  schedule = this.data.schedule;
  facilityId = this.data.facilityId;
  serviceId = this.data.serviceId;

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


  onSave(): void {
   // TODO: Implementar lógica de guardado
  }

  onDelete(): void {
    // TODO: Implementar lógica de eliminación
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
