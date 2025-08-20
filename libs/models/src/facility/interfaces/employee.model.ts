import { Timestamp } from 'firebase/firestore';
import { ProfileModel } from '../../user';

/**
 * Employee interface representing an employee in a facility
 * Path: facilities/{facilityId}/employees/{uid}
 */
export interface EmployeeModel {
  joined: Timestamp;
  roleId: string | null;
  isAdmin: boolean;
  profile: ProfileModel;
}
