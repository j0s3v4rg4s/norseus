import { DayOfWeek } from '@models/common';

/**
 * Minimal interface for rendering a slot in the week calendar
 */
export interface CalendarSlot {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  durationMinutes: number;
  displayLabel?: string;
  displaySubLabel?: string;
}

/**
 * Interface representing the calculated position of a slot in the calendar
 */
export interface SlotPosition {
  slot: CalendarSlot;
  top: number;
  height: number;
}

