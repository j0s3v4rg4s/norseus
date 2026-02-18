import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';
import { UpdateEmployeeRequest, EMPLOYEE_COLLECTION, FACILITY_COLLECTION } from '@models/facility';
import { PROFILE_COLLECTION } from '@models/user';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { checkUserPermission } from './utilities/permissions';

const UpdateEmployeeSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  facilityId: z.string().min(1, 'Facility ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  roleId: z.string().min(1, 'Role ID is required'),
  isActive: z.boolean(),
});

export const updateEmployee = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('permission-denied', 'Authentication required');
  }

  const validationResult = UpdateEmployeeSchema.safeParse(request.data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new HttpsError('invalid-argument', `Validation failed: ${errors}`);
  }

  const data = validationResult.data as UpdateEmployeeRequest;
  const db = getFirestore();
  const auth = getAuth();
  const currentUserId = request.auth.uid;

  const hasPermission = await checkUserPermission(
    db,
    data.facilityId,
    currentUserId,
    PermissionSection.EMPLOYEES,
    PermissionAction.UPDATE,
  );
  if (!hasPermission) {
    throw new HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    await auth.updateUser(data.userId, { disabled: !data.isActive });

    const employeeRef = db
      .collection(FACILITY_COLLECTION)
      .doc(data.facilityId)
      .collection(EMPLOYEE_COLLECTION)
      .doc(data.userId);

    await employeeRef.update({
      'profile.name': data.name,
      roleId: data.roleId,
      isActive: data.isActive,
    });

    await db.collection(PROFILE_COLLECTION).doc(data.userId).update({
      name: data.name,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Failed to update employee');
  }
});
