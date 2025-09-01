import { EMPLOYEE_COLLECTION, FACILITY_COLLECTION, ROLE_COLLECTION } from '@models/facility';
import { EmployeeModel } from '@models/facility';
import { PermissionSection, PermissionAction } from '@front/core/roles';

/**
 * Check if the user has a specific permission in a facility
 * @param db Firestore database instance
 * @param facilityId ID of the facility
 * @param userId ID of the user to check permissions for
 * @param section Permission section (e.g., 'employees', 'roles')
 * @param permission Permission action (e.g., 'create', 'read', 'update', 'delete')
 * @returns Promise<boolean> - true if user has permission, false otherwise
 */
export async function checkUserPermission(
  db: FirebaseFirestore.Firestore,
  facilityId: string,
  userId: string,
  section: PermissionSection,
  permission: PermissionAction,
): Promise<boolean> {
  try {
    // Get user's employee document
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

    // If user is facility admin, they have all permissions
    if (employeeData.isAdmin) {
      return true;
    }

    // If user has no role assigned, they can't have specific permissions
    if (!employeeData.roleId) {
      return false;
    }

    // Get user's role document
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

    // Check if role has permissions for the specified section
    if (!roleData?.permissions || !roleData.permissions[section]) {
      return false;
    }

    // Check if role has the specific permission for the section
    const sectionPermissions = roleData.permissions[section];
    return sectionPermissions.includes(permission);

  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}



/**
 * Check if the user is an employee of the facility
 * @param db Firestore database instance
 * @param facilityId ID of the facility
 * @param userId ID of the user to check
 * @returns Promise<boolean> - true if user is facility employee, false otherwise
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
