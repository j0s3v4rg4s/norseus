import { DateCalendarSlot, DateSlotPosition } from '../interfaces';

/**
 * Calculates the visual position and height of a date calendar slot
 */
export function calculateDateSlotPosition<T>(
  slot: DateCalendarSlot<T>,
  minHour: number,
  slotHeight: number,
  isDisabled: boolean
): DateSlotPosition<T> {
  const [hour, minute] = slot.startTime.split(':').map(Number);
  const startMinutes = (hour - minHour) * 60 + minute;
  const top = (startMinutes / 30) * slotHeight;
  const height = (slot.durationMinutes / 30) * slotHeight;

  return { slot, top, height, isDisabled };
}
