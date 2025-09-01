# Employee Management: Technical Implementation Plan

This document provides a detailed technical breakdown for migrating the user management feature to a Firestore-based employee management system.

---

## 1. Core Library: `EmployeeService`

A new service will be created in `libs/front/core/employee/src/services/employee.service.ts`.

### 1.1. Service Definition

```typescript
// libs/front/core/employee/src/services/employee.service.ts
import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { Employee, EmployeeCreate } from '@models/facility'; // Assuming models exist
import { FACILITIES_COLLECTION } from '@models/facility';

const EMPLOYEES_COLLECTION = 'employees';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly firestore = inject(Firestore);
  private readonly functions = inject(Functions);

  getEmployees(facilityId: string): Observable<Employee[]> {
    const employeesCollection = collection(this.firestore, `${FACILITIES_COLLECTION}/${facilityId}/${EMPLOYEES_COLLECTION}`);
    return collectionData(employeesCollection, { idField: 'id' }) as Observable<Employee[]>;
  }

  async getEmployee(facilityId: string, employeeId: string): Promise<Employee | null> {
    const employeeDocRef = doc(this.firestore, `${FACILITIES_COLLECTION}/${facilityId}/${EMPLOYEES_COLLECTION}`, employeeId);
    const docSnap = await getDoc(employeeDocRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Employee) : null;
  }

  async createEmployee(payload: { name: string; email: string; roleId: string; facilityId: string }): Promise<any> {
    const createEmployeeFn = httpsCallable(this.functions, 'createEmployee');
    return await createEmployeeFn(payload);
  }

  async updateEmployee(facilityId: string, employeeId: string, employeeData: Partial<Employee>): Promise<void> {
    const employeeDocRef = doc(this.firestore, `${FACILITIES_COLLECTION}/${facilityId}/${EMPLOYEES_COLLECTION}`, employeeId);
    return await updateDoc(employeeDocRef, employeeData);
  }

  async deleteEmployee(payload: { userId: string; facilityId: string }): Promise<void> {
    const deleteEmployeeFn = httpsCallable(this.functions, 'deleteEmployee');
    await deleteEmployeeFn(payload);
  }
}
```

---

## 2. State Management: `users.store.ts` Refactor

The existing store will be updated to use `EmployeeService`.

### 2.1. State and Initial State

```typescript
// apps/admin/src/app/pages/users/users.store.ts

import { Employee } from '@models/facility'; // New model
import { Role } from '@models/user'; // This might come from roles library

// The new shape of our user/employee object in the store
export type EmployeeProfile = Employee & {
  // We might not have the email here directly unless we join with the auth user record,
  // which is better done in a cloud function or kept separate.
  email?: string; 
};

type EmployeeState = {
  isLoading: boolean;
  errorMessage: string;
  statusSaveMessage: string;
  employees: EmployeeProfile[]; // Renamed from users
  employee: EmployeeProfile | null; // Renamed from user
  roles: Role[];
};

export const initialState: EmployeeState = {
  isLoading: false,
  errorMessage: '',
  statusSaveMessage: '',
  employees: [],
  employee: null,
  roles: [],
};
```

### 2.2. Store Methods

```typescript
// apps/admin/src/app/pages/users/users.store.ts
import { EmployeeService } from '@front/core/employee'; // To be created
import { RolesService } from '@front/core/roles'; // Assumed to exist

// ... inside withMethods((store) => { ... })
const employeeService = inject(EmployeeService);
const rolesService = inject(RolesService);
const profileStore = inject(ProfileSignalStore); // To get current facilityId

const loadUsers = async () => {
  patchState(store, { isLoading: true, errorMessage: '' });
  const facilityId = profileStore.facility()?.id;
  if (!facilityId) {
      patchState(store, { isLoading: false, errorMessage: 'No facility selected.' });
      return;
  }
  try {
    // We will need to adjust this as getEmployees will return an observable
    // For simplicity, we can use firstValueFrom or manage the subscription.
    const employees = await firstValueFrom(employeeService.getEmployees(facilityId));
    patchState(store, { employees: employees as EmployeeProfile[], isLoading: false });
  } catch (error) {
    patchState(store, { isLoading: false, errorMessage: 'Error loading employees.' });
  }
};

const loadUser = async (userId: string) => {
  patchState(store, { isLoading: true });
  const facilityId = profileStore.facility()?.id;
  if (!facilityId) return;

  try {
    const employee = await employeeService.getEmployee(facilityId, userId);
    patchState(store, { employee: employee as EmployeeProfile, isLoading: false });
  } catch (e) {
    // ... error handling
  }
};

const createUser = async (payload: { name: string; email: string; roleId: string }) => {
  patchState(store, { isLoading: true, statusSaveMessage: '' });
  const facilityId = profileStore.facility()?.id;
  if (!facilityId) {
    patchState(store, { isLoading: false, statusSaveMessage: 'No facility selected.' });
    return false;
  }

  try {
    await employeeService.createEmployee({ ...payload, facilityId });
    patchState(store, { isLoading: false });
    return true;
  } catch (e: any) {
    patchState(store, {
      isLoading: false,
      statusSaveMessage: e.message || 'Error creating employee.',
    });
    return false;
  }
};

const updateUser = async (userId: string, payload: { name: string; roleId: string }) => {
  patchState(store, { isLoading: true, statusSaveMessage: '' });
  const facilityId = profileStore.facility()?.id;
  if (!facilityId) return false;

  try {
    await employeeService.updateEmployee(facilityId, userId, { name: payload.name, roleId: payload.roleId });
    patchState(store, { isLoading: false });
    return true;
  } catch (e: any) {
    // ... error handling
    return false;
  }
};

const deleteUser = async (userId: string) => {
  patchState(store, { isLoading: true, statusSaveMessage: '' });
  const facilityId = profileStore.facility()?.id;
  if (!facilityId) return false;

  try {
    await employeeService.deleteEmployee({ userId, facilityId });
    patchState(store, { isLoading: false });
    return true;
  } catch (e: any) {
    patchState(store, {
      isLoading: false,
      statusSaveMessage: e.message || 'Error deleting employee.',
    });
    return false;
  }
};
```

