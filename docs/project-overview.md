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

##### 2.2 Clients Subcollection

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


