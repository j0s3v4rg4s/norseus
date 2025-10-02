import { CalendarSlot, SlotPosition } from '../interfaces';

/**
 * Calculates the visual position and height of a calendar slot
 */
export function calculatePosition(
  slot: CalendarSlot,
  minHour: number,
  slotHeight: number
): SlotPosition {
  const [hour, minute] = slot.startTime.split(':').map(Number);
  const startMinutes = (hour - minHour) * 60 + minute;
  const top = (startMinutes / 30) * slotHeight;
  const height = (slot.durationMinutes / 30) * slotHeight;

  return { slot, top, height };
}
