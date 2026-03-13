/**
 * Request payload for booking a class.
 * Used by the bookClass Cloud Function.
 */
export interface BookClassRequest {
  classId: string;
  facilityId: string;
  subscriptionId: string;
}

/**
 * Response payload for booking a class.
 * Used by the bookClass Cloud Function.
 */
export interface BookClassResponse {
  success: boolean;
  bookingId: string;
  message: string;
}
