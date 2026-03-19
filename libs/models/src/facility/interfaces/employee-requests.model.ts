/**
 * Request payload for creating a new user and adding them as employee
 * Used in createEmployee cloud function
 */
export interface CreateEmployeeRequest {
  email: string;
  name: string;
  roleId: string;
  facilityId: string;
  isAdmin: boolean;
}

/**
 * Request payload for adding an existing user as employee
 * Used in addExistingEmployee cloud function
 */
export interface AddExistingEmployeeRequest {
  email: string;
  roleId: string;
  facilityId: string;
  isAdmin: boolean;
}

/**
 * Request payload for deleting an employee
 * Used in deleteEmployee cloud function
 */
export interface DeleteEmployeeRequest {
  userId: string;
  facilityId: string;
}

/**
 * Request payload for updating an employee
 * Used in updateEmployee cloud function
 */
export interface UpdateEmployeeRequest {
  userId: string;
  facilityId: string;
  name: string;
  roleId: string;
  isActive: boolean;
}
