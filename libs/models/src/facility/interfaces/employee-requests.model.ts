import { Role } from '../../user/constants';

/**
 * Request payload for creating an employee
 * Used in createEmployee cloud function
 */
export interface CreateEmployeeRequest {
  email: string;
  name: string;
  roleId: string;
  facilityId: string;
  userType: Role;
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
