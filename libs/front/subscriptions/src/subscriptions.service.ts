import {
  type Firestore,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { type Functions, httpsCallable } from 'firebase/functions';
import {
  SUBSCRIPTION_COLLECTION,
  type ClientSubscription,
  type CreateSubscriptionRequest,
  type CreateSubscriptionResponse,
} from '@models/subscriptions';
import { FACILITY_COLLECTION } from '@models/facility';
import { PLANS_COLLECTION, type Plan } from '@models/plans';

/**
 * Retrieves all subscriptions for a client within a facility.
 * Returns all statuses (active, expired, cancelled) sorted by startDate desc.
 */
export async function getClientSubscriptions(
  db: Firestore,
  facilityId: string,
  clientId: string
): Promise<ClientSubscription[]> {
  const ref = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    SUBSCRIPTION_COLLECTION
  );
  const q = query(ref, where('clientId', '==', clientId));
  const snapshot = await getDocs(q);
  const subscriptions = snapshot.docs.map((d) => d.data() as ClientSubscription);
  return subscriptions.sort((a, b) => {
    const aTime = a.startDate.toMillis();
    const bTime = b.startDate.toMillis();
    return bTime - aTime;
  });
}

/**
 * Retrieves all active plans for a facility.
 */
export async function getActivePlans(
  db: Firestore,
  facilityId: string
): Promise<Plan[]> {
  const ref = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    PLANS_COLLECTION
  );
  const q = query(ref, where('active', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Plan);
}

/**
 * Creates a subscription linking a client to a plan via Cloud Function.
 */
export async function createSubscription(
  functions: Functions,
  payload: CreateSubscriptionRequest
): Promise<CreateSubscriptionResponse> {
  const createSubscriptionFn = httpsCallable<
    CreateSubscriptionRequest,
    CreateSubscriptionResponse
  >(functions, 'createSubscription');
  const result = await createSubscriptionFn(payload);
  return result.data;
}

/**
 * Checks if a plan has any active subscriptions.
 */
export async function checkPlanHasActiveSubscriptions(
  functions: Functions,
  facilityId: string,
  planId: string
): Promise<{ hasActiveSubscriptions: boolean }> {
  const fn = httpsCallable<
    { facilityId: string; planId: string },
    { hasActiveSubscriptions: boolean }
  >(functions, 'checkPlanSubscriptions');
  const result = await fn({ facilityId, planId });
  return result.data;
}

/**
 * Checks if a service has any active subscriptions.
 */
export async function checkServiceHasActiveSubscriptions(
  functions: Functions,
  facilityId: string,
  serviceId: string
): Promise<{ hasActiveSubscriptions: boolean }> {
  const fn = httpsCallable<
    { facilityId: string; serviceId: string },
    { hasActiveSubscriptions: boolean }
  >(functions, 'checkServiceSubscriptions');
  const result = await fn({ facilityId, serviceId });
  return result.data;
}
