import { Component, input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DayOfWeek, DAY_OF_WEEK_LABELS } from '@models/common';

@Component({
  selector: 'ui-day-selector',
  imports: [CommonModule],
  templateUrl: './day-selector.component.html',
  styleUrl: './day-selector.component.scss',
})
export class DaySelectorComponent implements ControlValueAccessor {
  availableDays = input<DayOfWeek[]>([]);
  selectedDays = signal<Set<DayOfWeek>>(new Set());
  disabled = signal<boolean>(false);
  displayDays = computed(() => this.availableDays());

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private onChange?: (value: DayOfWeek[]) => void;
  private onTouched?: () => void;
  private static nextId = 0;
  readonly uniqueId = 'ui-day-selector-' + DaySelectorComponent.nextId++;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(value: DayOfWeek[] | null): void {
    if (value && Array.isArray(value)) {
      this.selectedDays.set(new Set(value));
    } else {
      this.selectedDays.set(new Set());
    }
  }

  registerOnChange(fn: (value: DayOfWeek[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  toggleDay(day: DayOfWeek): void {
    if (this.disabled()) return;

    const currentSelection = this.selectedDays();
    const newSelection = new Set(currentSelection);

    if (newSelection.has(day)) {
      newSelection.delete(day);
    } else {
      newSelection.add(day);
    }

    this.selectedDays.set(newSelection);

    if (this.onChange) {
      this.onChange(Array.from(newSelection));
    }

    if (this.onTouched) {
      this.onTouched();
    }
  }

  isDaySelected(day: DayOfWeek): boolean {
    return this.selectedDays().has(day);
  }

  getDayLabel(day: DayOfWeek): string {
    return DAY_OF_WEEK_LABELS[day].substring(0, 3);
  }

  get hasError(): boolean {
    return (this.ngControl?.invalid && this.ngControl?.touched) || false;
  }
}
