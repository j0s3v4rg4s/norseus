import { Timestamp } from 'firebase/firestore';
import { ProfileModel } from '../../user';

/**
 * Client interface representing a client in a facility
 * Path: facilities/{facilityId}/clients/{uid}
 */
export interface ClientModel {
  joined: Timestamp;
  isActive: boolean;
  profile: ProfileModel;
}
