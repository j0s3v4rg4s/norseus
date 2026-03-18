import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth, FirebaseAuthError } from 'firebase-admin/auth';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { CreateEmployeeRequest, EMPLOYEE_COLLECTION, EmployeeModel, FACILITY_COLLECTION } from '@models/facility';
import { PROFILE_COLLECTION, ProfileModel, Role } from '@models/user';
import { PermissionSection, PermissionAction } from '@models/permissions';

type ProfileModelForAdmin = Omit<ProfileModel, 'createdAt'> & {
  createdAt: Timestamp;
};

type EmployeeModelForAdmin = Omit<EmployeeModel, 'joined' | 'profile'> & {
  joined: Timestamp;
  profile: ProfileModelForAdmin;
};
import { z } from 'zod';
import { checkUserPermission } from '../utilities/permissions';

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
  const currentUserId = request.auth.uid;

  const hasPermission = await checkUserPermission(
    db,
    data.facilityId,
    currentUserId,
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

    const employeeData: EmployeeModelForAdmin = {
      uid: userRecord.uid,
      joined: timestamp,
      roleId: data.roleId,
      isActive: true,
      profile: profileData,
    };
    await db
      .collection(FACILITY_COLLECTION)
      .doc(data.facilityId)
      .collection(EMPLOYEE_COLLECTION)
      .doc(userRecord.uid)
      .set(employeeData);

    if (data.isAdmin) {
      await db
        .collection(FACILITY_COLLECTION)
        .doc(data.facilityId)
        .update({ admins: FieldValue.arrayUnion(userRecord.uid) });
    }

    auth.generatePasswordResetLink(data.email);

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
