import {
  type Firestore,
  collection,
  getDocs,
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
} from '@models/user';

/**
 * Request payload for creating a client via the createClient Cloud Function.
 */
export interface CreateClientRequest {
  email: string;
  name: string;
  facilityId: string;
}

/**
 * Response payload from the createClient Cloud Function.
 */
export interface CreateClientResponse {
  success: boolean;
  uid: string;
  passwordResetLink?: string;
  message: string;
}

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
