import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  updateDoc,
  getDoc,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { catchError, from, map, Observable, throwError } from 'rxjs';

import {
  CreateEmployeeRequest,
  DeleteEmployeeRequest,
  EmployeeModel,
  EMPLOYEE_COLLECTION,
  FACILITY_COLLECTION,
} from '@models/facility';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  /* ************************************************************************** */
  /* * PRIVATE INJECTIONS                                                     * */
  /* ************************************************************************** */

  private readonly firestore = inject(Firestore);
  private readonly functions = inject(Functions);

  /* ************************************************************************** */
  /* * PRIVATE PROPERTIES                                                     * */
  /* ************************************************************************** */

  private readonly employeeCollection = (facilityId: string) =>
    collection(
      this.firestore,
      `${FACILITY_COLLECTION}/${facilityId}/${EMPLOYEE_COLLECTION}`,
    ) as CollectionReference<EmployeeModel>;

  /* ************************************************************************** */
  /* * PUBLIC METHODS                                                         * */
  /* ************************************************************************** */

  getEmployees(facilityId: string): Observable<EmployeeModel[]> {
    return collectionData(this.employeeCollection(facilityId));
  }

  getEmployee(facilityId: string, employeeId: string) {
    const employeeDocRef = doc(this.employeeCollection(facilityId), employeeId);
    return from(getDoc(employeeDocRef)).pipe(
      map((doc) => doc.data() as EmployeeModel),
    );
  }

  async createEmployee(payload: CreateEmployeeRequest): Promise<unknown> {
    const createEmployeeFn = httpsCallable(this.functions, 'createEmployee');
    return createEmployeeFn(payload);
  }

  async updateEmployee(facilityId: string, employeeId: string, employeeData: Partial<EmployeeModel>): Promise<void> {
    const employeeDocRef = doc(this.employeeCollection(facilityId), employeeId);
    return updateDoc(employeeDocRef, employeeData);
  }

  async deleteEmployee(payload: DeleteEmployeeRequest): Promise<void> {
    const deleteEmployeeFn = httpsCallable(this.functions, 'deleteEmployee');
    await deleteEmployeeFn(payload);
  }
}
