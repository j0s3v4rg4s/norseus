import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from 'firebase-functions/v2/firestore';

import { Plan, PLANS_COLLECTION } from '@models/plans';
import { FACILITY_COLLECTION } from '@models/facility';
import { SERVICES_COLLECTION } from '@models/services';

const PLANS_PATH = `${FACILITY_COLLECTION}/{facilityId}/${PLANS_COLLECTION}/{planId}`;

export const onPlanCreate = onDocumentCreated(PLANS_PATH, async (event) => {
  if (event && event.data) {
    const plan = event.data?.data() as Plan;
    const { facilityId } = event.params;
    const planId = event.data.id;
    const db = getFirestore();

    const batch = db.batch();

    plan.services.forEach((service) => {
      const serviceRef = db.doc(`${FACILITY_COLLECTION}/${facilityId}/${SERVICES_COLLECTION}/${service.serviceId}`);
      batch.update(serviceRef, {
        planIds: FieldValue.arrayUnion(planId),
      });
    });

    await batch.commit();
  }
});

export const onPlanUpdate = onDocumentUpdated(PLANS_PATH, async (event) => {
  if (event && event.data) {
    const planBefore = event.data.before.data() as Plan;
    const planAfter = event.data.after.data() as Plan;
    const { facilityId } = event.params;
    const planId = event.data.after.id;
    const db = getFirestore();

    const servicesBefore = new Set(planBefore.services.map((s) => s.serviceId));
    const servicesAfter = new Set(planAfter.services.map((s) => s.serviceId));

    const servicesAdded = [...servicesAfter].filter((s) => !servicesBefore.has(s));
    const servicesRemoved = [...servicesBefore].filter((s) => !servicesAfter.has(s));

    const batch = db.batch();

    servicesAdded.forEach((serviceId) => {
      const serviceRef = db.doc(`facilities/${facilityId}/services/${serviceId}`);
      batch.update(serviceRef, {
        planIds: FieldValue.arrayUnion(planId),
      });
    });

    servicesRemoved.forEach((serviceId) => {
      const serviceRef = db.doc(`facilities/${facilityId}/services/${serviceId}`);
      batch.update(serviceRef, {
        planIds: FieldValue.arrayRemove(planId),
      });
    });

    await batch.commit();
  }
});

export const onPlanDelete = onDocumentDeleted(PLANS_PATH, async (event) => {
  if (event && event.data) {
    const plan = event.data.data() as Plan;
    const { facilityId } = event.params;
    const planId = event.data.id;
    const db = getFirestore();

    const batch = db.batch();

    plan.services.forEach((service) => {
      const serviceRef = db.doc(`facilities/${facilityId}/services/${service.serviceId}`);
      batch.update(serviceRef, {
        planIds: FieldValue.arrayRemove(planId),
      });
    });

    await batch.commit();
  }
});
