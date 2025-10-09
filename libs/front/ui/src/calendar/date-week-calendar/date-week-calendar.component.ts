import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DateCalendarSlot, DateSlotPosition } from './interfaces';
import { TimeSlot } from '../utilities';
import {
  calculateDateSlotPosition,
  getDateTimeRange,
} from './utilities';
import {
  formatDayLabel,
  formatMonthYear,
  getDateKey,
  getWeekDates,
  getWeekEnd,
  getWeekStart,
  isSameWeek,
  isToday,
  isDateInRange,
} from '../utilities/date-utilities';

@Component({
  selector: 'ui-date-week-calendar',
  templateUrl: './date-week-calendar.component.html',
  styleUrls: ['./date-week-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateWeekCalendarComponent<T> {
  slots = input.required<DateCalendarSlot<T>[]>();
  currentWeekDate = input<Date>(new Date());
  minDate = input<Date | undefined>();
  maxDate = input<Date | undefined>();

  slotClick = output<{ slotId: string; isSelected: boolean }>();
  weekChange = output<{ start: Date; end: Date }>();

  readonly SLOT_HEIGHT = 40;

  private currentDisplayWeek = signal<Date>(new Date());

  weekDates = computed<Date[]>(() => {
    const refDate = this.currentDisplayWeek();
    return getWeekDates(refDate);
  });

  monthYear = computed<string>(() => {
    const currentWeek = this.currentDisplayWeek();
    return formatMonthYear(currentWeek);
  });

  canGoPrevious = computed<boolean>(() => {
    const minDate = this.minDate();
    if (!minDate) return true;

    const currentWeekStart = getWeekStart(this.currentDisplayWeek());
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const previousWeekEnd = new Date(previousWeekStart);
    previousWeekEnd.setDate(previousWeekEnd.getDate() + 6);
    previousWeekEnd.setHours(23, 59, 59, 999);

    const minDateStart = new Date(minDate);
    minDateStart.setHours(0, 0, 0, 0);

    return minDateStart<= previousWeekStart ||  (minDateStart >= previousWeekStart && minDateStart <= previousWeekEnd);
  });

  canGoNext = computed<boolean>(() => {
    const maxDate = this.maxDate();
    if (!maxDate) return true;

    const currentWeekStart = getWeekStart(this.currentDisplayWeek());
    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    const maxDateOnly = new Date(maxDate);
    maxDateOnly.setHours(0, 0, 0, 0);

    return nextWeekStart <= maxDateOnly;
  });

  isCurrentWeek = computed<boolean>(() => {
    const today = new Date();
    return isSameWeek(this.currentDisplayWeek(), today);
  });

  timeSlots = computed<TimeSlot[]>(() => {
    const slots = this.slots();
    if (slots.length === 0) return [];

    const { minHour, maxHour } = getDateTimeRange(slots);
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

  slotsByDate = computed<Record<string, DateSlotPosition<T>[]>>(() => {
    const slots = this.slots();
    const grouped: Record<string, DateSlotPosition<T>[]> = {};

    if (slots.length === 0) return grouped;

    const { minHour } = getDateTimeRange(slots);
    const minDate = this.minDate();
    const maxDate = this.maxDate();

    slots.forEach((slot) => {
      const dateKey = getDateKey(slot.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      const isDisabled = slot.disabled || !isDateInRange(slot.date, minDate, maxDate);
      const position = calculateDateSlotPosition(slot, minHour, this.SLOT_HEIGHT, isDisabled);
      grouped[dateKey].push(position);
    });

    return grouped;
  });

  constructor() {
    const initialDate = this.currentWeekDate();
    this.currentDisplayWeek.set(initialDate);
  }

  getSlotsForDate(date: Date): DateSlotPosition<T>[] {
    const dateKey = getDateKey(date);
    return this.slotsByDate()[dateKey] || [];
  }

  isSlotDisabled(slot: DateCalendarSlot<T>): boolean {
    return slot.disabled || !isDateInRange(slot.date, this.minDate(), this.maxDate());
  }

  getDayLabel(date: Date): { day: string; number: number } {
    return formatDayLabel(date);
  }

  isDateToday(date: Date): boolean {
    return isToday(date);
  }

  goToToday(): void {
    const today = new Date();
    this.currentDisplayWeek.set(today);
    this.emitWeekChange();
  }

  goToPreviousWeek(): void {
    if (!this.canGoPrevious()) return;

    const current = this.currentDisplayWeek();
    const previous = new Date(current);
    previous.setDate(previous.getDate() - 7);
    this.currentDisplayWeek.set(previous);
    this.emitWeekChange();
  }

  goToNextWeek(): void {
    if (!this.canGoNext()) return;

    const current = this.currentDisplayWeek();
    const next = new Date(current);
    next.setDate(next.getDate() + 7);
    this.currentDisplayWeek.set(next);
    this.emitWeekChange();
  }

  onSlotClick(slot: DateCalendarSlot<T>): void {
    if (this.isSlotDisabled(slot)) return;
    this.slotClick.emit({ slotId: slot.id, isSelected: !slot.isSelected });
  }

  onDayHeaderClick(date: Date): void {
    const slotsForDate = this.getSlotsForDate(date);
    const enabledSlots = slotsForDate.filter(slot => !slot.isDisabled);

    if (enabledSlots.length === 0) return;

    const allSelected = enabledSlots.every(slot => slot.slot.isSelected);
    const newState = !allSelected;

    enabledSlots.forEach(slot => {
      this.slotClick.emit({ slotId: slot.slot.id, isSelected: newState });
    });
  }

  getSlotClasses(): string {
    return 'cursor-pointer';
  }

  getSlotColorClasses(position: DateSlotPosition<T>): string {
    if (position.isDisabled) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60';
    }

    if (position.slot.isSelected) {
      return 'bg-blue-700/80 hover:bg-blue-800/90 text-white';
    }

    return 'bg-blue-500/60 hover:bg-blue-600/80 text-white';
  }

  private emitWeekChange(): void {
    const start = getWeekStart(this.currentDisplayWeek());
    const end = getWeekEnd(this.currentDisplayWeek());
    this.weekChange.emit({ start, end });
  }
}
