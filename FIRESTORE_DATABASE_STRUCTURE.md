# Firestore Database Structure - Norseus

## Overview

This document describes the current Firestore database structure for the Norseus application. The database uses a hybrid architecture that combines root-level collections with hierarchical subcollections to optimize query performance and logical data organization.

## Architecture Summary

The database follows a **hybrid structure**:
- **Referential collections** for members/roles (optimized for cross-facility queries)
- **Hierarchical subcollections** for services/schedules (natural organization and facility isolation)

## Database Collections Map

```
Firestore Root
├── profiles/{uid}                           # User profiles
├── facilities/{facilityId}                 # Facilities
│   ├── employees/{uid}                     # Facility employees
│   ├── clients/{uid}                       # Facility clients  
│   ├── roles/{roleId}                      # Facility roles
│   └── services/{serviceId}                # Facility services
│       └── schedules/{scheduleId}          # Service schedules
```

## Root Collections

### 1. Profiles Collection

**Path:** `profiles/{uid}`

**Purpose:** Stores basic user information and profile data.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | ✅ | User ID (same as document ID) |
| `createdAt` | `timestamp` | ✅ | When the profile was created |
| `name` | `string` | ❌ | User's display name |
| `email` | `string` | ❌ | User's email address |
| `img` | `string` | ❌ | Profile image URL |

**Example Document:**
```json
{
  "createdAt": "2024-01-15T10:30:00Z",
  "name": "John Doe",
  "email": "john@example.com",
  "img": "https://example.com/photos/john.jpg"
}
```

### 2. Facilities Collection

**Path:** `facilities/{facilityId}`

**Purpose:** Represents facilities/establishments in the system.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `facilityId` | `string` | ✅ | Facility ID (document ID) |
| `createdAt` | `timestamp` | ✅ | When the facility was created |
| `name` | `string` | ✅ | Facility name |
| `logo` | `string` | ❌ | Facility logo URL |

**Example Document:**
```json
{
  "createdAt": "2024-01-01T00:00:00Z",
  "name": "Norseus Gym",
  "logo": "https://example.com/logo.png"
}
```

## Facility Subcollections

### 3. Employees Subcollection

**Path:** `facilities/{facilityId}/employees/{uid}`

**Purpose:** Employees belonging to a specific facility.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | ✅ | Employee user ID (document ID) |
| `joined` | `timestamp` | ✅ | When employee joined the facility |
| `roleId` | `string` | ❌ | Reference to employee's role |
| `isAdmin` | `boolean` | ✅ | Whether employee is facility admin |
| `profile` | `object` | ✅ | Embedded profile data (denormalized) |

**Profile Object Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ❌ | User's display name |
| `email` | `string` | ❌ | User's email |
| `img` | `string` | ❌ | Profile image URL |

**Example Document:**
```json
{
  "uid": "user123",
  "joined": "2024-01-15T10:30:00Z",
  "roleId": "role-456",
  "isAdmin": false,
  "profile": {
    "name": "John Doe",
    "email": "john@example.com",
    "img": "https://example.com/photos/john.jpg"
  }
}
```

### 4. Clients Subcollection

**Path:** `facilities/{facilityId}/clients/{uid}`

**Purpose:** Clients belonging to a specific facility.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | ✅ | Client user ID (document ID) |
| `joined` | `timestamp` | ✅ | When client joined the facility |
| `isActive` | `boolean` | ✅ | Client status |
| `profile` | `object` | ✅ | Embedded profile data (denormalized) |

**Example Document:**
```json
{
  "uid": "user789",
  "joined": "2024-02-01T09:00:00Z",
  "isActive": true,
  "profile": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "img": "https://example.com/photos/jane.jpg"
  }
}
```

### 5. Roles Subcollection

**Path:** `facilities/{facilityId}/roles/{roleId}`

**Purpose:** Roles and permissions within a facility.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `roleId` | `string` | ✅ | Role ID (document ID) |
| `name` | `string` | ✅ | Role name |
| `description` | `string` | ❌ | Role description |
| `permissions` | `object` | ✅ | Permissions object |

**Permissions Object Structure:**
```typescript
{
  [PermissionSection]: PermissionAction[]
}
```

**Permission Sections:**
- `roles`: Role management permissions
- `employees`: Employee management permissions  
- `services`: Service management permissions

**Permission Actions:**
- `create`: Create new records
- `read`: Read/view records
- `update`: Modify existing records
- `delete`: Delete records

**Example Document:**
```json
{
  "name": "Manager",
  "description": "Facility manager with full access",
  "permissions": {
    "roles": ["create", "read", "update", "delete"],
    "employees": ["create", "read", "update", "delete"],
    "services": ["create", "read", "update", "delete"]
  }
}
```

### 6. Services Subcollection

**Path:** `facilities/{facilityId}/services/{serviceId}`

