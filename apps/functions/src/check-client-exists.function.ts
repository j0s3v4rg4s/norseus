import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth, FirebaseAuthError } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {
  PROFILE_COLLECTION,
  ProfileModel,
  CheckClientExistsRequest,
  CheckClientExistsResponse,
} from '@models/user';
import { z } from 'zod';

const CheckClientExistsSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const checkClientExists = onCall(async (request): Promise<CheckClientExistsResponse> => {
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
