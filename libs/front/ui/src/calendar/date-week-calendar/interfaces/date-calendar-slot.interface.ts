/**
 * Interface for rendering a slot in the date-based week calendar
 */
export interface DateCalendarSlot<T> {
  id: string;
  date: Date;
  startTime: string;
  durationMinutes: number;
  isSelected: boolean;
  disabled?: boolean;
  displayLabel?: string;
  displaySubLabel?: string;
  extraData?: T;
}

/**
 * Interface representing the calculated position of a date slot in the calendar
 */
export interface DateSlotPosition<T> {
  slot: DateCalendarSlot<T>;
  top: number;
  height: number;
  isDisabled: boolean;
}

