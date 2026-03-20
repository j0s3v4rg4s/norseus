import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth, FirebaseAuthError } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';
import { PROFILE_COLLECTION, type ProfileModel } from '@models/user';
import {
  type CheckUserExistsRequest,
  type CheckUserExistsResponse,
} from '@models/super-admin';
import { requireSuperAdmin } from './guards';

const CheckUserExistsSchema: z.ZodType<CheckUserExistsRequest> = z.object({
  email: z.string().email(),
});

export const checkUserExists = onCall(async (request): Promise<CheckUserExistsResponse> => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Autenticacion requerida');
  }
  await requireSuperAdmin(request.auth.uid);

  const validation = CheckUserExistsSchema.safeParse(request.data);
  if (!validation.success) {
    throw new HttpsError('invalid-argument', 'Datos de entrada invalidos');
  }

  const { email } = validation.data;
  const auth = getAuth();
  const db = getFirestore();

  try {
    const userRecord = await auth.getUserByEmail(email);

    const profileDoc = await db.collection(PROFILE_COLLECTION).doc(userRecord.uid).get();
    if (!profileDoc.exists) {
      return { exists: false };
    }

    const profileData = profileDoc.data() as ProfileModel;
    return {
      exists: true,
      uid: userRecord.uid,
      name: profileData.name,
    };
  } catch (error) {
    if (error instanceof FirebaseAuthError && error.code === 'auth/user-not-found') {
      return { exists: false };
    }

    console.error('Error checking user existence:', error);
    throw new HttpsError('internal', 'Error al verificar el usuario');
  }
});
