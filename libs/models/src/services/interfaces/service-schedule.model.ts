import { Timestamp } from 'firebase/firestore';
import { DayOfWeek } from '../../common';

export interface ServiceSchedule {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  durationMinutes: number;
  employeeId: string;
  capacity: number;
  minReserveMinutes: number;
  minCancelMinutes: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
