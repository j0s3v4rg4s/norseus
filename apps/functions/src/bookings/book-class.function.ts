import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { FACILITY_COLLECTION, CLIENT_COLLECTION } from '@models/facility';
import { CLASSES_COLLECTION, ClassModel } from '@models/classes';
import { ClassLimitType } from '@models/plans';
import {
  SUBSCRIPTION_COLLECTION,
  SubscriptionStatus,
  ClientSubscription,
} from '@models/subscriptions';
import {
  BOOKING_COLLECTION,
  BookingStatus,
  Booking,
  BookClassRequest,
  BookClassResponse,
} from '@models/bookings';
import { z } from 'zod';

const BookClassSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  facilityId: z.string().min(1, 'Facility ID is required'),
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
});

export const bookClass = onCall(async (request): Promise<BookClassResponse> => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const validationResult = BookClassSchema.safeParse(request.data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new HttpsError('invalid-argument', `Validation failed: ${errors}`);
  }

  const data: BookClassRequest = validationResult.data;
  const db = getFirestore();
  const clientId = request.auth.uid;
  const facilityRef = db.collection(FACILITY_COLLECTION).doc(data.facilityId);

  const bookingId = facilityRef.collection(BOOKING_COLLECTION).doc().id;

  try {
    await db.runTransaction(async (transaction) => {
      const classRef = facilityRef.collection(CLASSES_COLLECTION).doc(data.classId);
      const subscriptionRef = facilityRef.collection(SUBSCRIPTION_COLLECTION).doc(data.subscriptionId);

      const [classDoc, subscriptionDoc] = await Promise.all([
        transaction.get(classRef),
        transaction.get(subscriptionRef),
      ]);

      if (!classDoc.exists) {
        throw new HttpsError('not-found', 'Class not found');
      }
      if (!subscriptionDoc.exists) {
        throw new HttpsError('not-found', 'Subscription not found');
      }

      const classData = classDoc.data() as ClassModel;
      const subscription = subscriptionDoc.data() as ClientSubscription;

      // Verify subscription belongs to the client and is active
      if (subscription.clientId !== clientId || subscription.status !== SubscriptionStatus.ACTIVE) {
        throw new HttpsError('permission-denied', 'Invalid subscription');
      }

      // Check not already booked
      if (classData.userBookings.includes(clientId)) {
        throw new HttpsError('already-exists', 'You already have a booking for this class');
      }

      // Check capacity
      if (classData.userBookings.length >= classData.capacity) {
        throw new HttpsError('resource-exhausted', 'Class is full');
      }

      // Check subscription covers this service and class limit
      const planService = subscription.planServices.find((s) => s.serviceId === classData.serviceId);

      if (!planService) {
        throw new HttpsError('failed-precondition', 'Subscription does not cover this service');
      }

      if (planService.classLimitType === ClassLimitType.FIXED && planService.classLimit !== null) {
        const used = subscription.classesUsed[classData.serviceId] || 0;
        if (used >= planService.classLimit) {
          throw new HttpsError('resource-exhausted', 'Class limit reached for this service');
        }
      }

      // Create booking
      const now = Timestamp.fromDate(new Date());
      const bookingRef = facilityRef.collection(BOOKING_COLLECTION).doc(bookingId);

      const bookingData: Booking = {
        id: bookingId,
        clientId,
        classId: data.classId,
        serviceId: classData.serviceId,
        facilityId: data.facilityId,
        subscriptionId: subscription.id,
        status: BookingStatus.CONFIRMED,
        bookedAt: now,
        cancelledAt: null,
        classDate: classData.date,
        classStartAt: classData.startAt,
      };

      transaction.set(bookingRef, bookingData);

      // Add client to class userBookings
      transaction.update(classRef, {
        userBookings: FieldValue.arrayUnion(clientId),
      });

      // Increment classesUsed if FIXED
      if (planService.classLimitType === ClassLimitType.FIXED) {
        transaction.update(subscriptionRef, {
          [`classesUsed.${classData.serviceId}`]: FieldValue.increment(1),
        });
      }
    });

    return {
      success: true,
      bookingId,
      message: 'Class booked successfully',
    };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error('Error booking class:', error);
    throw new HttpsError('internal', 'Error booking class');
  }
});
