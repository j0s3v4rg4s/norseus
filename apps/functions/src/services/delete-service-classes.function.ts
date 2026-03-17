import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { SERVICES_COLLECTION } from '@models/services';
import { FACILITY_COLLECTION } from '@models/facility';
import { CLASSES_COLLECTION } from '@models/classes';

export const deleteServiceClasses = onDocumentDeleted(
  `${FACILITY_COLLECTION}/{facilityId}/${SERVICES_COLLECTION}/{serviceId}`,
  async (event) => {
    const { facilityId, serviceId } = event.params;
    const db = getFirestore();

    try {
      const classesSnapshot = await db
        .collection(FACILITY_COLLECTION)
        .doc(facilityId)
        .collection(CLASSES_COLLECTION)
        .where('serviceId', '==', serviceId)
        .get();

      if (classesSnapshot.empty) return;

      const batch = db.batch();
      classesSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      console.error(`Error deleting classes for service ${serviceId}:`, error);
      throw error;
    }
  },
);
