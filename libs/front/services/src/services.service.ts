import {
  type Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';

import { type Service, SERVICES_COLLECTION } from '@models/services';
import { FACILITY_COLLECTION } from '@models/facility';
import { type ServiceSchedule, SCHEDULES_COLLECTION } from '@models/services';

/**
 * Retrieves all services for a given facility.
 */
export async function getServices(
  db: Firestore,
  facilityId: string
): Promise<Service[]> {
  const ref = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    SERVICES_COLLECTION
  );
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Service);
}

/**
 * Retrieves a single service by ID from a given facility.
 */
export async function getService(
  db: Firestore,
  facilityId: string,
  serviceId: string
): Promise<Service | undefined> {
  const ref = doc(
    db,
    FACILITY_COLLECTION,
    facilityId,
    SERVICES_COLLECTION,
    serviceId
  );
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return undefined;
  return { ...snapshot.data(), id: snapshot.id } as Service;
}

/**
 * Creates a new service for a given facility. Returns the new service ID.
 */
export async function createService(
  db: Firestore,
  facilityId: string,
  data: Pick<Service, 'name' | 'description'>
): Promise<string> {
  const colRef = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    SERVICES_COLLECTION
  );
  const newRef = doc(colRef);
  const now = Timestamp.now();
  await setDoc(newRef, {
    id: newRef.id,
    name: data.name,
    description: data.description ?? '',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  return newRef.id;
}

/**
 * Creates a service and all its schedules in a single batch operation.
 * Returns the new service ID.
 */
export async function createServiceWithSchedules(
  db: Firestore,
  facilityId: string,
  data: Pick<Service, 'name' | 'description'>,
  schedules: Omit<ServiceSchedule, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<string> {
  const serviceId = await createService(db, facilityId, data);
  if (schedules.length > 0) {
    const schedulesColRef = collection(
      db,
      FACILITY_COLLECTION,
      facilityId,
      SERVICES_COLLECTION,
      serviceId,
      SCHEDULES_COLLECTION
    );
    await Promise.all(
      schedules.map((schedule) => {
        const schedRef = doc(schedulesColRef);
        const now = Timestamp.now();
        return setDoc(schedRef, {
          ...schedule,
          id: schedRef.id,
          createdAt: now,
          updatedAt: now,
        });
      })
    );
  }
  return serviceId;
}

/**
 * Updates an existing service for a given facility.
 */
export async function updateService(
  db: Firestore,
  facilityId: string,
  serviceId: string,
  data: Partial<Pick<Service, 'name' | 'description' | 'isActive'>>
): Promise<void> {
  const ref = doc(
    db,
    FACILITY_COLLECTION,
    facilityId,
    SERVICES_COLLECTION,
    serviceId
  );
  await updateDoc(ref, { ...data, updatedAt: Timestamp.now() });
}

/**
 * Deletes a service from the specified facility.
 */
export async function deleteService(
  db: Firestore,
  facilityId: string,
  serviceId: string
): Promise<void> {
  const ref = doc(
    db,
    FACILITY_COLLECTION,
    facilityId,
    SERVICES_COLLECTION,
    serviceId
  );
  await deleteDoc(ref);
}
