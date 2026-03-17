import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { FACILITY_COLLECTION, EMPLOYEE_COLLECTION } from '@models/facility';
import { PROFILE_COLLECTION, Role } from '@models/user';
import {
  type CreateFacilityRequest,
  type CreateFacilityResponse,
} from '@models/super-admin';
import { requireSuperAdmin } from './guards';

const CreateFacilitySchema: z.ZodType<CreateFacilityRequest> = z.object({
  adminEmail: z.string().email(),
  adminName: z.string().min(1).max(100),
  facilityName: z.string().min(1).max(100),
});

export const createFacilityWithAdmin = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Autenticacion requerida');
  }
  await requireSuperAdmin(request.auth.uid);

  const validation = CreateFacilitySchema.safeParse(request.data);
  if (!validation.success) {
    throw new HttpsError('invalid-argument', 'Datos de entrada invalidos');
  }

  const { adminEmail, adminName, facilityName } = validation.data;
  const db = getFirestore();
  const auth = getAuth();
  const timestamp = Timestamp.fromDate(new Date());

  try {
    // 1. Create admin user
    const userRecord = await auth.createUser({
      email: adminEmail,
      displayName: adminName,
      emailVerified: false,
    });
    await auth.setCustomUserClaims(userRecord.uid, { roles: [Role.ADMIN] });

    // 2. Create profile
    const profileData = {
      createdAt: timestamp,
      name: adminName,
      email: adminEmail,
      img: null,
    };
    await db.collection(PROFILE_COLLECTION).doc(userRecord.uid).set(profileData);

    // 3. Create facility
    const facilityRef = db.collection(FACILITY_COLLECTION).doc();
    await facilityRef.set({
      createdAt: timestamp,
      name: facilityName,
      logo: null,
    });

    // 4. Create employee (admin) in facility
    await facilityRef.collection(EMPLOYEE_COLLECTION).doc(userRecord.uid).set({
      uid: userRecord.uid,
      joined: timestamp,
      roleId: null,
      isAdmin: true,
      isActive: true,
      profile: profileData,
    });

    // 5. Generate password reset link for the new admin
    await auth.generatePasswordResetLink(adminEmail);

    const response: CreateFacilityResponse = {
      facilityId: facilityRef.id,
      adminUserId: userRecord.uid,
    };
    return response;
  } catch (error) {
    if (error instanceof HttpsError) throw error;

    const errMsg = error instanceof Error ? error.message : '';
    if (errMsg.includes('email-already-exists')) {
      throw new HttpsError('already-exists', 'El correo electronico ya esta en uso');
    }

    console.error('Error creating facility:', error);
    throw new HttpsError('internal', 'Error al crear la instalacion');
  }
});
