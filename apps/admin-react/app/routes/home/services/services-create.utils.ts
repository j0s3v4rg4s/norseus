import { Timestamp } from 'firebase/firestore';
import { type ServiceSchedule } from '@models/services';
import { type DayOfWeek, DAY_OF_WEEK_LABELS } from '@models/common';

export interface CreateSingleScheduleData {
  day: DayOfWeek;
  startTime: string;
  duration: number;
  capacity: number;
  minReserveMinutes: number;
  minCancelMinutes: number;
}

export interface CreateMultipleSchedulesData {
  days: DayOfWeek[];
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
  minReserveMinutes: number;
  minCancelMinutes: number;
}

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

function generateScheduleId(): string {
  return `schedule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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

export function createSingleSchedule(
  data: CreateSingleScheduleData
): ServiceSchedule | null {
  if (!data.day || !data.startTime) return null;
  return {
    id: generateScheduleId(),
    dayOfWeek: data.day,
    startTime: data.startTime,
    durationMinutes: Number(data.duration),
    capacity: Number(data.capacity),
    minReserveMinutes: Number(data.minReserveMinutes),
    minCancelMinutes: Number(data.minCancelMinutes),
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

export function createMultipleSchedules(
  data: CreateMultipleSchedulesData
): ServiceSchedule[] {
  const schedules: ServiceSchedule[] = [];
  if (!data.days.length || !data.startTime || !data.endTime) return schedules;
  const timeSlots = generateTimeSlots(data.startTime, data.endTime, Number(data.duration));
  for (const day of data.days) {
    for (const slot of timeSlots) {
      schedules.push({
        id: generateScheduleId(),
        dayOfWeek: day,
        startTime: slot,
        durationMinutes: Number(data.duration),
        capacity: Number(data.capacity),
        minReserveMinutes: Number(data.minReserveMinutes),
        minCancelMinutes: Number(data.minCancelMinutes),
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  }
  return schedules;
}

function schedulesOverlap(s1: ServiceSchedule, s2: ServiceSchedule): boolean {
  if (s1.dayOfWeek !== s2.dayOfWeek) return false;
  const start1 = timeToMinutes(s1.startTime);
  const end1 = start1 + s1.durationMinutes;
  const start2 = timeToMinutes(s2.startTime);
  const end2 = start2 + s2.durationMinutes;
  return start1 < end2 && start2 < end1;
}

export function checkScheduleConflicts(
  existing: ServiceSchedule[],
  incoming: ServiceSchedule[]
): string | null {
  for (const newSchedule of incoming) {
    for (const existingSchedule of existing) {
      if (schedulesOverlap(newSchedule, existingSchedule)) {
        const dayLabel = DAY_OF_WEEK_LABELS[newSchedule.dayOfWeek];
        const endTime = calculateEndTime(newSchedule.startTime, newSchedule.durationMinutes);
        const existingEndTime = calculateEndTime(
          existingSchedule.startTime,
          existingSchedule.durationMinutes
        );
        return `Conflicto de horarios: El horario ${dayLabel} de ${newSchedule.startTime} a ${endTime} entra en conflicto con el horario existente ${dayLabel} de ${existingSchedule.startTime} a ${existingEndTime}.`;
      }
    }
  }
  return null;
}

export function schedulesToCalendarSlots(schedules: ServiceSchedule[]): CalendarSlot[] {
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
