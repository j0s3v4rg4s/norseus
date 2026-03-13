/**
 * Request payload for creating a client
 * Used by createClient Cloud Function
 */
export interface CreateClientRequest {
  email: string;
  name: string;
  facilityId: string;
}

/**
 * Response payload for creating a client
 * Used by createClient Cloud Function
 */
export interface CreateClientResponse {
  success: boolean;
  uid: string;
  message: string;
}
