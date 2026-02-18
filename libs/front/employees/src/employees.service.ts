import {
  type Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { type Functions, httpsCallable } from 'firebase/functions';
import {
  EMPLOYEE_COLLECTION,
  FACILITY_COLLECTION,
  type CreateEmployeeRequest,
  type DeleteEmployeeRequest,
  type UpdateEmployeeRequest,
  type EmployeeModel,
} from '@models/facility';

/**
 * Retrieves all employees for a given facility.
 */
export async function getEmployees(
  db: Firestore,
  facilityId: string
): Promise<EmployeeModel[]> {
  const employeesRef = collection(
    db,
    FACILITY_COLLECTION,
    facilityId,
    EMPLOYEE_COLLECTION
  );
  const snapshot = await getDocs(employeesRef);
  return snapshot.docs.map((d) => d.data() as EmployeeModel);
}

/**
 * Retrieves a single employee by ID from a given facility.
 */
export async function getEmployee(
  db: Firestore,
  facilityId: string,
  employeeId: string
): Promise<EmployeeModel | undefined> {
  const employeeRef = doc(
    db,
    FACILITY_COLLECTION,
    facilityId,
    EMPLOYEE_COLLECTION,
    employeeId
  );
  const snapshot = await getDoc(employeeRef);
  if (!snapshot.exists()) return undefined;
  return snapshot.data() as EmployeeModel;
}

/**
 * Creates a new employee via the createEmployee Cloud Function.
 */
export async function createEmployee(
  functions: Functions,
  payload: CreateEmployeeRequest
): Promise<unknown> {
  const createEmployeeFn = httpsCallable(functions, 'createEmployee');
  return createEmployeeFn(payload);
}

/**
 * Updates an existing employee via the updateEmployee Cloud Function.
 * Also updates Firebase Auth disabled state based on isActive.
 */
export async function updateEmployee(
  functions: Functions,
  payload: UpdateEmployeeRequest
): Promise<void> {
  const updateEmployeeFn = httpsCallable(functions, 'updateEmployee');
  await updateEmployeeFn(payload);
}

/**
 * Deletes an employee via the deleteEmployee Cloud Function.
 */
export async function deleteEmployee(
  functions: Functions,
  payload: DeleteEmployeeRequest
): Promise<void> {
  const deleteEmployeeFn = httpsCallable(functions, 'deleteEmployee');
  await deleteEmployeeFn(payload);
}
