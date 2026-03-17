import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { PROFILE_COLLECTION, SUPER_ADMIN_COLLECTION, Role } from '@models/user';
import {
  type CreateSuperAdminRequest,
  type CreateSuperAdminResponse,
} from '@models/super-admin';
import { requireSuperAdmin } from './guards';

const CreateSuperAdminSchema: z.ZodType<CreateSuperAdminRequest> = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export const createSuperAdmin = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Autenticacion requerida');
  }
  await requireSuperAdmin(request.auth.uid);

  const validation = CreateSuperAdminSchema.safeParse(request.data);
  if (!validation.success) {
    throw new HttpsError('invalid-argument', 'Datos de entrada invalidos');
  }

  const { email, name } = validation.data;
  const db = getFirestore();
  const auth = getAuth();

  try {
    const userRecord = await auth.createUser({
      email,
      displayName: name,
      emailVerified: false,
    });

    await auth.setCustomUserClaims(userRecord.uid, { roles: [Role.SUPER_ADMIN] });

    const timestamp = Timestamp.fromDate(new Date());
    const profileData = {
      createdAt: timestamp,
      name,
      email,
      img: null,
    };

    await db.collection(PROFILE_COLLECTION).doc(userRecord.uid).set(profileData);
    await db.collection(SUPER_ADMIN_COLLECTION).doc(userRecord.uid).set(profileData);

    await auth.generatePasswordResetLink(email);

    const response: CreateSuperAdminResponse = { userId: userRecord.uid };
    return response;
  } catch (error) {
    if (error instanceof HttpsError) throw error;

    const errMsg = error instanceof Error ? error.message : '';
    if (errMsg.includes('email-already-exists')) {
      throw new HttpsError('already-exists', 'El correo electronico ya esta en uso');
    }

    console.error('Error creating super admin:', error);
    throw new HttpsError('internal', 'Error al crear el super administrador');
  }
});
