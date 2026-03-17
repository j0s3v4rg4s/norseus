import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { FACILITY_COLLECTION, CLIENT_COLLECTION, EMPLOYEE_COLLECTION, EmployeeModel } from '@models/facility';
import { PLANS_COLLECTION, Plan, PlanDuration, PlanDurationDays } from '@models/plans';
import {
  SUBSCRIPTION_COLLECTION,
  SubscriptionStatus,
  ClientSubscription,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
} from '@models/subscriptions';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { z } from 'zod';
import { checkUserPermission } from '../utilities/permissions';

const CreateSubscriptionSchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD format'),
});

function calculateEndDate(startDate: Date, plan: Plan): Date {
  const days =
    plan.duration.type === PlanDuration.CUSTOM
      ? plan.duration.days!
      : PlanDurationDays[plan.duration.type];
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  return endDate;
}

export const createSubscription = onCall(
  async (request): Promise<CreateSubscriptionResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const validationResult = CreateSubscriptionSchema.safeParse(request.data);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new HttpsError('invalid-argument', `Validation failed: ${errors}`);
    }

    const data: CreateSubscriptionRequest = validationResult.data;
    const db = getFirestore();
    const currentUserId = request.auth.uid;
    const facilityRef = db.collection(FACILITY_COLLECTION).doc(data.facilityId);

    const employeeRef = facilityRef
      .collection(EMPLOYEE_COLLECTION)
      .doc(currentUserId);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      throw new HttpsError('permission-denied', 'You are not an employee of this facility');
    }

    const employeeData = employeeDoc.data() as EmployeeModel;

    if (!employeeData.isAdmin) {
      const hasPermission = await checkUserPermission(
        db,
        data.facilityId,
        currentUserId,
        PermissionSection.CLIENTS,
        PermissionAction.UPDATE,
      );

      if (!hasPermission) {
        throw new HttpsError(
          'permission-denied',
          'You do not have permission to assign plans to clients'
        );
      }
    }

    try {
      const planDoc = await facilityRef
        .collection(PLANS_COLLECTION)
        .doc(data.planId)
        .get();

      if (!planDoc.exists) {
        throw new HttpsError('not-found', 'Plan not found');
      }

      const plan = planDoc.data() as Plan;

      if (!plan.active) {
        throw new HttpsError('failed-precondition', 'Plan is not active');
      }

      const clientDoc = await facilityRef
        .collection(CLIENT_COLLECTION)
        .doc(data.clientId)
        .get();

      if (!clientDoc.exists) {
        throw new HttpsError('not-found', 'Client not found');
      }

      const clientData = clientDoc.data();

      if (!clientData?.isActive) {
        throw new HttpsError('failed-precondition', 'Client is not active');
      }

      const existingSubscriptions = await facilityRef
        .collection(SUBSCRIPTION_COLLECTION)
        .where('clientId', '==', data.clientId)
        .where('planId', '==', data.planId)
        .where('status', '==', SubscriptionStatus.ACTIVE)
        .get();

      if (!existingSubscriptions.empty) {
        throw new HttpsError(
          'already-exists',
          'Client already has an active subscription for this plan'
        );
      }

      const startDate = new Date(data.startDate);
      const endDate = calculateEndDate(startDate, plan);

      const subscriptionRef = facilityRef
        .collection(SUBSCRIPTION_COLLECTION)
        .doc();

      const subscriptionData: ClientSubscription = {
        id: subscriptionRef.id,
        clientId: data.clientId,
        planId: data.planId,
        planName: plan.name,
        facilityId: data.facilityId,
        status: SubscriptionStatus.ACTIVE,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        classesUsed: {},
        createdBy: currentUserId,
        planServices: plan.services,
        planCost: plan.cost,
        planCurrency: plan.currency,
        serviceIds: plan.services.map((s) => s.serviceId),
      };

      await subscriptionRef.set(subscriptionData);

      return {
        success: true,
        subscriptionId: subscriptionRef.id,
        message: 'Subscription created successfully',
      };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error('Error creating subscription:', error);
      throw new HttpsError('internal', 'Error creating subscription');
    }
  }
);
