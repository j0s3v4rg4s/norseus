import { ChangeDetectionStrategy, Component, input, output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from '@ui';
import { EmployeeModel } from '@models/facility';
import { ClassModel } from '@models/classes';
import { DAY_OF_WEEK_LABELS, MONTH_LABELS } from '@models/common';

interface GroupedClasses {
  dayKey: string;
  dayLabel: string;
  classes: ClassModel[];
}

@Component({
  selector: 'lib-coach-assignment',
  templateUrl: './coach-assignment.component.html',
  styleUrls: ['./coach-assignment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectModule, FormsModule],
})
export class CoachAssignmentComponent {
  programClasses = input.required<ClassModel[]>();
  employees = input.required<EmployeeModel[]>();

  coachAssignment = output<{ classId: string; instructorId: string }>();
  sameCoachForAll = output<string>();
  clearCoachAssignment = output<string>();

  isSameCoachForAllEnabled = signal(false);
  selectedEmployeeForAll = signal<string>('');

  classCount = computed(() => this.programClasses().length);

  groupedClasses = computed(() => {
    const classes = this.programClasses();
    const grouped = classes.reduce((acc, cls) => {
      const date = new Date(cls.date.toDate());
      const dayKey = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();

      if (!acc[dayKey]) {
        acc[dayKey] = {
          dayKey,
          dayLabel: this.formatDayLabel(date),
          classes: []
        };
      }

      acc[dayKey].classes.push(cls);
      return acc;
    }, {} as Record<string, GroupedClasses>);

    return Object.values(grouped).sort((a, b) => a.dayKey.localeCompare(b.dayKey));
  });

  formatDayLabel(date: Date): string {
    const dayNames = Object.values(DAY_OF_WEEK_LABELS);
    const monthNames = Object.values(MONTH_LABELS);

    const dayName = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    const monthName = monthNames[date.getMonth()];

    return `${dayName} ${dayNumber} de ${monthName}`;
  }

  formatClass(cls: ClassModel): string {
    return `${cls.startAt} (${cls.duration} min)`;
  }

  getCapacity(cls: ClassModel): string {
    return cls.capacity.toString();
  }

  onCoachSelection(classId: string, instructorId: string | Event): void {
    this.coachAssignment.emit({ classId, instructorId: instructorId as string });
  }

  onSameCoachForAll() {
    this.sameCoachForAll.emit(this.selectedEmployeeForAll());
  }

  onClearCoachAssignment() {
    this.clearCoachAssignment.emit(this.selectedEmployeeForAll());
  }
}