---

## 3. Component Updates

### 3.1. `users-create.component.ts`

- The `type` form control will be removed. The distinction between `employee` and `client` will be handled in separate UI sections.
- `saveUser` method will be updated to pass the correct payload to `store.createUser`.

```typescript
// apps/admin/src/app/pages/users/users-create/users-create.component.ts

// Form initialization
this.form = this.fb.group({
  name: ['', [Validators.required, Validators.maxLength(50)]],
  email: ['', [Validators.required, Validators.email]],
  roleId: ['', Validators.required],
  // 'type' control removed
});

// saveUser method
async saveUser() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  const { name, email, roleId } = this.form.value;
  // No 'type' in the payload anymore
  const success = await this.store.createUser({
    name,
    email,
    roleId,
  });
  if (success) {
    this.router.navigate(['/home/users']);
  }
}
```

### 3.2. `users-edit.component.ts`

- The form control `role_id` will be changed to `roleId` for consistency.
- `updateUser` call in `saveUser` will be adapted.

```typescript
// apps/admin/src/app/pages/users/users-edit/users-edit.component.ts

// Form initialization
this.form = this.fb.group({
  name: ['', [Validators.required, Validators.maxLength(50)]],
  email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
  roleId: ['', Validators.required], // changed from role_id
});

// Update effect
effect(() => {
  const { employee, isLoading } = this.store; // watching employee instead of user
  if (employee() && !isLoading()) {
    // using roleId
    this.form.patchValue({ name: employee()?.name, roleId: employee()?.roleId, email: employee()?.email });
  }
});

// saveUser method
async saveUser() {
  if (this.form.invalid || !this.userId) return;
  const { name, roleId } = this.form.value; // using roleId
  const success = await this.store.updateUser(this.userId, { name, roleId });
  if (success) {
    this.router.navigate(['/home/users']);
  }
}
```

---

## 4. Cloud Functions (`apps/functions`)

All models and interfaces used in Cloud Functions must be imported from the `@models` library to ensure consistency.

### 4.1. New Function: `create-employee.function.ts`

A new file will be created at `apps/functions/src/create-employee.function.ts`. The existing `create-user.function.ts` will not be modified. This function will handle the creation of the user in Auth, their profile, and the employee record in the facility.

```typescript
// apps/functions/src/create-employee.function.ts

interface CreateEmployeeRequest {
  email: string;
  name: string;
  roleId: string;
  facilityId: string; // New required parameter
}

// ... inside onRequest handler

// 1. Create Auth User (same as before)
const userRecord = await auth.createUser({ email, password: '...', displayName: name });

// 2. Set Custom Claims (optional, depends on security rules)
// It's better to rely on the employee document for permissions within a facility.
// await auth.setCustomUserClaims(userRecord.uid, { role: 'employee' });

// 3. Create Profile Document (same as before)
await db.collection('profiles').doc(userRecord.uid).set({ ... });

// 4. Create Employee Document in Facility Subcollection
const employeeData = {
  uid: userRecord.uid,
  joined: FieldValue.serverTimestamp(),
  roleId: roleId,
  isAdmin: false, // Default to false, can be changed via UI
  profile: {
    name: name,
    email: email, // Projecting email for easier access
    photo: null,
    createdAt: FieldValue.serverTimestamp(),
  }
};
await db.collection('facilities').doc(facilityId).collection('employees').doc(userRecord.uid).set(employeeData);
```

### 4.2. New Function: `delete-employee.function.ts`

A new file will be created to handle employee deletion atomically.

```typescript
// apps/functions/src/delete-employee.function.ts
import { onCall } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export const deleteEmployee = onCall(async (request) => {
  // Authentication check: Ensure caller is an admin of the facility.
  // This logic needs to be implemented based on custom claims or by checking the caller's employee document.
  // if (!request.auth || !isFacilityAdmin(request.auth.uid, request.data.facilityId)) {
  //   throw new functions.https.HttpsError('permission-denied', 'Must be a facility admin to delete users.');
  // }

  const { userId, facilityId } = request.data;
  const db = getFirestore();
  const auth = getAuth();

  try {
    // 1. Delete from Auth
    await auth.deleteUser(userId);

    // 2. Delete Profile Document
    await db.collection('profiles').doc(userId).delete();

    // 3. Delete Employee Document
    await db.collection('facilities').doc(facilityId).collection('employees').doc(userId).delete();

    return { success: true, message: 'Employee deleted successfully.' };
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete employee.');
  }
});
```
