import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { SCHEDULES_COLLECTION, SERVICES_COLLECTION } from '@models/services';
import { FACILITY_COLLECTION } from '@models/facility';

/**
 * Cloud Function that triggers when a service document is deleted.
 * This function deletes all schedule documents in the service's schedules subcollection
 * to prevent orphaned schedule documents.
 *
 * Trigger: Firestore document deletion on {FACILITY_COLLECTION}/{facilityId}/{SERVICES_COLLECTION}/{serviceId}
 */
export const deleteServiceSchedules = onDocumentDeleted(
  `${FACILITY_COLLECTION}/{facilityId}/${SERVICES_COLLECTION}/{serviceId}`,
  async (event) => {
    const { facilityId, serviceId } = event.params;
    const db = getFirestore();

    try {
      const schedulesRef = db
        .collection(FACILITY_COLLECTION)
        .doc(facilityId)
        .collection(SERVICES_COLLECTION)
        .doc(serviceId)
        .collection(SCHEDULES_COLLECTION);

      await db.recursiveDelete(schedulesRef);
    } catch (error) {
      console.error(`Error deleting schedules for service ${serviceId}:`, error);
      throw error;
    }
  },
);
