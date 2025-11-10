import { ChangeDetectionStrategy, Component, input, output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule, ClassCalendarSlot } from '@ui';
import { EmployeeModel } from '@models/facility';
import { ProgramDraft } from '@models/classes';
import { ServiceSchedule } from '@models/services';
import { MONTH_LABELS } from '@models/common';

interface ProgramSlot {
  slotId: string;
  slot: ClassCalendarSlot<ServiceSchedule>;
  instructorId: string | null;
}

interface GroupedSlots {
  dayKey: string;
  dayLabel: string;
  slots: ProgramSlot[];
}

@Component({
  selector: 'lib-coach-assignment',
  templateUrl: './coach-assignment.component.html',
  styleUrls: ['./coach-assignment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectModule, FormsModule],
})
export class CoachAssignmentComponent {
  programs = input.required<ProgramDraft[]>();
  employees = input.required<EmployeeModel[]>();
  dateCalendarSlots = input.required<ClassCalendarSlot<ServiceSchedule>[]>();

  coachAssignment = output<{ programId: string; slotId: string; instructorId: string }>();
  sameCoachForAll = output<{ programId: string; instructorId: string }>();
  clearCoachAssignment = output<{ programId: string; instructorId: string }>();

  selectedCoachPerProgram = signal<Record<string, string>>({});

  dateCalendarSlotsMap = computed(() => {
    return this.dateCalendarSlots().reduce(
      (acc, slot) => {
        acc[slot.id] = slot;
        return acc;
      },
      {} as Record<string, ClassCalendarSlot<ServiceSchedule>>,
    );
  });

  getGroupedSlotsForProgram(program: ProgramDraft): GroupedSlots[] {
    const slotsMap = this.dateCalendarSlotsMap();
    const programSlots: ProgramSlot[] = program.slotIds.map((slotId) => ({
      slotId,
      slot: slotsMap[slotId],
      instructorId: program.coachAssignments[slotId] || null,
    }));

    const grouped = programSlots.reduce(
      (acc, programSlot) => {
        if (!programSlot.slot) return acc;

        const date = programSlot.slot.date;
        const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        if (!acc[dayKey]) {
          acc[dayKey] = {
            dayKey,
            dayLabel: this.formatDayLabel(date),
            slots: [],
          };
        }

        acc[dayKey].slots.push(programSlot);
        return acc;
      },
      {} as Record<string, GroupedSlots>,
    );

    const result = Object.values(grouped).sort((a, b) => a.dayKey.localeCompare(b.dayKey));

    result.forEach((group) => {
      group.slots.sort((a, b) => {
        const timeA = a.slot.startTime.split(':').map(Number);
        const timeB = b.slot.startTime.split(':').map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
      });
    });

    return result;
  }

  formatDayLabel(date: Date): string {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = Object.values(MONTH_LABELS);

    const dayName = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    const monthName = monthNames[date.getMonth()];

    return `${dayName} ${dayNumber} de ${monthName}`;
  }

  onCoachSelection(programId: string, slotId: string, instructorId: string | Event): void {
    this.coachAssignment.emit({
      programId,
      slotId,
      instructorId: instructorId as string,
    });
  }

  onAssignCoachToProgram(programId: string): void {
    const selectedCoaches = this.selectedCoachPerProgram();
    const instructorId = selectedCoaches[programId];

    if (instructorId) {
      this.sameCoachForAll.emit({ programId, instructorId });
    }
  }

  onClearProgramCoaches(programId: string): void {
    const selectedCoaches = this.selectedCoachPerProgram();
    const instructorId = selectedCoaches[programId];

    if (instructorId) {
      this.clearCoachAssignment.emit({ programId, instructorId });
    }
  }

  onCoachSelectChange(programId: string, value: string): void {
    const current = this.selectedCoachPerProgram();
    this.selectedCoachPerProgram.set({
      ...current,
      [programId]: value,
    });
  }

  getSelectedCoach(programId: string): string {
    return this.selectedCoachPerProgram()[programId] || '';
  }
}

