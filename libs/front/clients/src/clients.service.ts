import {
  type Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { type Functions, httpsCallable } from 'firebase/functions';
import {
  CLIENT_COLLECTION,
  FACILITY_COLLECTION,
  type ClientModel,
} from '@models/facility';
import type {
  CheckClientExistsRequest,
  CheckClientExistsResponse,
  CreateClientRequest,
  CreateClientResponse,
} from '@models/user';

/**
 * Retrieves all clients for a given facility.
 */
export async function getClients(
  db: Firestore,
  facilityId: string
): Promise<ClientModel[]> {
  const clientsRef = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    CLIENT_COLLECTION
  );
  const snapshot = await getDocs(clientsRef);
  return snapshot.docs.map((d) => d.data() as ClientModel);
}

/**
 * Retrieves a single client by ID from a facility.
 */
export async function getClient(
  db: Firestore,
  facilityId: string,
  clientId: string
): Promise<ClientModel | undefined> {
  const clientRef = doc(
    db,
    FACILITY_COLLECTION,
    facilityId,
    CLIENT_COLLECTION,
    clientId
  );
  const snapshot = await getDoc(clientRef);
  return snapshot.exists() ? (snapshot.data() as ClientModel) : undefined;
}

/**
 * Deletes a client from a facility.
 */
export async function deleteClient(
  db: Firestore,
  facilityId: string,
  clientId: string
): Promise<void> {
  const clientRef = doc(
    db,
    FACILITY_COLLECTION,
    facilityId,
    CLIENT_COLLECTION,
    clientId
  );
  await deleteDoc(clientRef);
}

/**
 * Toggles the active status of a client.
 */
export async function toggleClientStatus(
  db: Firestore,
  facilityId: string,
  clientId: string,
  isActive: boolean
): Promise<void> {
  const clientRef = doc(
    db,
    FACILITY_COLLECTION,
    facilityId,
    CLIENT_COLLECTION,
    clientId
  );
  await updateDoc(clientRef, { isActive });
}

/**
 * Checks if a user with the given email already exists.
 */
export async function checkClientExists(
  functions: Functions,
  payload: CheckClientExistsRequest
): Promise<CheckClientExistsResponse> {
  const checkClientExistsFn = httpsCallable<
    CheckClientExistsRequest,
    CheckClientExistsResponse
  >(functions, 'checkClientExists');
  const result = await checkClientExistsFn(payload);
  return result.data;
}

/**
 * Creates a new client (or associates an existing user) via the createClient Cloud Function.
 */
export async function createClient(
  functions: Functions,
  payload: CreateClientRequest
): Promise<CreateClientResponse> {
  const createClientFn = httpsCallable<CreateClientRequest, CreateClientResponse>(
    functions,
    'createClient'
  );
  const result = await createClientFn(payload);
  return result.data;
}
