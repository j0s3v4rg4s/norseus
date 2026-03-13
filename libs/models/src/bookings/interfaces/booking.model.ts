import { Timestamp } from 'firebase-admin/firestore';
import { BookingStatus } from '../enums/booking-status.enum';

/**
 * Represents a class booking made by a client.
 *
 * Firestore path: `facilities/{facilityId}/bookings/{bookingId}`
 */
export interface Booking {
  id: string;
  clientId: string;
  classId: string;
  serviceId: string;
  facilityId: string;
  subscriptionId: string;
  status: BookingStatus;
  bookedAt: Timestamp;
  cancelledAt: Timestamp | null;
  /** Denormalized from the class for easier queries */
  classDate: Timestamp;
  /** Denormalized from the class (HH:mm format) */
  classStartAt: string;
}
