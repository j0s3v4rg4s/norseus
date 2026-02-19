import { Timestamp } from 'firebase/firestore';
import { type ServiceSchedule } from '@models/services';
import { type DayOfWeek, DAY_OF_WEEK_LABELS } from '@models/common';
import { timeToMinutes, calculateEndTime, generateTimeSlots } from '@front/ui-react';

export { type CalendarSlot } from '@front/ui-react';

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

function generateScheduleId(): string {
  return `schedule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createSingleSchedule(data: CreateSingleScheduleData): ServiceSchedule | null {
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

export function createMultipleSchedules(data: CreateMultipleSchedulesData): ServiceSchedule[] {
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

export function checkScheduleConflicts(existing: ServiceSchedule[], incoming: ServiceSchedule[]): string | null {
  for (const newSchedule of incoming) {
    for (const existingSchedule of existing) {
      if (schedulesOverlap(newSchedule, existingSchedule)) {
        const dayLabel = DAY_OF_WEEK_LABELS[newSchedule.dayOfWeek];
        const endTime = calculateEndTime(newSchedule.startTime, newSchedule.durationMinutes);
        const existingEndTime = calculateEndTime(existingSchedule.startTime, existingSchedule.durationMinutes);
        return `Conflicto de horarios: El horario ${dayLabel} de ${newSchedule.startTime} a ${endTime} entra en conflicto con el horario existente ${dayLabel} de ${existingSchedule.startTime} a ${existingEndTime}.`;
      }
    }
  }
  return null;
}
