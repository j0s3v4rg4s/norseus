/**
 * Pure utility functions for time manipulation
 */

/**
 * Converts a time string (HH:MM) to minutes since midnight
 * @param time - Time string in format "HH:MM"
 * @returns Number of minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Calculates the end time given a start time and duration
 * @param startTime - Start time string in format "HH:MM"
 * @param durationMinutes - Duration in minutes
 * @returns End time string in format "HH:MM"
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

/**
 * Gets the start of the week (Monday) for a given date
 * @param date - The reference date
 * @returns A new Date object set to Monday at 00:00:00
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}
