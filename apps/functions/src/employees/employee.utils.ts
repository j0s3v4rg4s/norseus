import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { EMPLOYEE_COLLECTION, EmployeeModel, FACILITY_COLLECTION } from '@models/facility';
import { ProfileModel } from '@models/user';

type ProfileModelForAdmin = Omit<ProfileModel, 'createdAt'> & {
  createdAt: Timestamp;
};

type EmployeeModelForAdmin = Omit<EmployeeModel, 'joined' | 'profile'> & {
  joined: Timestamp;
  profile: ProfileModelForAdmin;
};

export type { ProfileModelForAdmin, EmployeeModelForAdmin };

export async function createEmployeeDocument(
  db: FirebaseFirestore.Firestore,
  facilityId: string,
  uid: string,
  roleId: string,
  profileData: ProfileModelForAdmin,
): Promise<void> {
  const timestamp = Timestamp.fromDate(new Date());
  const employeeData: EmployeeModelForAdmin = {
    uid,
    joined: timestamp,
    roleId,
    isActive: true,
    profile: profileData,
  };
  await db
    .collection(FACILITY_COLLECTION)
    .doc(facilityId)
    .collection(EMPLOYEE_COLLECTION)
    .doc(uid)
    .set(employeeData);
}

export async function addFacilityAdmin(
  db: FirebaseFirestore.Firestore,
  facilityId: string,
  uid: string,
): Promise<void> {
  await db
    .collection(FACILITY_COLLECTION)
    .doc(facilityId)
    .update({ admins: FieldValue.arrayUnion(uid) });
}
