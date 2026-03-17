import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { FACILITY_COLLECTION, EMPLOYEE_COLLECTION } from '@models/facility';
import { SUBSCRIPTION_COLLECTION, SubscriptionStatus } from '@models/subscriptions';
import { z } from 'zod';

const CheckServiceSubscriptionsSchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  serviceId: z.string().min(1, 'Service ID is required'),
});

export const checkServiceSubscriptions = onCall(
  async (request): Promise<{ hasActiveSubscriptions: boolean }> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const validationResult = CheckServiceSubscriptionsSchema.safeParse(request.data);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new HttpsError('invalid-argument', `Validation failed: ${errors}`);
    }

    const data = validationResult.data;
    const db = getFirestore();
    const currentUserId = request.auth.uid;
    const facilityRef = db.collection(FACILITY_COLLECTION).doc(data.facilityId);

    const employeeDoc = await facilityRef
      .collection(EMPLOYEE_COLLECTION)
      .doc(currentUserId)
      .get();

    if (!employeeDoc.exists) {
      throw new HttpsError('permission-denied', 'You are not an employee of this facility');
    }

    const snapshot = await facilityRef
      .collection(SUBSCRIPTION_COLLECTION)
      .where('status', '==', SubscriptionStatus.ACTIVE)
      .where('serviceIds', 'array-contains', data.serviceId)
      .limit(1)
      .get();

    return { hasActiveSubscriptions: !snapshot.empty };
  },
);
