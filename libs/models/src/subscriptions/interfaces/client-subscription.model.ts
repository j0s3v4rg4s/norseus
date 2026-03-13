import { Timestamp } from 'firebase-admin/firestore';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

/**
 * Represents a client's subscription to a plan within a facility.
 *
 * Firestore path: `facilities/{facilityId}/subscriptions/{subscriptionId}`
 */
export interface ClientSubscription {
  id: string;
  clientId: string;
  planId: string;
  facilityId: string;
  status: SubscriptionStatus;
  startDate: Timestamp;
  endDate: Timestamp;
  /** Classes used per service: { [serviceId]: count } */
  classesUsed: Record<string, number>;
  /** UID of whoever created this subscription (admin or the client themselves) */
  createdBy: string;
}
