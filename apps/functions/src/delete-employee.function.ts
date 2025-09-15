import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { DeleteEmployeeRequest, EMPLOYEE_COLLECTION, FACILITY_COLLECTION } from '@models/facility';
import { PermissionSection, PermissionAction } from '@models/permissions';
import { checkUserPermission, isFacilityEmployee } from './utilities/permissions';
import { z } from 'zod';

const DeleteEmployeeSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  facilityId: z.string().min(1, 'Facility ID is required'),
});

export const deleteEmployee = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('permission-denied', 'Authentication required');
  }

  const validationResult = DeleteEmployeeSchema.safeParse(request.data);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new HttpsError('invalid-argument', `Validation failed: ${errors}`);
  }

  const { userId, facilityId } = validationResult.data as DeleteEmployeeRequest;
  const db = getFirestore();
  const currentUserId = request.auth.uid;

  try {
    const isEmployee = await isFacilityEmployee(db, facilityId, currentUserId);
    if (!isEmployee) {
      throw new HttpsError('permission-denied', 'User is not an employee of this facility');
    }

    const hasPermission = await checkUserPermission(
      db,
      facilityId,
      currentUserId,
      PermissionSection.EMPLOYEES,
      PermissionAction.DELETE,
    );
    if (!hasPermission) {
      throw new HttpsError('permission-denied', 'Insufficient permissions');
    }

    const employeeRef = db.collection(FACILITY_COLLECTION).doc(facilityId).collection(EMPLOYEE_COLLECTION).doc(userId);

    if (userId === currentUserId) {
      throw new HttpsError('invalid-argument', 'Cannot delete yourself');
    }

    await employeeRef.delete();
    return { success: true, message: 'Employee deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting employee:', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', 'Failed to delete employee: ' + error.message);
  }
});