**Purpose:** Services offered by a facility.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serviceId` | `string` | ✅ | Service ID (document ID) |
| `createdAt` | `timestamp` | ✅ | When service was created |
| `updatedAt` | `timestamp` | ✅ | When service was last updated |
| `name` | `string` | ✅ | Service name |
| `description` | `string` | ❌ | Service description |
| `isActive` | `boolean` | ✅ | Service status |

**Example Document:**
```json
{
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:22:00Z",
  "name": "Yoga Class",
  "description": "Beginner-friendly yoga sessions",
  "isActive": true
}
```

### 7. Schedules Subcollection

**Path:** `facilities/{facilityId}/services/{serviceId}/schedules/{scheduleId}`

**Purpose:** Weekly schedules for services.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scheduleId` | `string` | ✅ | Schedule ID (document ID) |
| `dayOfWeek` | `string` | ✅ | Day: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun` |
| `startTime` | `string` | ✅ | Start time in HH:mm format (e.g., "09:00") |
| `durationMinutes` | `number` | ✅ | Duration in minutes (> 0) |
| `capacity` | `number` | ✅ | Maximum participants (> 0) |
| `minReserveMinutes` | `number` | ✅ | Minimum advance reservation time (≥ 0) |
| `minCancelMinutes` | `number` | ✅ | Minimum advance cancellation time (≥ 0) |
| `isActive` | `boolean` | ✅ | Schedule status |
| `createdAt` | `timestamp` | ✅ | When schedule was created |
| `updatedAt` | `timestamp` | ✅ | When schedule was last updated |

**Example Document:**
```json
{
  "dayOfWeek": "mon",
  "startTime": "09:00",
  "durationMinutes": 60,
  "capacity": 20,
  "minReserveMinutes": 60,
  "minCancelMinutes": 120,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Data Relationships

### Primary Relationships

1. **User → Employee/Client**: A user can be both an employee and a client across different facilities
2. **Facility → Employees/Clients**: A facility has multiple employees and clients
3. **Facility → Roles**: A facility defines its own roles and permissions
4. **Facility → Services**: A facility offers multiple services
5. **Service → Schedules**: A service has multiple weekly schedules
6. **Employee → Role**: An employee has a specific role within a facility

### Cross-Collection References

- `employees/{uid}.roleId` → `roles/{roleId}`
- `employees/{uid}.profile` → `profiles/{uid}` (denormalized)
- `clients/{uid}.profile` → `profiles/{uid}` (denormalized)

## Collection Constants

The application uses the following constants for collection paths:

```typescript
// Root collections
PROFILE_COLLECTION = 'profiles'
FACILITY_COLLECTION = 'facilities'

// Facility subcollections
EMPLOYEE_COLLECTION = 'employees'
CLIENT_COLLECTION = 'clients'
ROLE_COLLECTION = 'roles'
SERVICES_COLLECTION = 'services'
SCHEDULES_COLLECTION = 'schedules'
```

## Query Patterns

### Common Query Operations

#### 1. Get User's Facilities
```typescript
// Get facilities where user is an employee
collectionGroup(EMPLOYEE_COLLECTION)
  .where('uid', '==', userId)

// Get facilities where user is a client  
collectionGroup(CLIENT_COLLECTION)
  .where('uid', '==', userId)
```

#### 2. Get Facility Data
```typescript
// Get facility employees
facilities/{facilityId}/employees

// Get facility services
facilities/{facilityId}/services

// Get service schedules
facilities/{facilityId}/services/{serviceId}/schedules
```

#### 3. Permission Checks
```typescript
// Check user permissions in facility
facilities/{facilityId}/employees/{uid}.roleId
→ facilities/{facilityId}/roles/{roleId}.permissions
```

### 8. Classes Collection

**Path:** `facilities/{facilityId}/classes/{classId}`

**Purpose:** Bookable class instances generated from service schedules for specific dates.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Class ID (document ID) |
| `serviceId` | `string` | ✅ | Reference to parent service |
| `facilityId` | `string` | ✅ | Reference to facility |
| `date` | `timestamp` | ✅ | Class date and time |
| `capacity` | `number` | ✅ | Maximum participants |
| `startAt` | `string` | ✅ | Start time (HH:mm format) |
| `duration` | `number` | ✅ | Duration in minutes |
| `instructorId` | `string` | ❌ | Assigned instructor/coach ID |
| `userBookings` | `string[]` | ✅ | Array of user IDs who booked (managed by Cloud Functions) |
| `program` | `object` | ❌ | Class program details |

**Program Object:**
| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | Program type (enum: `rich_text`) |
| `value` | `string` | Program content (HTML for rich text editor) |

**Example Document:**
```json
{
  "id": "class-xyz123",
  "serviceId": "service-456",
  "facilityId": "facility-789",
  "date": "2024-03-15T09:00:00Z",
  "capacity": 20,
  "startAt": "09:00",
  "duration": 60,
  "instructorId": "employee-abc",
  "userBookings": ["user-1", "user-2"],
  "program": {
    "type": "rich_text",
    "value": "<h1>Today's Program</h1><p>Focus on cardio...</p>"
  }
}
```

## Design Benefits

### 1. Performance Optimization
- **Denormalized profiles** in employees/clients avoid double reads
- **Hierarchical structure** for services/schedules enables efficient queries
- **Collection groups** allow cross-facility user queries
- **Direct facility subcollection** for classes enables efficient cross-service queries

### 2. Data Consistency
- **Embedded permissions** in roles ensure consistency
- **Facility isolation** prevents cross-facility data leakage
- **Referential integrity** maintained through application logic
- **Cloud Functions** manage userBookings for consistency

### 3. Scalability
- **Multi-tenant architecture** supports multiple facilities
- **Efficient query patterns** minimize read operations
- **Logical organization** supports complex business rules
- **Public read access** for classes enables user-facing applications

### 4. Security
- **Facility-based isolation** provides natural security boundaries
- **Role-based permissions** enable granular access control
- **Hierarchical structure** simplifies security rule implementation
- **Programming permissions** control class creation and management
