import {
  type Firestore,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

import { type ClassModel, CLASSES_COLLECTION } from '@models/classes';
import { FACILITY_COLLECTION } from '@models/facility';

/**
 * Retrieves all classes for a given service.
 */
export async function getClassesByService(
  db: Firestore,
  facilityId: string,
  serviceId: string
): Promise<ClassModel[]> {
  const colRef = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    CLASSES_COLLECTION
  );
  const q = query(colRef, where('serviceId', '==', serviceId), orderBy('date', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ ...d.data(), id: d.id }) as ClassModel
  );
}

/**
 * Creates multiple classes in Firestore. Returns the created class IDs.
 */
export async function createMultipleClasses(
  db: Firestore,
  facilityId: string,
  classes: Omit<ClassModel, 'id'>[]
): Promise<string[]> {
  const colRef = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    CLASSES_COLLECTION
  );
  const classIds: string[] = [];

  for (const classData of classes) {
    const newRef = doc(colRef);
    await setDoc(newRef, { ...classData, id: newRef.id });
    classIds.push(newRef.id);
  }

  return classIds;
}
