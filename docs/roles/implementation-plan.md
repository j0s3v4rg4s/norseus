# RBAC Implementation Plan (Revised)

This document provides a step-by-step plan for implementing the Role-Based Access Control (RBAC) system. The plan has been updated to focus on refactoring the existing UI components and their state management to use a new Firestore-based data access layer.

## Phase 1: Frontend Library Creation

This phase focuses on creating the necessary data-access library to communicate with Firestore for roles and permissions, as per the conventions in `library-architecture.md`.

### Task 1.1: Create Core Data-Access Library

This library will encapsulate all communication with Firestore for the `roles` data.

1.  **Generate the Library:** Use the standard Nx command.
    ```bash
    npx nx g @nx/angular:library --name=roles --directory=libs/front/core/roles --standalone --importPath=@front/core/roles
    ```
2.  **Clean Up:** Follow the mandatory cleanup steps outlined in the architecture document (clear `src/lib`, remove `src/lib`, empty `index.ts`).
3.  **Define and Export Constants, Enums and Models:** To ensure scalability and type safety, we will centralize the definitions for permissions.
    *   Create `src/constants/permissions.constants.ts`. Define and export:
        *   `PERMISSIONS_SECTIONS`: An array of available section keys (e.g., `'roles'`, `'employees'`, `'clients'`).
        *   `PERMISSIONS_ACTIONS`: An array of available action keys (e.g., `'create'`, `'read'`, `'update'`, `'delete'`).
        *   `PERMISSIONS_SECTIONS_DICTIONARY`: A mapping of section keys to human-readable labels for the UI.
        *   `PERMISSIONS_ACTIONS_DICTIONARY`: A mapping of action keys to human-readable labels.
    *   Create `src/enums/permissions.enums.ts`. Define and export:
        *   `enum PermissionSection`: Enum for available sections (e.g., `ROLES = 'roles'`, `EMPLOYEES = 'employees'`, `CLIENTS = 'clients'`).
        *   `enum PermissionAction`: Enum for available actions (e.g., `CREATE = 'create'`, `READ = 'read'`, `UPDATE = 'update'`, `DELETE = 'delete'`).
    *   Create `src/models/role.model.ts`. Define and export the `Role` and `Permission` interfaces to ensure a consistent data structure.
    *   **Why?** Centralizing these makes it easy to add new sections or actions in the future by modifying a single file. The enums provide compile-time type safety, preventing typos and enabling better IDE support. The rest of the application, especially the UI, will adapt automatically.

4.  **Implement `RolesService`:**
    *   Create `src/services/roles.service.ts`.
    *   This service will contain methods for the full CRUD (Create, Read, Update, Delete) operations on the `facilities/{facilityId}/roles` subcollection in Firestore, based on the data model in `rbac-design.md`.

## Phase 2: Refactor Permissions Store

This phase focuses on refactoring the existing `permissions.store.ts` to use the new Firestore-based `RolesService`, effectively swapping the data layer from Supabase to Firestore while preserving the state management logic.

### Task 2.1: Update the Store's Data Layer

1.  **Target File:** `apps/admin/src/app/pages/permissions/permissions.store.ts`
2.  **Actions:**
    *   Inject the new `RolesService` created in Phase 1.
    *   Remove the Supabase client dependency (`inject(SUPABASE)`).
    *   Rewrite the internal implementation of the data-handling methods (`getAllRoles`, `createRole`, `saveRole`, `deleteRole`, `loadRole`) to delegate the calls to `RolesService`.
    *   Ensure the public API of the store (its state shape and method signatures) is preserved to minimize the impact on the components that consume it.

## Phase 3: Verify Component Compatibility

With the store's data source refactored, this phase is to ensure the UI components continue to function as expected with minimal changes.

### Task 3.1: Review and Test Components

1.  **Target Components:**
    *   `permissions-list.component.ts`
    *   `permissions-create.component.ts`
    *   `permissions-edit.component.ts`
2.  **Actions:**
    *   Verify that the components, which already inject and use `permissionsStore`, work correctly with the refactored store.
    *   Since the store's public API is maintained, changes to the components should be minimal to none. The primary task is to confirm that data flows correctly from Firestore, through the `RolesService`, into the `permissionsStore`, and finally to the UI.

## Note on Integration and Routing

The routing for the permissions section is already configured in `apps/admin/src/app/app.routes.ts` and `apps/admin/src/app/pages/permissions/permissions.routes.ts`. No further action is required in this area.

## Final Phase: Backend Security Implementation (Manual)

This is the final step and should be performed **after** the frontend refactoring is complete and verified.

### Task: Manually Update Firestore Security Rules

1.  **File to Edit:** `firestore.rules`
2.  **Action:** You will manually implement the security rules as defined in the `rbac-design.md` document. This will enforce the RBAC logic on the server-side, securing the `facilities/{facilityId}/roles` and `facilities/{facilityId}/employees` collections and ensuring users can only perform actions for which they have explicit permission. This step is critical to protect the application's data.
