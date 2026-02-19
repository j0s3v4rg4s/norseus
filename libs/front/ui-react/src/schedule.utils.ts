import type { DayOfWeek } from '@models/common';

export interface ScheduleFormData {
  scheduleType: 'single' | 'multiple';
  days: DayOfWeek[];
  startTime: string;
  endTime?: string;
  duration: number;
  capacity: number;
  minReserveMinutes: number;
  minCancelMinutes: number;
}

export interface CalendarSlot {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  durationMinutes: number;
  displayLabel: string;
  displaySubLabel: string;
}

export interface SlotPosition {
  slot: CalendarSlot;
  top: number;
  height: number;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const totalMinutes = timeToMinutes(startTime) + durationMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  let current = startMinutes;
  while (current <= endMinutes) {
    const hours = Math.floor(current / 60);
    const minutes = current % 60;
    slots.push(
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    );
    current += durationMinutes;
  }
  return slots;
}

export function schedulesToCalendarSlots<
  T extends {
    id: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    durationMinutes: number;
    capacity: number;
  },
>(schedules: T[]): CalendarSlot[] {
  return schedules.map((s) => ({
    id: s.id,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    durationMinutes: s.durationMinutes,
    displayLabel: s.startTime,
    displaySubLabel: `${s.durationMinutes} min · Cap: ${s.capacity}`,
  }));
}

export function getTimeRange(slots: CalendarSlot[]): { minHour: number; maxHour: number } {
  let minMinutes = Infinity;
  let maxMinutes = -Infinity;
  for (const slot of slots) {
    const start = timeToMinutes(slot.startTime);
    const end = start + slot.durationMinutes;
    if (start < minMinutes) minMinutes = start;
    if (end > maxMinutes) maxMinutes = end;
  }
  return {
    minHour: Math.floor(minMinutes / 60),
    maxHour: Math.ceil(maxMinutes / 60),
  };
}

export function calculateSlotPosition(
  slot: CalendarSlot,
  minHour: number,
  slotHeight: number
): SlotPosition {
  const startMinutes = timeToMinutes(slot.startTime);
  const offsetMinutes = startMinutes - minHour * 60;
  const top = (offsetMinutes / 30) * slotHeight;
  const height = (slot.durationMinutes / 30) * slotHeight;
  return { slot, top, height };
}
