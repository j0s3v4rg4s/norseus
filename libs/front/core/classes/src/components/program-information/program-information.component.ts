import { ChangeDetectionStrategy, Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceSchedule } from '@models/services';
import { ProgramDraft } from '@models/classes';
import { ClassWeekCalendarComponent, ClassCalendarSlot, CalendarColor } from '@ui';

@Component({
  selector: 'lib-program-information',
  templateUrl: './program-information.component.html',
  styleUrls: ['./program-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ClassWeekCalendarComponent],
})
export class ProgramInformationComponent {
  programs = input.required<ProgramDraft[]>();
  dateCalendarSlots = input.required<ClassCalendarSlot<ServiceSchedule>[]>();
  isEditingExistingProgram = input.required<boolean>();

  programCreate = output<void>();
  programEdit = output<string>();
  programUpdate = output<{ programId: string; title?: string; slotIds?: string[] }>();
  programConfirm = output<string>();
  programDelete = output<string>();
  programCancelEdit = output<string>();
  weekChange = output<{ start: Date; end: Date }>();
  daySelect = output<ClassCalendarSlot<ServiceSchedule>[]>();

  programTitle = '';

  confirmedPrograms = computed(() => this.programs().filter((p) => p.isConfirmed));
  activeProgram = computed(() => this.programs().find((p) => !p.isConfirmed) || null);

  selectedSlotsCount = computed(() => this.activeProgram()?.slotIds.length || 0);

  canConfirm = computed(() => {
    const active = this.activeProgram();
    return active && this.programTitle.trim() !== '' && active.slotIds.length > 0;
  });

  minDate = signal<Date>(new Date());
  maxDate = signal<Date>(
    (() => {
      const today = new Date();
      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(today.getDate() + (7 - today.getDay() + 1));
      const lastDayOfNextWeek = new Date(nextWeekStart);
      lastDayOfNextWeek.setDate(nextWeekStart.getDate() + 6);
      lastDayOfNextWeek.setHours(23, 59, 59, 999);
      return lastDayOfNextWeek;
    })(),
  );

  onCreateNewProgram(): void {
    this.programTitle = '';
    this.programCreate.emit();
  }

  onEditProgram(programId: string): void {
    const program = this.programs().find((p) => p.id === programId);
    if (program) {
      this.programTitle = program.title;
    }
    this.programEdit.emit(programId);
  }

  onTitleChange(): void {
    const active = this.activeProgram();
    if (active) {
      this.programUpdate.emit({
        programId: active.id,
        title: this.programTitle,
      });
    }
  }

  onConfirmProgram(): void {
    const active = this.activeProgram();
    if (active) {
      this.programConfirm.emit(active.id);
      this.programTitle = '';
    }
  }

  onCancelProgram(): void {
    const active = this.activeProgram();
    if (!active) return;

    if (this.isEditingExistingProgram()) {
      this.programCancelEdit.emit(active.id);
    } else {
      this.programDelete.emit(active.id);
    }

    this.programTitle = '';
  }

  onDeleteProgram(programId: string): void {
    this.programDelete.emit(programId);
    this.programTitle = '';
  }

  onSlotClick(slot: ClassCalendarSlot<ServiceSchedule>): void {
    const active = this.activeProgram();
    if (!active || slot.color === CalendarColor.GREEN) return;

    const slotIds = [...active.slotIds];
    const index = slotIds.indexOf(slot.id);

    if (index > -1) {
      slotIds.splice(index, 1);
    } else {
      slotIds.push(slot.id);
    }

    this.programUpdate.emit({
      programId: active.id,
      slotIds,
    });
  }

  onWeekChange(weekRange: { start: Date; end: Date }): void {
    this.weekChange.emit(weekRange);
  }

  onDaySelect(slots: ClassCalendarSlot<ServiceSchedule>[]): void {
    const active = this.activeProgram();
    if (!active) return;

    const availableSlots = slots.filter((s) => s.color !== CalendarColor.GREEN);
    if (availableSlots.length === 0) return;

    const slotIds = [...active.slotIds];
    const allSelected = availableSlots.every((s) => slotIds.includes(s.id));

    if (allSelected) {
      availableSlots.forEach((s) => {
        const index = slotIds.indexOf(s.id);
        if (index > -1) {
          slotIds.splice(index, 1);
        }
      });
    } else {
      availableSlots.forEach((s) => {
        if (!slotIds.includes(s.id)) {
          slotIds.push(s.id);
        }
      });
    }

    this.programUpdate.emit({
      programId: active.id,
      slotIds,
    });
  }
}
