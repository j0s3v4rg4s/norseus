import { Timestamp } from 'firebase/firestore';

/**
 * Profile interface representing a user profile in Firestore
 * Path: profiles/{uid}
 */
export interface ProfileModel {
  createdAt: Timestamp;
  name: string;
  img: string | null;
}
