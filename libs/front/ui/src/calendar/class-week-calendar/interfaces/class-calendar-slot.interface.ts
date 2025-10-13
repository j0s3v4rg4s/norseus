import { CalendarColor } from '../enums';

/**
 * Interface for rendering a slot in the class-based week calendar
 */
export interface ClassCalendarSlot<T> {
  id: string;
  date: Date;
  startTime: string;
  durationMinutes: number;
  color: CalendarColor;
  displayLabel?: string;
  displaySubLabel?: string;
  data?: T;
  isSelected?: boolean;
  disabled?: boolean;
}

/**
 * Interface representing the calculated position of a class slot in the calendar
 */
export interface ClassSlotPosition<T> {
  slot: ClassCalendarSlot<T>;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

export interface ClassCalendarLegendItem {
  id: string;
  color: CalendarColor;
  serviceName: string;
  visible: boolean;
}
