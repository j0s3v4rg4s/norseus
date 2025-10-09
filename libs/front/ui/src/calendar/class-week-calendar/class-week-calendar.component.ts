import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ClassCalendarSlot, ClassSlotPosition } from './interfaces';
import { TimeSlot } from '../utilities';
import {
  getWeekStart,
  getWeekEnd,
  getWeekDates,
  isSameWeek,
  formatDayLabel,
  formatMonthYear,
  getDateKey,
  isToday,
} from '../utilities/date-utilities';
import {
  assignColorsToSlots,
  groupSlotsByDate,
  calculateOverlappingPositions,
  getTimeRangeFromSlots,
} from './utilities';

@Component({
  selector: 'ui-class-week-calendar',
  templateUrl: './class-week-calendar.component.html',
  styleUrls: ['./class-week-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassWeekCalendarComponent<T> {
  slots = input.required<ClassCalendarSlot<T>[]>();
  currentWeekDate = input<Date>(new Date());

  slotClick = output<ClassCalendarSlot<T>>();
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
    const today = new Date();
    const currentWeekStart = getWeekStart(this.currentDisplayWeek());
    const todayWeekStart = getWeekStart(today);
    return currentWeekStart.getTime() > todayWeekStart.getTime();
  });

  canGoNext = computed<boolean>(() => {
    return true;
  });

  isCurrentWeek = computed<boolean>(() => {
    const today = new Date();
    return isSameWeek(this.currentDisplayWeek(), today);
  });

  timeSlots = computed<TimeSlot[]>(() => {
    const slots = this.slots();
    if (slots.length === 0) return [];

    const { minHour, maxHour } = getTimeRangeFromSlots(slots);
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

  slotsByDate = computed<Record<string, ClassSlotPosition<T>[]>>(() => {
    const slots = this.slots();
    if (slots.length === 0) return {};

    const coloredSlots = assignColorsToSlots(slots);
    const grouped = groupSlotsByDate(coloredSlots);
    const { minHour } = getTimeRangeFromSlots(coloredSlots);

    const result: Record<string, ClassSlotPosition<T>[]> = {};

    Object.keys(grouped).forEach(dateKey => {
      const slotsForDate = grouped[dateKey];
      result[dateKey] = calculateOverlappingPositions(slotsForDate, minHour, this.SLOT_HEIGHT);
    });

    return result;
  });

  maxZIndex = computed<number>(() => {
    const allPositions = Object.values(this.slotsByDate()).flat();
    if (allPositions.length === 0) return 10;
    return Math.max(...allPositions.map(pos => pos.zIndex)) + 10;
  });

  constructor() {
    const initialDate = this.currentWeekDate();
    this.currentDisplayWeek.set(initialDate);
  }

  getSlotsForDate(date: Date): ClassSlotPosition<T>[] {
    const dateKey = getDateKey(date);
    return this.slotsByDate()[dateKey] || [];
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

  onSlotClick(slot: ClassCalendarSlot<T>): void {
    this.slotClick.emit(slot);
  }

  getSlotColorClasses(position: ClassSlotPosition<T>): string {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500/90 hover:bg-blue-600 text-white',
      green: 'bg-green-500/90 hover:bg-green-600 text-white',
      purple: 'bg-purple-500/90 hover:bg-purple-600 text-white',
      orange: 'bg-orange-500/90 hover:bg-orange-600 text-white',
      pink: 'bg-pink-500/90 hover:bg-pink-600 text-white',
      indigo: 'bg-indigo-500/90 hover:bg-indigo-600 text-white',
      teal: 'bg-teal-500/90 hover:bg-teal-600 text-white',
      rose: 'bg-rose-500/90 hover:bg-rose-600 text-white',
    };

    // Get color from the slot's color property (assigned by assignColorsToSlots)
    const color = position.slot.color;
    return color ? colorMap[color] || 'bg-gray-500/80 hover:bg-gray-600/90 text-white' : 'bg-gray-500/80 hover:bg-gray-600/90 text-white';
  }

  private emitWeekChange(): void {
    const start = getWeekStart(this.currentDisplayWeek());
    const end = getWeekEnd(this.currentDisplayWeek());
    this.weekChange.emit({ start, end });
  }
}
