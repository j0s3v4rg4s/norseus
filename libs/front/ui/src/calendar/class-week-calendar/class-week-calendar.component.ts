import { ChangeDetectionStrategy, Component, computed, input, output, signal, OnInit } from '@angular/core';
import { ClassCalendarSlot, ClassSlotPosition, ClassCalendarLegendItem } from './interfaces';
import { CalendarColor } from './enums';
import { CALENDAR_COLOR_THEME, CALENDAR_DISABLED_COLOR, CALENDAR_DEFAULT_COLORS } from './constants';
import { TimeSlot } from '../utilities';
import {
  getWeekEnd,
  getWeekDates,
  isSameWeek,
  formatDayLabel,
  formatMonthYear,
  getDateKey,
  isToday,
} from '../utilities/date-utilities';
import { groupSlotsByDate, calculateOverlappingPositions, getTimeRangeFromSlots } from './utilities';
import { getWeekStart } from '@front/utils';

@Component({
  selector: 'ui-class-week-calendar',
  templateUrl: './class-week-calendar.component.html',
  styleUrls: ['./class-week-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassWeekCalendarComponent<T> implements OnInit {
  slots = input.required<ClassCalendarSlot<T>[]>();
  minDate = input<Date | undefined>(undefined);
  maxDate = input<Date | undefined>(undefined);
  legendItems = input<ClassCalendarLegendItem[]>([]);

  slotClick = output<ClassCalendarSlot<T>>();
  weekChange = output<{ start: Date; end: Date }>();
  legendToggle = output<ClassCalendarLegendItem>();
  daySelect = output<ClassCalendarSlot<T>[]>();

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

  minWeekStart = computed<Date | undefined>(() => {
    const min = this.minDate();
    return min ? getWeekStart(min) : undefined;
  });

  maxWeekEnd = computed<Date | undefined>(() => {
    const max = this.maxDate();
    return max ? getWeekEnd(max) : undefined;
  });

  canGoPrevious = computed<boolean>(() => {
    const currentWeekStart = getWeekStart(this.currentDisplayWeek());
    const minWeek = this.minWeekStart();

    if (minWeek) {
      return currentWeekStart.getTime() > minWeek.getTime();
    }

    const todayWeekStart = getWeekStart(new Date());
    return currentWeekStart.getTime() > todayWeekStart.getTime();
  });

  canGoNext = computed<boolean>(() => {
    const currentWeekStart = getWeekStart(this.currentDisplayWeek());
    const maxWeek = this.maxWeekEnd();

    if (maxWeek) {
      return currentWeekStart.getTime() < getWeekStart(maxWeek).getTime();
    }

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

    const grouped = groupSlotsByDate(slots);
    const { minHour } = getTimeRangeFromSlots(slots);

    const result: Record<string, ClassSlotPosition<T>[]> = {};

    Object.keys(grouped).forEach((dateKey) => {
      const slotsForDate = grouped[dateKey];
      result[dateKey] = calculateOverlappingPositions(slotsForDate, minHour, this.SLOT_HEIGHT);
    });

    return result;
  });

  maxZIndex = computed<number>(() => {
    const allPositions = Object.values(this.slotsByDate()).flat();
    if (allPositions.length === 0) return 10;
    return Math.max(...allPositions.map((pos) => pos.zIndex)) + 10;
  });

  showLegend = computed<boolean>(() => {
    return this.legendItems().length > 0;
  });

  ngOnInit(): void {
    const min = this.minDate();
    const initialDate = min || new Date();
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
    if (slot.disabled) return;
    this.slotClick.emit(slot);
  }

  onDayHeaderClick(slots: ClassSlotPosition<T>[]) {
    const slotsClass = slots.map(slot => slot.slot);
    this.daySelect.emit(slotsClass);
  }

  getSlotColorClasses(position: ClassSlotPosition<T>): string {
    if (position.slot.disabled) {
      return CALENDAR_DISABLED_COLOR;
    }

    const color = position.slot.color;
    const colorTheme = CALENDAR_COLOR_THEME[color];

    if (!colorTheme) {
      return position.slot.isSelected ? CALENDAR_DEFAULT_COLORS.selected : CALENDAR_DEFAULT_COLORS.normal;
    }

    return position.slot.isSelected ? colorTheme.selected : colorTheme.normal;
  }

  getLegendColorClasses(color: CalendarColor): string {
    const colorTheme = CALENDAR_COLOR_THEME[color];
    return colorTheme ? colorTheme.legend : CALENDAR_DEFAULT_COLORS.legend;
  }

  getLegendCheckboxClasses(item: ClassCalendarLegendItem): string {
    const baseClasses = 'w-4 h-4 rounded border-2 transition-all duration-200';

    if (item.visible) {
      const colorTheme = CALENDAR_COLOR_THEME[item.color];
      const colorClasses = colorTheme ? colorTheme.legendCheckbox : CALENDAR_DEFAULT_COLORS.legendCheckbox;
      return `${baseClasses} ${colorClasses}`;
    }

    return `${baseClasses} bg-white border-gray-300 hover:border-gray-400`;
  }

  toggleLegendItem(item: ClassCalendarLegendItem): void {
    this.legendToggle.emit(item);
  }

  private emitWeekChange(): void {
    const start = getWeekStart(this.currentDisplayWeek());
    const end = getWeekEnd(this.currentDisplayWeek());
    this.weekChange.emit({ start, end });
  }
}
