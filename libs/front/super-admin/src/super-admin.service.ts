import { type Functions, httpsCallable } from 'firebase/functions';
import {
  type Firestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { type FacilityModel, FACILITY_COLLECTION } from '@models/facility';
import { type ProfileModel, SUPER_ADMIN_COLLECTION } from '@models/user';
import {
  type CreateFacilityRequest,
  type CreateFacilityResponse,
  type CreateSuperAdminRequest,
  type CreateSuperAdminResponse,
} from '@models/super-admin';

// -- Facilities --

export async function getAllFacilities(
  db: Firestore,
): Promise<FacilityModel[]> {
  const ref = collection(db, FACILITY_COLLECTION);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FacilityModel);
}

export async function createFacilityWithAdmin(
  functions: Functions,
  payload: CreateFacilityRequest,
): Promise<CreateFacilityResponse> {
  const fn = httpsCallable<CreateFacilityRequest, CreateFacilityResponse>(
    functions,
    'createFacilityWithAdmin',
  );
  const result = await fn(payload);
  return result.data;
}

export async function updateFacilityLogo(
  db: Firestore,
  facilityId: string,
  logoUrl: string,
): Promise<void> {
  const facilityRef = doc(db, FACILITY_COLLECTION, facilityId);
  await updateDoc(facilityRef, { logo: logoUrl });
}

export async function updateFacilityImages(
  db: Firestore,
  facilityId: string,
  images: { logo?: string; logoIcon?: string },
): Promise<void> {
  const facilityRef = doc(db, FACILITY_COLLECTION, facilityId);
  await updateDoc(facilityRef, images);
}

// -- Super Admins --

export async function createSuperAdmin(
  functions: Functions,
  payload: CreateSuperAdminRequest,
): Promise<CreateSuperAdminResponse> {
  const fn = httpsCallable<CreateSuperAdminRequest, CreateSuperAdminResponse>(
    functions,
    'createSuperAdmin',
  );
  const result = await fn(payload);
  return result.data;
}

export async function getAllSuperAdmins(db: Firestore): Promise<ProfileModel[]> {
  const ref = collection(db, SUPER_ADMIN_COLLECTION);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ProfileModel);
}
