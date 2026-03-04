import {
  type Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

import { type Plan, PLANS_COLLECTION } from '@models/plans';
import { FACILITY_COLLECTION } from '@models/facility';

/**
 * Retrieves all plans for a given facility.
 */
export async function getPlans(
  db: Firestore,
  facilityId: string
): Promise<Plan[]> {
  const ref = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    PLANS_COLLECTION
  );
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Plan);
}

/**
 * Retrieves a single plan by ID from a given facility.
 */
export async function getPlan(
  db: Firestore,
  facilityId: string,
  planId: string
): Promise<Plan | undefined> {
  const ref = doc(
    db,
    FACILITY_COLLECTION,
    facilityId,
    PLANS_COLLECTION,
    planId
  );
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return undefined;
  return { ...snapshot.data(), id: snapshot.id } as Plan;
}

/**
 * Creates a new plan for a given facility. Returns the new plan ID.
 */
export async function createPlan(
  db: Firestore,
  facilityId: string,
  data: Omit<Plan, 'id'>
): Promise<string> {
  const colRef = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    PLANS_COLLECTION
  );
  const newRef = doc(colRef);
  await setDoc(newRef, {
    ...data,
    id: newRef.id,
  });
  return newRef.id;
}

/**
 * Updates an existing plan for a given facility.
 */
export async function updatePlan(
  db: Firestore,
  facilityId: string,
  planId: string,
  data: Partial<Plan>
): Promise<void> {
  const ref = doc(
    db,
    FACILITY_COLLECTION,
    facilityId,
    PLANS_COLLECTION,
    planId
  );
  await updateDoc(ref, { ...data });
}

/**
 * Deletes a plan from the specified facility.
 */
export async function deletePlan(
  db: Firestore,
  facilityId: string,
  planId: string
): Promise<void> {
  const ref = doc(
    db,
    FACILITY_COLLECTION,
    facilityId,
    PLANS_COLLECTION,
    planId
  );
  await deleteDoc(ref);
}
