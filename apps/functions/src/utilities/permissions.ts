import { EMPLOYEE_COLLECTION, FACILITY_COLLECTION, ROLE_COLLECTION } from '@models/facility';
import { EmployeeModel, FacilityModel } from '@models/facility';
import { PermissionSection, PermissionAction } from '@models/permissions';

/**
 * Check if the user is a facility admin by checking the facility's admins array
 */
export async function isFacilityAdminCheck(
  db: FirebaseFirestore.Firestore,
  facilityId: string,
  userId: string,
): Promise<boolean> {
  try {
    const facilityRef = db.collection(FACILITY_COLLECTION).doc(facilityId);
    const facilityDoc = await facilityRef.get();

    if (!facilityDoc.exists) {
      return false;
    }

    const facilityData = facilityDoc.data() as FacilityModel;
    return facilityData.admins?.includes(userId) ?? false;
  } catch (error) {
    console.error('Error checking facility admin:', error);
    return false;
  }
}

/**
 * Check if the user has a specific permission in a facility
 */
export async function checkUserPermission(
  db: FirebaseFirestore.Firestore,
  facilityId: string,
  userId: string,
  section: PermissionSection,
  permission: PermissionAction,
): Promise<boolean> {
  try {
    const isAdmin = await isFacilityAdminCheck(db, facilityId, userId);
    if (isAdmin) {
      return true;
    }

    const employeeRef = db
      .collection(FACILITY_COLLECTION)
      .doc(facilityId)
      .collection(EMPLOYEE_COLLECTION)
      .doc(userId);

    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      return false;
    }

    const employeeData = employeeDoc.data() as EmployeeModel;

    if (!employeeData.roleId) {
      return false;
    }

    const roleRef = db
      .collection(FACILITY_COLLECTION)
      .doc(facilityId)
      .collection(ROLE_COLLECTION)
      .doc(employeeData.roleId);

    const roleDoc = await roleRef.get();

    if (!roleDoc.exists) {
      return false;
    }

    const roleData = roleDoc.data();

    if (!roleData?.permissions || !roleData.permissions[section]) {
      return false;
    }

    const sectionPermissions = roleData.permissions[section];
    return sectionPermissions.includes(permission);

  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Check if the user is an employee of the facility
 */
export async function isFacilityEmployee(
  db: FirebaseFirestore.Firestore,
  facilityId: string,
  userId: string,
): Promise<boolean> {
  try {
    const employeeRef = db
      .collection(FACILITY_COLLECTION)
      .doc(facilityId)
      .collection(EMPLOYEE_COLLECTION)
      .doc(userId);

    const employeeDoc = await employeeRef.get();
    return employeeDoc.exists;

  } catch (error) {
    console.error('Error checking if user is facility employee:', error);
    return false;
  }
}
