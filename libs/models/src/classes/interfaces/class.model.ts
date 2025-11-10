import { Timestamp } from 'firebase/firestore';
import { ClassProgram } from './class-program.interface';

export interface ClassModel {
  id: string;
  serviceId: string;
  facilityId: string;
  scheduleId: string;
  date: Timestamp;
  capacity: number;
  startAt: string;
  duration: number;
  instructorId: string | null;
  userBookings: string[];
  program: ClassProgram | null;
  programTitle: string | null;
}
