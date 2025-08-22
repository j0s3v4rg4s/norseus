# Role-Based Access Control (RBAC) System Design

This document outlines the design for a flexible Role-Based Access Control (RBAC) system for the Norseus application, focusing on its integration with Firestore Security Rules.

## 1. Objectives

- To allow facility administrators to create custom roles with specific permissions.
- To assign these roles to employees within a facility.
- To enforce access control using Firestore Security Rules, ensuring users can only perform actions permitted by their assigned role.
- To create a scalable system that can easily accommodate new application sections and permissions.

## 2. Data Model

To support the RBAC system, we will introduce a new subcollection and modify how employee roles are handled.

### 2.1. `roles` Subcollection

A new subcollection named `roles` will be added under each facility.

**Path:** `facilities/{facilityId}/roles/{roleId}`

This collection will store all the available roles for a specific facility.

#### Role Document Fields

| Field       | Type        | Required | Description                                                              |
|-------------|-------------|----------|--------------------------------------------------------------------------|
| `name`        | `string`    | ✅       | The display name of the role (e.g., "Manager", "Receptionist").          |
| `permissions` | `map`       | ✅       | An object where keys are section names and values are arrays of permissions. |

#### Example Role Document

```json
{
  "name": "Manager",
  "permissions": {
    "employees": ["create", "read", "update", "delete"],
    "roles": ["create", "read", "update"],
    "clients": ["read", "update"]
  }
}
```

### 2.2. Employee Document Update

The existing `employees` document will continue to link a user to a role.

**Path:** `facilities/{facilityId}/employees/{uid}`

The `roleId` field will now correspond to a document ID in the new `facilities/{facilityId}/roles` subcollection.

#### Example Employee Document

```json
{
  "uid": "user-123",
  "joined": "2024-01-15T10:30:00Z",
  "roleId": "manager-role-id", // <-- This links to a role document
  "isAdmin": false, // This can be deprecated or used for a "Facility Owner" role
  "profile": {
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

## 3. Permissions Structure

Permissions are structured around **sections** and **actions**.

-   **Section**: Represents a major feature or data entity in the application (e.g., `employees`, `roles`, `clients`).
-   **Action**: Represents a specific operation a user can perform on a section (e.g., `create`, `read`, `update`, `delete`).

This model allows for granular control and is easily extensible. To add a new feature like "Inventory", we would simply define permissions for the `inventory` section.

## 4. Firestore Security Rules Implementation

The core of the enforcement will happen in `firestore.rules`. We will add helper functions to check a user's permissions based on their role.

### 4.1. New Helper Functions

We'll add a central function, `hasPermission`, to check if an authenticated user has a specific permission for a given facility.

```javascript
// firestore.rules

// ... existing functions

function getRoleData(request, facilityId) {
  // Get the employee's document to find their roleId
  let employeeDoc = get(/databases/$(database)/documents/facilities/$(facilityId)/employees/$(request.auth.uid)).data;
  // Get the role document using the roleId
  return get(/databases/$(database)/documents/facilities/$(facilityId)/roles/$(employeeDoc.roleId)).data;
}

function hasPermission(request, facilityId, section, permission) {
  // Ensure the user is an employee of the facility
  if (!isFacilityEmployee(request, facilityId)) {
    return false;
  }
  // Get the user's role data
  let role = getRoleData(request, facilityId);
  
  // Ensure the section exists in the permissions map
  if (!(section in role.permissions)) {
    return false;
  }
  
  // Check if the permission is in the list for that section
  return permission in role.permissions[section];
}
```

### 4.2. Example Rule Definitions

Here is how the rules for the `employees` subcollection would be updated.

```javascript
// firestore.rules

// ...

match /facilities/{facilityId} {
  // ... existing rules for /facilities/{facilityId}

  // Rules for the 'roles' subcollection
  match /roles/{roleId} {
    allow create: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'roles', 'create');
    allow read: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'roles', 'read');
    allow update: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'roles', 'update');
    allow delete: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'roles', 'delete');
  }

  // Rules for the 'employees' subcollection
  match /employees/{employeeId} {
    allow create: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'employees', 'create');
    allow read: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'employees', 'read');
    allow update: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'employees', 'update');
    allow delete: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'employees', 'delete');
  }
  
  // Rules for the 'clients' subcollection would follow the same pattern
}
```

**Note on Admins:** The `isFacilityAdmin` function can be kept to grant full access within a facility, bypassing the role-permission check. This "admin" role would be a special status. The rules above show how an admin can always perform the action, or a user with the correct permission.

## 5. Extensibility

This design is highly extensible. To add a new section, for example `services`:

1.  **Define Permissions**: The front-end application will expect permissions for the `services` section (e.g., `services: ['create', 'read', 'update', 'delete']`).
2.  **Update Roles**: The facility admin will update existing roles or create new ones, granting the desired `services` permissions.
3.  **Add Security Rules**: Add a new rule block in `firestore.rules` for the `services` collection/subcollection, using the `hasPermission` function.

```javascript
// firestore.rules
// ...
  // Rules for a new 'services' subcollection
  match /services/{serviceId} {
    allow create: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'services', 'create');
    allow read: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'services', 'read');
    allow update: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'services', 'update');
    allow delete: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'services', 'delete');
  }
// ...
```

This approach provides a robust and scalable foundation for managing user permissions within the application.

