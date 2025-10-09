/**
 * Enum representing months of the year
 * Used across different business logic areas for scheduling, availability, etc.
 */
export enum Month {
  JANUARY = 'jan',
  FEBRUARY = 'feb',
  MARCH = 'mar',
  APRIL = 'apr',
  MAY = 'may',
  JUNE = 'jun',
  JULY = 'jul',
  AUGUST = 'aug',
  SEPTEMBER = 'sep',
  OCTOBER = 'oct',
  NOVEMBER = 'nov',
  DECEMBER = 'dec',
}

/**
 * Array of all months of the year in order
 * Useful for iteration and validation
 */
export const MONTHS_OF_YEAR = [
  Month.JANUARY,
  Month.FEBRUARY,
  Month.MARCH,
  Month.APRIL,
  Month.MAY,
  Month.JUNE,
  Month.JULY,
  Month.AUGUST,
  Month.SEPTEMBER,
  Month.OCTOBER,
  Month.NOVEMBER,
  Month.DECEMBER,
] as const;

/**
 * Human-readable labels for each month of the year
 */
export const MONTH_LABELS: Record<Month, string> = {
  [Month.JANUARY]: 'Enero',
  [Month.FEBRUARY]: 'Febrero',
  [Month.MARCH]: 'Marzo',
  [Month.APRIL]: 'Abril',
  [Month.MAY]: 'Mayo',
  [Month.JUNE]: 'Junio',
  [Month.JULY]: 'Julio',
  [Month.AUGUST]: 'Agosto',
  [Month.SEPTEMBER]: 'Septiembre',
  [Month.OCTOBER]: 'Octubre',
  [Month.NOVEMBER]: 'Noviembre',
  [Month.DECEMBER]: 'Diciembre',
};

/**
 * Maps Month enum to JavaScript month numbers (0 = January, 1 = February, etc.)
 */
export function getMonthNumber(month: Month): number {
  const monthMap: Record<Month, number> = {
    [Month.JANUARY]: 0,
    [Month.FEBRUARY]: 1,
    [Month.MARCH]: 2,
    [Month.APRIL]: 3,
    [Month.MAY]: 4,
    [Month.JUNE]: 5,
    [Month.JULY]: 6,
    [Month.AUGUST]: 7,
    [Month.SEPTEMBER]: 8,
    [Month.OCTOBER]: 9,
    [Month.NOVEMBER]: 10,
    [Month.DECEMBER]: 11,
  };

  return monthMap[month];
}
