import {
  type Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';

import {
  type ServiceSchedule,
  SERVICES_COLLECTION,
  SCHEDULES_COLLECTION,
} from '@models/services';
import { FACILITY_COLLECTION } from '@models/facility';

/**
 * Retrieves all schedules for a given service.
 */
export async function getSchedules(
  db: Firestore,
  facilityId: string,
  serviceId: string
): Promise<ServiceSchedule[]> {
  const ref = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    SERVICES_COLLECTION,
    serviceId,
    SCHEDULES_COLLECTION
  );
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(
    (d) => ({ ...d.data(), id: d.id }) as ServiceSchedule
  );
}

/**
 * Creates a single schedule for a given service. Returns the new schedule ID.
 */
export async function createSchedule(
  db: Firestore,
  facilityId: string,
  serviceId: string,
  schedule: Omit<ServiceSchedule, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const colRef = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    SERVICES_COLLECTION,
    serviceId,
    SCHEDULES_COLLECTION
  );
  const newRef = doc(colRef);
  const now = Timestamp.now();
  await setDoc(newRef, { ...schedule, id: newRef.id, createdAt: now, updatedAt: now });
  return newRef.id;
}

/**
 * Creates multiple schedules for a given service in parallel.
 */
export async function createSchedules(
  db: Firestore,
  facilityId: string,
  serviceId: string,
  schedules: Omit<ServiceSchedule, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  const colRef = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    SERVICES_COLLECTION,
    serviceId,
    SCHEDULES_COLLECTION
  );
  await Promise.all(
    schedules.map((schedule) => {
      const newRef = doc(colRef);
      const now = Timestamp.now();
      return setDoc(newRef, { ...schedule, id: newRef.id, createdAt: now, updatedAt: now });
    })
  );
}

/**
 * Deletes a schedule from a given service.
 */
export async function deleteSchedule(
  db: Firestore,
  facilityId: string,
  serviceId: string,
  scheduleId: string
): Promise<void> {
  const ref = doc(
    db,
    FACILITY_COLLECTION,
    facilityId,
    SERVICES_COLLECTION,
    serviceId,
    SCHEDULES_COLLECTION,
    scheduleId
  );
  await deleteDoc(ref);
}
