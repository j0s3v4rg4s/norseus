import { DateCalendarSlot } from '../interfaces';

/**
 * Calculates the minimum and maximum hours from a list of date calendar slots
 */
export function getDateTimeRange<T>(slots: DateCalendarSlot<T>[]): { minHour: number; maxHour: number } {
  let minHour = 24;
  let maxHour = 0;

  slots.forEach((slot) => {
    const [hour, minute] = slot.startTime.split(':').map(Number);
    const startMinutes = hour * 60 + minute;
    const endMinutes = startMinutes + slot.durationMinutes;
    const endHour = Math.ceil(endMinutes / 60);

    minHour = Math.min(minHour, hour);
    maxHour = Math.max(maxHour, endHour);
  });

  return { minHour, maxHour };
}
