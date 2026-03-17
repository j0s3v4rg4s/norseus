import { Timestamp } from 'firebase-admin/firestore';
import { PlanService } from '../../plans/models/plan-service.model';
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
  planName: string;
  facilityId: string;
  status: SubscriptionStatus;
  startDate: Timestamp;
  endDate: Timestamp;
  /** Classes used per service: { [serviceId]: count } */
  classesUsed: Record<string, number>;
  /** UID of whoever created this subscription (admin or the client themselves) */
  createdBy: string;
  /** Snapshot of plan services at subscription creation time */
  planServices: PlanService[];
  /** Snapshot of plan cost at subscription creation time */
  planCost: number;
  /** Snapshot of plan currency at subscription creation time */
  planCurrency: string;
  /** Flat array of serviceIds for Firestore array-contains queries */
  serviceIds: string[];
}
