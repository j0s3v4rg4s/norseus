import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth, FirebaseAuthError } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {
  PROFILE_COLLECTION,
  ProfileModel,
  CheckClientExistsRequest,
  CheckClientExistsResponse,
} from '@models/user';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { checkUserPermission } from './utilities/permissions';
import { z } from 'zod';

const CheckClientExistsSchema = z.object({
  email: z.string().email('Invalid email format'),
  facilityId: z.string().min(1, 'Facility ID is required'),
});

export const checkClientExists = onCall(async (request): Promise<CheckClientExistsResponse> => {
  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const validationResult = CheckClientExistsSchema.safeParse(request.data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new HttpsError('invalid-argument', `Validation failed: ${errors}`);
  }

  const data: CheckClientExistsRequest = validationResult.data;
  const db = getFirestore();
  const auth = getAuth();

  // 2. Validate user belongs to requested facilityId and has permission
  const hasPermission = await checkUserPermission(
    db,
    data.facilityId,
    request.auth.uid,
    PermissionSection.CLIENTS,
    PermissionAction.READ,
  );

  if (!hasPermission) {
    throw new HttpsError(
      'permission-denied',
      'You do not have permission to check clients in this facility',
    );
  }

  try {
    // Try to get user by email from Firebase Auth
    const userRecord = await auth.getUserByEmail(data.email);

    // User exists, fetch their profile from Firestore
    const profileDoc = await db.collection(PROFILE_COLLECTION).doc(userRecord.uid).get();

    if (profileDoc.exists) {
      const profileData = profileDoc.data() as ProfileModel;
      return {
        exists: true,
        uid: userRecord.uid,
        profile: profileData,
      };
    }

    // User exists in Auth but not in Firestore (edge case)
    return {
      exists: true,
      uid: userRecord.uid,
    };
  } catch (error) {
    // Handle user not found case
    if (error instanceof FirebaseAuthError && error.code === 'auth/user-not-found') {
      return {
        exists: false,
      };
    }

    // Handle other errors
    console.error('Error checking client existence:', error);
    throw new HttpsError('internal', 'Error checking client existence');
  }
});
