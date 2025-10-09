import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  DaySelectorComponent,
  SelectModule,
  SwitchOption,
  SwitchSelectorComponent,
  TooltipModule,
} from '@ui';
import { DAYS_OF_WEEK, DAY_OF_WEEK_LABELS, DayOfWeek } from '@models/common';
import { timeToMinutes } from '@front/utils';

export interface ScheduleFormData {
  scheduleType: 'single' | 'multiple';
  days: DayOfWeek[];
  startTime: string;
  endTime?: string;
  duration: number;
  capacity: number;
  minReserveMinutes: number;
  minCancelMinutes: number;
}

/**
 * Custom validator to ensure start time is less than end time
 */
function startTimeBeforeEndTimeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startTime = control.get('startTime')?.value;
    const endTime = control.get('endTime')?.value;

    if (!startTime || !endTime) {
      return null;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      return { startTimeAfterEndTime: true };
    }

    return null;
  };
}

@Component({
  selector: 'app-schedule-form',
  imports: [
    ReactiveFormsModule,
    SelectModule,
    DaySelectorComponent,
    TooltipModule,
    SwitchSelectorComponent,
  ],
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleFormComponent {
  private fb = inject(FormBuilder);

  scheduleSubmit = output<ScheduleFormData>();

  DAYS_OF_WEEK = [...DAYS_OF_WEEK];
  DAY_OF_WEEK_LABELS = DAY_OF_WEEK_LABELS;

  scheduleForm: FormGroup;

  readonly typeSchedule: SwitchOption<string>[] = [
    { name: 'Horario unico', value: 'single' },
    { name: 'Rangos de horarios', value: 'multiple' },
  ];

  minReserveTooltip =
    'Los usuarios solo podrán reservar si faltan al menos estos minutos para que inicie la clase. Por ejemplo, si se coloca 10, las reservas se cierran 10 minutos antes de que comience la clase.';
  minCancelTooltip =
    'Los usuarios solo podrán cancelar si faltan al menos estos minutos para que inicie la clase. Por ejemplo, si se coloca 10, las cancelaciones se cierran 10 minutos antes de que comience la clase.';

  constructor() {
    this.scheduleForm = this.fb.group({
      scheduleType: ['single'],
      singleDay: ['', Validators.required],
      multipleDays: [[]],
      startTime: ['', Validators.required],
      endTime: [''],
      duration: ['', [Validators.required, Validators.min(1)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      minReserveMinutes: ['', [Validators.required, Validators.min(0)]],
      minCancelMinutes: ['', [Validators.required, Validators.min(0)]],
    }, { validators: startTimeBeforeEndTimeValidator() });

    this.setupDynamicValidations();
  }

  private setupDynamicValidations(): void {
    this.scheduleForm
      .get('scheduleType')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((type) => {
        const singleDayControl = this.scheduleForm.get('singleDay');
        const multipleDaysControl = this.scheduleForm.get('multipleDays');
        const endTimeControl = this.scheduleForm.get('endTime');

        if (type === 'single') {
          singleDayControl?.setValidators([Validators.required]);
          multipleDaysControl?.clearValidators();
          endTimeControl?.clearValidators();

          multipleDaysControl?.setValue([]);
          endTimeControl?.setValue('');
        } else {
          singleDayControl?.clearValidators();
          multipleDaysControl?.setValidators([Validators.required]);
          endTimeControl?.setValidators([Validators.required]);

          singleDayControl?.setValue('');
        }

        singleDayControl?.updateValueAndValidity();
        multipleDaysControl?.updateValueAndValidity();
        endTimeControl?.updateValueAndValidity();
      });
  }

  submitSchedule(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    const scheduleType = this.scheduleForm.get('scheduleType')?.value;
    const singleDay = this.scheduleForm.get('singleDay')?.value;
    const multipleDays = this.scheduleForm.get('multipleDays')?.value;
    const days = scheduleType === 'single' ? [singleDay] : multipleDays;

    const formData: ScheduleFormData = {
      scheduleType,
      days,
      startTime: this.scheduleForm.get('startTime')?.value,
      endTime: this.scheduleForm.get('endTime')?.value,
      duration: Number(this.scheduleForm.get('duration')?.value),
      capacity: Number(this.scheduleForm.get('capacity')?.value),
      minReserveMinutes: Number(this.scheduleForm.get('minReserveMinutes')?.value),
      minCancelMinutes: Number(this.scheduleForm.get('minCancelMinutes')?.value),
    };

    this.scheduleSubmit.emit(formData);
  }

  resetForm(): void {
    this.scheduleForm.reset({ scheduleType: 'single' });
  }
}
