import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth, FirebaseAuthError } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { CreateEmployeeRequest, FACILITY_COLLECTION } from '@models/facility';
import { PROFILE_COLLECTION, Role } from '@models/user';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { z } from 'zod';
import { checkUserPermission } from '../utilities/permissions';
import { createEmployeeDocument, addFacilityAdmin, type ProfileModelForAdmin } from './employee.utils';

const CreateEmployeeSchema = z.object({
  email: z.email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  roleId: z.string().min(1, 'Role ID is required'),
  facilityId: z.string().min(1, 'Facility ID is required'),
  isAdmin: z.boolean().default(false),
});

export const createEmployee = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('permission-denied', 'No have permission');
  }

  const validationResult = CreateEmployeeSchema.safeParse(request.data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new HttpsError('invalid-argument', `Validation failed: ${errors}`);
  }

  const data: CreateEmployeeRequest = validationResult.data;
  const db = getFirestore();
  const auth = getAuth();

  const hasPermission = await checkUserPermission(
    db,
    data.facilityId,
    request.auth.uid,
    PermissionSection.EMPLOYEES,
    PermissionAction.CREATE,
  );
  if (!hasPermission) {
    throw new HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    const userRecord = await auth.createUser({
      email: data.email,
      displayName: data.name,
      emailVerified: false,
    });

    await auth.setCustomUserClaims(userRecord.uid, { roles: [Role.EMPLOYEE] });
    const timestamp = Timestamp.fromDate(new Date());

    const profileData: ProfileModelForAdmin = {
      id: userRecord.uid,
      createdAt: timestamp,
      name: data.name,
      email: data.email,
      img: null,
    };
    await db.collection(PROFILE_COLLECTION).doc(userRecord.uid).set(profileData);

    await createEmployeeDocument(db, data.facilityId, userRecord.uid, data.roleId, profileData);

    if (data.isAdmin) {
      await addFacilityAdmin(db, data.facilityId, userRecord.uid);
    }

    const passwordResetLink = await auth.generatePasswordResetLink(data.email);
    console.log('Password reset link:', passwordResetLink);

    return { success: true, userId: userRecord.uid };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    if (error instanceof FirebaseAuthError && error.code === 'auth/email-already-exists') {
      throw new HttpsError('already-exists', 'El correo electronico ya esta en uso por otra cuenta.');
    }
    console.error('Error creating employee:', error);
    throw new HttpsError('internal', 'Error al crear el empleado.');
  }
});
