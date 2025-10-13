import { DayOfWeek, getDayOfWeekNumber } from '@models/common';
import { getWeekStart } from '@front/utils';

/**
 * Gets the end of the week (Sunday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Returns an array of 7 dates representing the week (Monday to Sunday) for a given reference date
 */
export function getWeekDates(referenceDate: Date): Date[] {
  const weekStart = getWeekStart(referenceDate);
  const dates: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date);
  }

  return dates;
}

/**
 * Checks if a date is within the specified range
 */
export function isDateInRange(date: Date, minDate?: Date, maxDate?: Date): boolean {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  if (minDate) {
    const minDateOnly = new Date(minDate);
    minDateOnly.setHours(0, 0, 0, 0);
    if (dateOnly < minDateOnly) return false;
  }

  if (maxDate) {
    const maxDateOnly = new Date(maxDate);
    maxDateOnly.setHours(0, 0, 0, 0);
    if (dateOnly > maxDateOnly) return false;
  }

  return true;
}

/**
 * Checks if two dates are in the same week
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const week1Start = getWeekStart(date1);
  const week2Start = getWeekStart(date2);
  return week1Start.getTime() === week2Start.getTime();
}

/**
 * Formats a date for display in the calendar header
 */
export function formatDayLabel(date: Date): { day: string; number: number } {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayIndex = date.getDay();
  const day = days[dayIndex];
  const number = date.getDate();

  return { day, number };
}

/**
 * Formats month and year for display
 */
export function formatMonthYear(date: Date): string {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${year}`;
}

/**
 * Gets the ISO date string (YYYY-MM-DD) for a date using local time
 */
export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Retrieves all dates within a specified date range that fall on a specific day of the week.
 *
 * This utility function iterates through all dates from the start date to the end date (inclusive)
 * and returns an array containing only the dates that match the specified day of the week.
 *
 * @param startDate - The starting date of the range (inclusive)
 * @param endDate - The ending date of the range (inclusive)
 * @param dayOfWeek - The day of the week to filter for (e.g., DayOfWeek.MONDAY, DayOfWeek.SUNDAY)
 * @returns An array of Date objects that fall on the specified day of the week within the given range
 *
 * @example
 * ```typescript
 * const startDate = new Date('2024-01-01');
 * const endDate = new Date('2024-01-31');
 * const mondays = getDatesForDayOfWeek(startDate, endDate, DayOfWeek.MONDAY);
 * // Returns all Mondays in January 2024
 * ```
 */
export function getDatesForDayOfWeek(startDate: Date, endDate: Date, dayOfWeek: DayOfWeek): Date[] {
  const targetDayNumber = getDayOfWeekNumber(dayOfWeek);
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() === targetDayNumber) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Gets the current week range (Monday to Sunday) starting from today
 */
export function getCurrentWeekRange(): { startDate: Date; endDate: Date } {
  const today = new Date();
  const startDate = getWeekStart(today);
  const endDate = getWeekEnd(today);

  return { startDate, endDate };
}
