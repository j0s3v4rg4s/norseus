export interface CreateSubscriptionRequest {
  facilityId: string;
  clientId: string;
  planId: string;
  startDate: string;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  subscriptionId: string;
  message: string;
}
