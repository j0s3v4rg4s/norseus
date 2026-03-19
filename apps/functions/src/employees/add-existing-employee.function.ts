import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { AddExistingEmployeeRequest, EMPLOYEE_COLLECTION, FACILITY_COLLECTION } from '@models/facility';
import { PROFILE_COLLECTION, Role } from '@models/user';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { z } from 'zod';
import { checkUserPermission } from '../utilities/permissions';
import { createEmployeeDocument, addFacilityAdmin, type ProfileModelForAdmin } from './employee.utils';

const AddExistingEmployeeSchema = z.object({
  email: z.email('Invalid email format'),
  roleId: z.string().min(1, 'Role ID is required'),
  facilityId: z.string().min(1, 'Facility ID is required'),
  isAdmin: z.boolean().default(false),
});

export const addExistingEmployee = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('permission-denied', 'No have permission');
  }

  const validationResult = AddExistingEmployeeSchema.safeParse(request.data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new HttpsError('invalid-argument', `Validation failed: ${errors}`);
  }

  const data: AddExistingEmployeeRequest = validationResult.data;
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
    const userRecord = await auth.getUserByEmail(data.email);
    const uid = userRecord.uid;

    // Check if already an employee in this facility
    const existingEmployee = await db
      .collection(FACILITY_COLLECTION)
      .doc(data.facilityId)
      .collection(EMPLOYEE_COLLECTION)
      .doc(uid)
      .get();

    if (existingEmployee.exists) {
      throw new HttpsError('already-exists', 'Este usuario ya es empleado de esta instalación.');
    }

    const profileDoc = await db.collection(PROFILE_COLLECTION).doc(uid).get();
    if (!profileDoc.exists) {
      throw new HttpsError('not-found', 'No se encontró el perfil del usuario.');
    }
    const profileData = profileDoc.data() as ProfileModelForAdmin;

    // Add EMPLOYEE role to claims if not present
    const currentClaims = userRecord.customClaims ?? {};
    const currentRoles = (currentClaims['roles'] as string[]) ?? [];
    if (!currentRoles.includes(Role.EMPLOYEE)) {
      await auth.setCustomUserClaims(uid, {
        ...currentClaims,
        roles: [...currentRoles, Role.EMPLOYEE],
      });
    }

    await createEmployeeDocument(db, data.facilityId, uid, data.roleId, profileData);

    if (data.isAdmin) {
      await addFacilityAdmin(db, data.facilityId, uid);
    }

    return { success: true, userId: uid };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error('Error adding existing employee:', error);
    throw new HttpsError('internal', 'Error al agregar el empleado.');
  }
});
