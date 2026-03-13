/**
 * Request payload for cancelling a booking.
 * Used by the cancelBooking Cloud Function.
 */
export interface CancelBookingRequest {
  bookingId: string;
  facilityId: string;
}

/**
 * Response payload for cancelling a booking.
 * Used by the cancelBooking Cloud Function.
 */
export interface CancelBookingResponse {
  success: boolean;
  message: string;
}
