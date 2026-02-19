import { type DayOfWeek, getDayOfWeekNumber, DAYS_OF_WEEK } from '@models/common';
import { timeToMinutes } from './schedule.utils';

export interface DateCalendarSlot {
  id: string;
  scheduleId: string;
  date: Date;
  dayOfWeek: DayOfWeek;
  startTime: string;
  durationMinutes: number;
  displayLabel: string;
  displaySubLabel: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  color?: 'blue' | 'green' | 'primary' | (string & {});
}

export interface DateSlotPosition {
  slot: DateCalendarSlot;
  top: number;
  height: number;
}

/**
 * Returns the Monday of the week containing the given date.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const dayIndex = d.getDay();
  const diff = dayIndex === 0 ? -6 : 1 - dayIndex;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns an array of 7 Date objects (Mon–Sun) starting from the given Monday.
 */
export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

/**
 * Formats a date for a calendar column header (e.g. "Lun 17", "Mar 18").
 */
export function formatDateHeader(date: Date): string {
  const shortLabels: Record<number, string> = {
    0: 'Dom',
    1: 'Lun',
    2: 'Mar',
    3: 'Mié',
    4: 'Jue',
    5: 'Vie',
    6: 'Sáb',
  };
  return `${shortLabels[date.getDay()]} ${date.getDate()}`;
}

/**
 * Checks whether a slot's date+time is in the past relative to now.
 */
export function isSlotInPast(slot: DateCalendarSlot): boolean {
  const now = new Date();
  const slotDate = new Date(slot.date);
  const [hours, minutes] = slot.startTime.split(':').map(Number);
  slotDate.setHours(hours, minutes, 0, 0);
  return slotDate < now;
}

/**
 * Projects ServiceSchedule templates onto actual dates for a given week,
 * producing one DateCalendarSlot per schedule-per-matching-day.
 */
export function generateDateSlots<
  T extends {
    id: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    durationMinutes: number;
    capacity: number;
    isActive: boolean;
  },
>(schedules: T[], weekStart: Date): DateCalendarSlot[] {
  const weekDates = getWeekDates(weekStart);
  const slots: DateCalendarSlot[] = [];

  for (const schedule of schedules) {
    if (!schedule.isActive) continue;

    const targetJsDay = getDayOfWeekNumber(schedule.dayOfWeek);

    for (const date of weekDates) {
      if (date.getDay() !== targetJsDay) continue;

      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      slots.push({
        id: `${schedule.id}-${dateStr}`,
        scheduleId: schedule.id,
        date: new Date(date),
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        durationMinutes: schedule.durationMinutes,
        displayLabel: schedule.startTime,
        displaySubLabel: `${schedule.durationMinutes} min · Cap: ${schedule.capacity}`,
      });
    }
  }

  return slots;
}

/**
 * Computes the time range across DateCalendarSlots for calendar rendering.
 */
export function getDateSlotTimeRange(slots: DateCalendarSlot[]): { minHour: number; maxHour: number } {
  let minMinutes = Infinity;
  let maxMinutes = -Infinity;
  for (const slot of slots) {
    const start = timeToMinutes(slot.startTime);
    const end = start + slot.durationMinutes;
    if (start < minMinutes) minMinutes = start;
    if (end > maxMinutes) maxMinutes = end;
  }
  return {
    minHour: Math.floor(minMinutes / 60),
    maxHour: Math.ceil(maxMinutes / 60),
  };
}

/**
 * Calculates the pixel position of a date calendar slot within the time grid.
 */
export function calculateDateSlotPosition(
  slot: DateCalendarSlot,
  minHour: number,
  slotHeight: number
): DateSlotPosition {
  const startMinutes = timeToMinutes(slot.startTime);
  const offsetMinutes = startMinutes - minHour * 60;
  const top = (offsetMinutes / 30) * slotHeight;
  const height = (slot.durationMinutes / 30) * slotHeight;
  return { slot, top, height };
}
