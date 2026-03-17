import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { FACILITY_COLLECTION } from '@models/facility';
import { CLASSES_COLLECTION } from '@models/classes';
import { ClassLimitType } from '@models/plans';
import { SUBSCRIPTION_COLLECTION, ClientSubscription } from '@models/subscriptions';
import {
  BOOKING_COLLECTION,
  BookingStatus,
  Booking,
  CancelBookingRequest,
  CancelBookingResponse,
} from '@models/bookings';
import { z } from 'zod';

const CancelBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  facilityId: z.string().min(1, 'Facility ID is required'),
});

export const cancelBooking = onCall(async (request): Promise<CancelBookingResponse> => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const validationResult = CancelBookingSchema.safeParse(request.data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new HttpsError('invalid-argument', `Validation failed: ${errors}`);
  }

  const data: CancelBookingRequest = validationResult.data;
  const db = getFirestore();
  const clientId = request.auth.uid;
  const facilityRef = db.collection(FACILITY_COLLECTION).doc(data.facilityId);

  try {
    await db.runTransaction(async (transaction) => {
      const bookingRef = facilityRef.collection(BOOKING_COLLECTION).doc(data.bookingId);
      const bookingDoc = await transaction.get(bookingRef);

      if (!bookingDoc.exists) {
        throw new HttpsError('not-found', 'Booking not found');
      }

      const booking = bookingDoc.data() as Booking;

      // Verify booking belongs to the client
      if (booking.clientId !== clientId) {
        throw new HttpsError('permission-denied', 'This booking does not belong to you');
      }

      // Verify booking is confirmed
      if (booking.status !== BookingStatus.CONFIRMED) {
        throw new HttpsError('failed-precondition', 'Booking is not in confirmed status');
      }

      // Update booking status
      const now = Timestamp.fromDate(new Date());
      transaction.update(bookingRef, {
        status: BookingStatus.CANCELLED,
        cancelledAt: now,
      });

      // Remove client from class userBookings
      const classRef = facilityRef.collection(CLASSES_COLLECTION).doc(booking.classId);
      transaction.update(classRef, {
        userBookings: FieldValue.arrayRemove(clientId),
      });

      // Decrement classesUsed if plan service is FIXED
      const subscriptionRef = facilityRef.collection(SUBSCRIPTION_COLLECTION).doc(booking.subscriptionId);
      const subscriptionDoc = await transaction.get(subscriptionRef);

      if (subscriptionDoc.exists) {
        const subscription = subscriptionDoc.data() as ClientSubscription;

        const planService = subscription.planServices.find((s) => s.serviceId === booking.serviceId);

        if (planService?.classLimitType === ClassLimitType.FIXED) {
          const currentUsed = subscription.classesUsed[booking.serviceId] || 0;
          if (currentUsed > 0) {
            transaction.update(subscriptionRef, {
              [`classesUsed.${booking.serviceId}`]: FieldValue.increment(-1),
            });
          }
        }
      }
    });

    return {
      success: true,
      message: 'Booking cancelled successfully',
    };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error('Error cancelling booking:', error);
    throw new HttpsError('internal', 'Error cancelling booking');
  }
});
