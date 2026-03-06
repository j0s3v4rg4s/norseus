import { ProfileModel } from './profile.model';

/**
 * Request interface for checking if a client exists
 * Used by checkClientExists Cloud Function
 */
export interface CheckClientExistsRequest {
  email: string;
}

/**
 * Response interface for checking if a client exists
 * Used by checkClientExists Cloud Function
 */
export interface CheckClientExistsResponse {
  exists: boolean;
  uid?: string;
  profile?: ProfileModel;
}
