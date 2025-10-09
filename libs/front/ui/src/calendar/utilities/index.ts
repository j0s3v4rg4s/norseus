export { getTimeRange } from './get-time-range.utility';
export { calculatePosition } from './calculate-position.utility';
export * from './transform-slot.utility';

/**
 * Interface representing a time mark in the calendar grid
 */
export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  isHourMark: boolean;
}
