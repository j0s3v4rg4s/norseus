import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DAYS_OF_WEEK, DAY_OF_WEEK_LABELS, DayOfWeek } from '@models/common';
import { CalendarSlot, SlotPosition, TimeSlot } from './interfaces';
import { calculatePosition, getTimeRange } from './utilities';

@Component({
  selector: 'ui-week-calendar',
  standalone: true,
  imports: [],
  templateUrl: './week-calendar.component.html',
  styleUrls: ['./week-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekCalendarComponent {
  slots = input.required<CalendarSlot[]>();
  slotClick = output<string>();

  readonly DAYS_OF_WEEK = DAYS_OF_WEEK;
  readonly DAY_OF_WEEK_LABELS = DAY_OF_WEEK_LABELS;
  readonly SLOT_HEIGHT = 40;

  timeSlots = computed<TimeSlot[]>(() => {
    const slots = this.slots();
    if (slots.length === 0) return [];

    const { minHour, maxHour } = getTimeRange(slots);
    const timeSlots: TimeSlot[] = [];

    for (let hour = minHour; hour <= maxHour; hour++) {
      timeSlots.push({
        hour,
        minute: 0,
        label: `${hour.toString().padStart(2, '0')}:00`,
        isHourMark: true,
      });

      if (hour < maxHour) {
        timeSlots.push({
          hour,
          minute: 30,
          label: `${hour.toString().padStart(2, '0')}:30`,
          isHourMark: false,
        });
      }
    }

    return timeSlots;
  });

  calendarHeight = computed<number>(() => {
    const slots = this.timeSlots();
    return slots.length * this.SLOT_HEIGHT;
  });

  slotsByDay = computed<Record<DayOfWeek, SlotPosition[]>>(() => {
    const slots = this.slots();
    const grouped: Record<DayOfWeek, SlotPosition[]> = {
      [DayOfWeek.MONDAY]: [],
      [DayOfWeek.TUESDAY]: [],
      [DayOfWeek.WEDNESDAY]: [],
      [DayOfWeek.THURSDAY]: [],
      [DayOfWeek.FRIDAY]: [],
      [DayOfWeek.SATURDAY]: [],
      [DayOfWeek.SUNDAY]: [],
    };

    if (slots.length === 0) return grouped;

    const { minHour } = getTimeRange(slots);

    slots.forEach((slot) => {
      const position = calculatePosition(slot, minHour, this.SLOT_HEIGHT);
      grouped[slot.dayOfWeek].push(position);
    });

    return grouped;
  });

  getSlotsForDay(day: DayOfWeek): SlotPosition[] {
    return this.slotsByDay()[day] || [];
  }

  getShortDayLabel(day: DayOfWeek): string {
    return DAY_OF_WEEK_LABELS[day].substring(0, 3);
  }

  onSlotClick(slotId: string): void {
    this.slotClick.emit(slotId);
  }
}
