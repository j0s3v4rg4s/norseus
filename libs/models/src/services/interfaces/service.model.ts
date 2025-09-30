import { Timestamp } from 'firebase/firestore';

/**
 * Service interface representing a service offered at a facility
 *
 * Firestore path: facilities/{facilityId}/services/{serviceId}
 */
export interface Service {
  /** Unique identifier for the service */
  id: string;

  /** Name of the service */
  name: string;

  /** Optional description of the service */
  description?: string;

  /** Whether the service is currently active */
  isActive: boolean;

  /** Timestamp when the service was created */
  createdAt: Timestamp;

  /** Timestamp when the service was last updated */
  updatedAt: Timestamp;
}

