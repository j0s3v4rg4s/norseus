# Project Overview - Norseus

This document contains the basic information and structure of the Norseus project, serving as a central reference for development.

## Database Structure - Firestore

### 1. Profiles Collection

**Path:** `profiles/{uid}`

**Description:** User profiles containing basic user information.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `createdAt` | `timestamp` | ✅ | When the profile was created |
| `name` | `string` | ❌ | User's display name |
| `img` | `string` | ❌ | User's profile image |

#### Example Document

```json
{
  "createdAt": "2024-01-15T10:30:00Z",
  "name": "John Doe",
  "img": "https://example.com/photos/john.jpg"
}
```

---

### 2. Facilities Collection

**Path:** `facilities/{facilityId}`

**Description:** Facilities that users can belong to with subcollections for employees and clients.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `createdAt` | `timestamp` | ✅ | When the facility was created |
| `name` | `string` | ✅ | Facility name |
| `logo` | `string` | ❌ | URL to facility logo |

#### Subcollections

##### 2.1 Employees Subcollection

**Path:** `facilities/{facilityId}/employees/{uid}`

**Description:** Employees that belong to a specific facility. Contains a projection of the profile data to avoid double reads.

#### Employee Document Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | ✅ | User ID of the employee |
| `joined` | `timestamp` | ✅ | When the employee joined the facility |
| `roleId` | `string` | ❌ | ID of the employee's role in this facility |
| `isAdmin` | `boolean` | ✅ | Whether the employee is an admin of this facility |
| `profile` | `object` | ✅ | Projection of the profile document |

#### Profile Projection Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ❌ | User's display name |
| `email` | `string` | ❌ | User's email address |
| `photo` | `string` | ❌ | URL to user's profile photo |
| `createdAt` | `timestamp` | ✅ | When the profile was created |

#### Example Employee Document

```json
{
  "uid": "user-123",
  "joined": "2024-01-15T10:30:00Z",
  "roleId": "role-123",
  "isAdmin": true,
  "profile": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "photo": "https://example.com/photos/john.jpg",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

##### 2.2 Roles Subcollection

**Path:** `facilities/{facilityId}/roles/{roleId}`

**Description:** Roles that define permissions for employees within a specific facility. Each role contains a set of permissions organized by sections.

#### Role Document Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier for the role |
| `name` | `string` | ✅ | Display name of the role |
| `permissions` | `object` | ✅ | Permissions organized by section |

#### Permissions Structure

The `permissions` field is an object where:
- **Keys** are permission sections (e.g., 'roles', 'employees')
- **Values** are arrays of permission actions (e.g., ['create', 'read', 'update', 'delete'])

#### Available Permission Sections

| Section | Description |
|---------|-------------|
| `roles` | Permissions for managing roles within the facility |
| `employees` | Permissions for managing employees within the facility |

#### Available Permission Actions

| Action | Description |
|--------|-------------|
| `create` | Ability to create new resources |
| `read` | Ability to view resources |
| `update` | Ability to modify existing resources |
| `delete` | Ability to remove resources |

#### Example Role Document

```json
{
  "id": "role-123",
  "name": "Manager",
  "permissions": {
    "roles": ["create", "read", "update", "delete"],
    "employees": ["create", "read", "update"]
  }
}
```

##### 2.3 Clients Subcollection

**Path:** `facilities/{facilityId}/clients/{uid}`

**Description:** Clients that belong to a specific facility. Contains a projection of the profile data to avoid double reads.

#### Client Document Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | ✅ | User ID of the client |
| `joined` | `timestamp` | ✅ | When the client joined the facility |
| `membershipType` | `string` | ❌ | Type of membership (e.g., 'basic', 'premium', 'vip') |
| `isActive` | `boolean` | ✅ | Whether the client membership is active |
| `profile` | `object` | ✅ | Projection of the profile document |

#### Profile Projection Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ❌ | User's display name |
| `email` | `string` | ❌ | User's email address |
| `photo` | `string` | ❌ | URL to user's profile photo |
| `createdAt` | `timestamp` | ✅ | When the profile was created |

#### Example Client Document

```json
{
  "uid": "user-456",
  "joined": "2024-02-01T09:00:00Z",
  "membershipType": "premium",
  "isActive": true,
  "profile": {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "photo": "https://example.com/photos/jane.jpg",
    "createdAt": "2024-02-01T09:00:00Z"
  }
}
```

#### Example Facility Document

```json
{
  "createdAt": "2024-01-01T00:00:00Z",
  "name": "Norseus Gym",
  "logo": "https://example.com/logo.png"
}
```

---

## Security Rules - Firestore

### Access Control Functions

The Firestore security rules include several helper functions to control access:

#### Authentication Functions

| Function | Description |
|----------|-------------|
| `isSuperAdmin(request)` | Checks if the user has super admin role |
| `isAuth(request)` | Checks if the user is authenticated |
| `isFacilityAdmin(request, facilityId)` | Checks if the user is an admin of the specific facility |
| `isFacilityEmployee(request, facilityId)` | Checks if the user is an employee of the specific facility |
| `isFacilityClient(request, facilityId)` | Checks if the user is a client of the specific facility |
| `belongsToFacility(request, facilityId)` | Checks if the user belongs to the facility (employee or client) |

#### Permission Functions

| Function | Description |
|----------|-------------|
| `getRoleData(request, facilityId)` | Retrieves the role data for the authenticated user in the facility |
| `hasPermission(request, facilityId, section, permission)` | Checks if the user has a specific permission for a section |
| `hasRoleAssigned(request, facilityId, roleId)` | Checks if the user has a specific role assigned in the facility |

### Access Rules

#### Facilities Collection
- **Create**: Only super admins
- **Read**: Super admins, facility admins, or facility members (employees/clients)

#### Roles Subcollection
- **Create/Update/Delete**: Facility admins OR users with specific role permissions
- **Read**: Facility employees OR users with read permission for roles OR users with the specific role assigned

#### Employees Subcollection
- **Read**: Any authenticated user (for profile projections)

#### Profiles Collection
- **Read/Write**: Users can only access their own profile


