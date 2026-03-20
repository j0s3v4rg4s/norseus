export interface CheckUserExistsRequest {
  email: string;
}

export interface CheckUserExistsResponse {
  exists: boolean;
  uid?: string;
  name?: string;
}

export interface CreateFacilityRequest {
  adminEmail: string;
  adminName: string;
  facilityName: string;
}

export interface CreateFacilityWithExistingAdminRequest {
  adminEmail: string;
  facilityName: string;
}

export interface CreateFacilityResponse {
  facilityId: string;
  adminUserId: string;
}

export interface CreateSuperAdminRequest {
  email: string;
  name: string;
}

export interface CreateSuperAdminResponse {
  userId: string;
}
