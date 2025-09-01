# Employee Management Feature Implementation Plan

This document outlines the steps to implement the employee management feature, replacing the old Supabase-based user management system.

## 1. Create Core Data-Access Library for Employees

- **Action**: Generate a new Angular library for employee data management.
- **Path**: `libs/front/core/employee`
- **Alias**: `@front/core/employee`
- **Command**: `npx nx g @nx/angular:library --name=employee --directory=libs/front/core/employee --standalone --importPath=@front/core/employee`
- **Contents**:
    - `EmployeeService`: This service will be responsible for all Firestore interactions related to the `employees` subcollection within a facility (`facilities/{facilityId}/employees`).
    - **Methods**:
        - `getEmployees(facilityId: string)`: Fetch all employees for a given facility.
        - `getEmployee(facilityId: string, employeeId: string)`: Fetch a single employee.
        - `createEmployee(facilityId: string, employeeData: Employee)`: Create a new employee document. This will likely involve a Firebase Cloud Function to handle user creation in Firebase Auth and profile creation.
        - `updateEmployee(facilityId: string, employeeId: string, employeeData: Partial<Employee>)`: Update an employee's data.
        - `deleteEmployee(facilityId: string, employeeId: string)`: Delete an employee. This will also require a Cloud Function to remove the user from Firebase Auth.

## 2. Update UI and State Management

The existing `users` feature will be updated to use Firestore through the new `EmployeeService`, removing all Supabase logic.

### 2.1. Update State Management (`users.store.ts`)

- **Action**: Refactor `usersStore`.
- **Dependencies**: Inject `EmployeeService` instead of the Supabase client.
- **State**: The `UserState` will be updated to `EmployeeState`, and `UserProfile` will be replaced with the `Employee` model from `libs/models`.
- **Methods**:
    - Remove all Supabase calls (`supabase.from(...)`, `supabase.functions.invoke(...)`).
    - `loadUsers(facilityId: string)`: Call `employeeService.getEmployees()`.
    - `loadUser(employeeId: string)`: Call `employeeService.getEmployee()`.
    - `createUser(...)`: Call `employeeService.createEmployee()`.
    - `updateUser(...)`: Call `employeeService.updateEmployee()`.
    - `deleteUser(...)`: Call `employeeService.deleteEmployee()`.
    - The `loadRoles` method will still be needed and can be kept as is, as roles are a separate entity.

### 2.2. Update Components

- **`users-list.component.ts`**:
    - Inject and use the updated `usersStore`.
    - Adjust the table columns and data binding to match the `Employee` model.
- **`users-create.component.ts`**:
    - Inject and use the updated `usersStore`.
    - Update the form (`FormGroup`) to match the fields required for creating an employee (`name`, `email`, `roleId`). The `type` field will be removed.
    - The `saveUser` method will call the corresponding store method to create an employee.
- **`users-edit.component.ts`**:
    - Inject and use the updated `usersStore`.
    - Update the form to handle employee editing. The email will likely remain read-only.
    - The `saveUser` and `deleteUser` methods will call the corresponding store methods.

## 3. Cloud Functions

- **Action**: Create or modify Firebase Cloud Functions for user/employee management within the `apps/functions` project.
- **`createUser` function (`apps/functions/src/create-user.function.ts`)**:
    - This function needs to be adapted. In addition to creating a Firebase Auth user and a `profile` document, it must accept a `facilityId` and create an `employee` document in the `facilities/{facilityId}/employees` subcollection.
- **`deleteUser` function**:
    - A new Cloud Function needs to be created in `apps/functions`.
    - It should delete the Firebase Auth user.
    - It should delete the `profile` document.
    - It should delete the `employee` document from the corresponding facility.

## 4. Firestore Rules

- **Action**: This section will be handled by the user.
