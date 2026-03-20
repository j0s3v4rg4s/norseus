import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { FACILITY_COLLECTION, EMPLOYEE_COLLECTION } from '@models/facility';
import { PROFILE_COLLECTION, type ProfileModel, Role } from '@models/user';
import {
  type CreateFacilityWithExistingAdminRequest,
  type CreateFacilityResponse,
} from '@models/super-admin';
import { requireSuperAdmin } from './guards';

const CreateFacilityExistingAdminSchema: z.ZodType<CreateFacilityWithExistingAdminRequest> = z.object({
  adminEmail: z.string().email(),
  facilityName: z.string().min(1).max(100),
});

export const createFacilityWithExistingAdmin = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Autenticacion requerida');
  }
  await requireSuperAdmin(request.auth.uid);

  const validation = CreateFacilityExistingAdminSchema.safeParse(request.data);
  if (!validation.success) {
    throw new HttpsError('invalid-argument', 'Datos de entrada invalidos');
  }

  const { adminEmail, facilityName } = validation.data;
  const db = getFirestore();
  const auth = getAuth();
  const timestamp = Timestamp.fromDate(new Date());

  try {
    // 1. Get existing user
    const userRecord = await auth.getUserByEmail(adminEmail);
    const uid = userRecord.uid;

    // 2. Ensure user has EMPLOYEE role in claims
    const currentClaims = userRecord.customClaims ?? {};
    const currentRoles = (currentClaims['roles'] as string[]) ?? [];
    if (!currentRoles.includes(Role.EMPLOYEE)) {
      await auth.setCustomUserClaims(uid, {
        ...currentClaims,
        roles: [...currentRoles, Role.EMPLOYEE],
      });
    }

    // 3. Get existing profile
    const profileDoc = await db.collection(PROFILE_COLLECTION).doc(uid).get();
    if (!profileDoc.exists) {
      throw new HttpsError('not-found', 'No se encontro el perfil del usuario');
    }
    const profileData = profileDoc.data() as ProfileModel;

    // 4. Create facility
    const facilityRef = db.collection(FACILITY_COLLECTION).doc();
    await facilityRef.set({
      createdAt: timestamp,
      name: facilityName,
      logo: null,
      logoIcon: null,
      admins: [uid],
    });

    // 5. Create employee (admin) in facility
    await facilityRef.collection(EMPLOYEE_COLLECTION).doc(uid).set({
      uid,
      joined: timestamp,
      roleId: null,
      isActive: true,
      profile: {
        createdAt: profileData.createdAt,
        name: profileData.name,
        email: profileData.email,
        img: profileData.img,
      },
    });

    const response: CreateFacilityResponse = {
      facilityId: facilityRef.id,
      adminUserId: uid,
    };
    return response;
  } catch (error) {
    if (error instanceof HttpsError) throw error;

    console.error('Error creating facility with existing admin:', error);
    throw new HttpsError('internal', 'Error al crear la instalacion');
  }
});
