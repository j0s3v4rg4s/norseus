import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth, FirebaseAuthError } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {
  PROFILE_COLLECTION,
  ProfileModel,
  CheckEmployeeExistsRequest,
  CheckEmployeeExistsResponse,
} from '@models/user';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { checkUserPermission } from '../utilities/permissions';
import { z } from 'zod';

const CheckEmployeeExistsSchema = z.object({
  email: z.string().email('Invalid email format'),
  facilityId: z.string().min(1, 'Facility ID is required'),
});

export const checkEmployeeExists = onCall(async (request): Promise<CheckEmployeeExistsResponse> => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const validationResult = CheckEmployeeExistsSchema.safeParse(request.data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new HttpsError('invalid-argument', `Validation failed: ${errors}`);
  }

  const data: CheckEmployeeExistsRequest = validationResult.data;
  const db = getFirestore();
  const auth = getAuth();

  const hasPermission = await checkUserPermission(
    db,
    data.facilityId,
    request.auth.uid,
    PermissionSection.EMPLOYEES,
    PermissionAction.READ,
  );

  if (!hasPermission) {
    throw new HttpsError(
      'permission-denied',
      'You do not have permission to check employees in this facility',
    );
  }

  try {
    const userRecord = await auth.getUserByEmail(data.email);
    const profileDoc = await db.collection(PROFILE_COLLECTION).doc(userRecord.uid).get();

    if (profileDoc.exists) {
      const profileData = profileDoc.data() as ProfileModel;
      return {
        exists: true,
        uid: userRecord.uid,
        profile: profileData,
      };
    }

    return {
      exists: true,
      uid: userRecord.uid,
    };
  } catch (error) {
    if (error instanceof FirebaseAuthError && error.code === 'auth/user-not-found') {
      return {
        exists: false,
      };
    }

    console.error('Error checking employee existence:', error);
    throw new HttpsError('internal', 'Error checking employee existence');
  }
});
