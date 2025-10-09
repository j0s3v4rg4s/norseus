/**
 * Enum representing days of the week
 * Used across different business logic areas for scheduling, availability, etc.
 */
export enum DayOfWeek {
  MONDAY = 'mon',
  TUESDAY = 'tue',
  WEDNESDAY = 'wed',
  THURSDAY = 'thu',
  FRIDAY = 'fri',
  SATURDAY = 'sat',
  SUNDAY = 'sun',
}

/**
 * Array of all days of the week in order
 * Useful for iteration and validation
 */
export const DAYS_OF_WEEK = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
] as const;

/**
 * Human-readable labels for each day of the week
 */
export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Lunes',
  [DayOfWeek.TUESDAY]: 'Martes',
  [DayOfWeek.WEDNESDAY]: 'Miércoles',
  [DayOfWeek.THURSDAY]: 'Jueves',
  [DayOfWeek.FRIDAY]: 'Viernes',
  [DayOfWeek.SATURDAY]: 'Sábado',
  [DayOfWeek.SUNDAY]: 'Domingo',
};

/**
 * Maps DayOfWeek enum to JavaScript day numbers (0 = Sunday, 1 = Monday, etc.)
 */
export function getDayOfWeekNumber(dayOfWeek: DayOfWeek): number {
  const dayMap: Record<DayOfWeek, number> = {
    [DayOfWeek.SUNDAY]: 0,
    [DayOfWeek.MONDAY]: 1,
    [DayOfWeek.TUESDAY]: 2,
    [DayOfWeek.WEDNESDAY]: 3,
    [DayOfWeek.THURSDAY]: 4,
    [DayOfWeek.FRIDAY]: 5,
    [DayOfWeek.SATURDAY]: 6,
  };

  return dayMap[dayOfWeek];
}
