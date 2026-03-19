import { ProfileModel } from './profile.model';

export interface CheckEmployeeExistsRequest {
  email: string;
  facilityId: string;
}

export interface CheckEmployeeExistsResponse {
  exists: boolean;
  uid?: string;
  profile?: ProfileModel;
}
