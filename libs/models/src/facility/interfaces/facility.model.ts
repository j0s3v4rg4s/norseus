import { Timestamp } from 'firebase/firestore';

/**
 * Facility interface representing a facility in Firestore
 * Path: facilities/{facilityId}
 */
export interface FacilityModel {
  id?: string;
  createdAt: Timestamp;
  name: string;
  logo: string | null;
}
