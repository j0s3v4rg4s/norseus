# Firestore Collections Structure

This document defines the complete structure of Firestore collections for the Norseus application, based on the Supabase to Firebase migration.

## Collection Hierarchy

```
profiles/{uid}
facilities/{facilityId}
members/{uid}
roles/{roleId}
facilities/{facilityId}/
└── services/{serviceId}/
    └── schedules/{scheduleId}
```

---

## 1. Profiles Collection

**Path:** `profiles/{uid}`

**Description:** User profiles that mirror Supabase `profile` table. The Firestore `uid` equals Supabase `auth.users.id`.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `createdAt` | `timestamp` | ✅ | When the profile was created |
| `name` | `string` | ❌ | User's display name |
| `defaultFacilityId` | `string` | ❌ | ID of the user's default facility |

### Example Document

```json
{
  "createdAt": "2024-01-15T10:30:00Z",
  "name": "John Doe",
  "defaultFacilityId": "facility-123"
}
```

---

## 2. Facilities Collection

**Path:** `facilities/{facilityId}`

**Description:** Facilities that users can belong to. Mirrors Supabase `facility` table.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `createdAt` | `timestamp` | ✅ | When the facility was created |
| `name` | `string` | ✅ | Facility name |
| `logo` | `string` | ❌ | URL to facility logo |

### Example Document

```json
{
  "createdAt": "2024-01-01T00:00:00Z",
  "name": "Norseus Gym",
  "logo": "https://example.com/logo.png"
}
```

---

## 3. Members Collection

**Path:** `members/{uid}`

**Description:** Facility membership records with support for multi-facility users. Mirrors Supabase `facility_user` table with role references.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | ✅ | User ID (same as document ID) |
| `facilities` | `object[]` | ✅ | Array of facility memberships |

### Facility Membership Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `facilityId` | `string` | ✅ | ID of the facility |
| `roleId` | `string` | ❌ | ID of the user's role in this facility |
| `joined` | `timestamp` | ✅ | When the user joined the facility |

### Example Document

```json
{
  "uid": "user123",
  "facilities": [
    {
      "facilityId": "facility-456",
      "roleId": "role-123",
      "joined": "2024-01-15T10:30:00Z"
    },
    {
      "facilityId": "facility-789",
      "roleId": "role-456", 
      "joined": "2024-02-01T09:00:00Z"
    }
  ]
}
```

---

## 4. Roles Collection

**Path:** `roles/{roleId}`

**Description:** Roles within facilities with their permissions. Mirrors Supabase `role` table with embedded permissions.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ | Role name (unique per facility) |
| `description` | `string` | ❌ | Role description |
| `facilityId` | `string` | ✅ | ID of the facility this role belongs to |
| `permissions` | `string[]` | ✅ | Array of permission keys (e.g., `['services.read', 'users.edit']`) |

### Permission Key Format

Permissions follow the pattern: `{section}.{action}`

- **Sections:** `permissions`, `users`, `services`
- **Actions:** `read`, `edit`, `delete`, `create`

### Example Document

```json
{
  "name": "Admin",
  "description": "Full administrative access to the facility",
  "facilityId": "facility-456",
  "permissions": ["services.read", "services.edit", "services.delete", "users.read", "users.edit", "permissions.edit"]
}
```

---

## 5. Facility Services Subcollection

**Path:** `facilities/{facilityId}/services/{serviceId}`

**Description:** Services offered by a facility. Mirrors Supabase `service` table.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `createdAt` | `timestamp` | ✅ | When the service was created |
| `name` | `string` | ✅ | Service name |
| `description` | `string` | ❌ | Service description |
| `isActive` | `boolean` | ✅ | Whether the service is active |

### Example Document

```json
{
  "createdAt": "2024-01-15T10:30:00Z",
  "name": "Yoga Class",
  "description": "Beginner-friendly yoga sessions",
  "isActive": true
}
```

---

## 6. Service Schedules Subcollection

**Path:** `facilities/{facilityId}/services/{serviceId}/schedules/{scheduleId}`

**Description:** Weekly schedules for services. Mirrors Supabase `service_schedule` table.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dayOfWeek` | `string` | ✅ | Day of week: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun` |
| `startTime` | `string` | ✅ | Start time in HH:mm format (e.g., "09:00") |
| `durationMinutes` | `number` | ✅ | Duration in minutes (> 0) |
| `employeeId` | `string` | ✅ | UID of the employee responsible for this schedule |
| `capacity` | `number` | ✅ | Maximum number of participants (> 0) |
| `minReserveMinutes` | `number` | ✅ | Minimum minutes in advance to reserve (≥ 0) |
| `minCancelMinutes` | `number` | ✅ | Minimum minutes in advance to cancel (≥ 0) |
| `isActive` | `boolean` | ✅ | Whether this schedule is active |

### Example Document

```json
{
  "dayOfWeek": "mon",
  "startTime": "09:00",
  "durationMinutes": 60,
  "employeeId": "user-789",
  "capacity": 20,
  "minReserveMinutes": 60,
  "minCancelMinutes": 120,
  "isActive": true
}
```

---

## Data Validation & Business Rules

### Uniqueness Constraints
- **Roles:** `name` must be unique per facility (enforced via Cloud Functions)
- **Schedules:** `(dayOfWeek, startTime)` must be unique per service (enforced via Cloud Functions)

### Document References
- `members/{uid}.facilities[].roleId` references `roles/{roleId}`
- `roles/{roleId}.facilityId` references `facilities/{facilityId}`
- `services/{serviceId}` belongs to `facilities/{facilityId}` (hierarchical)
- `schedules/{scheduleId}.employeeId` references `profiles/{uid}`

### Field Validation
- `durationMinutes` > 0
- `capacity` > 0
- `minReserveMinutes` ≥ 0
- `minCancelMinutes` ≥ 0
- `employeeId` must be a member of the same facility (enforced via Security Rules)

---

## Security Model

### Access Control
- **Profiles:** Users can only read/write their own profile
- **Facilities:** Only members can read facility data
- **Members:** Users can read their own membership, admins can manage all
- **Roles:** Members can read, only users with `permissions.edit` can modify
- **Services:** Members can read, requires `services.*` permissions to modify
- **Schedules:** Inherits service permissions, plus employee validation

### Permission System
Permissions are stored in `roles/{roleId}.permissions` and accessed via role reference:
- Format: `{section}.{action}`
- Examples: `services.read`, `users.edit`, `permissions.delete`
- Access pattern: `members/{uid}.facilities[].roleId` → `roles/{roleId}.permissions`

---

## Permission Access Pattern

### Client-Side Permission Check
```typescript
async function hasPermission(uid: string, facilityId: string, permission: string): Promise<boolean> {
  // 1. Get user's memberships
  const memberDoc = await getDoc(doc(db, 'members', uid));
  const userFacilities = memberDoc.data()?.facilities || [];
  
  // 2. Find the specific facility membership
  const facilityMembership = userFacilities.find(f => f.facilityId === facilityId);
  if (!facilityMembership?.roleId) return false;
  
  // 3. Get role's permissions
  const roleDoc = await getDoc(doc(db, 'roles', facilityMembership.roleId));
  const permissions = roleDoc.data()?.permissions || [];
  
  return permissions.includes(permission);
}
```

### Security Rules Pattern
```javascript
// In firestore.rules
function hasPermission(uid, facilityId, permission) {
  return isSignedIn() && 
         permission in get(/databases/$(database)/documents/roles/$(getUserRoleId(uid, facilityId))).data.permissions;
}

function getUserRoleId(uid, facilityId) {
  const memberDoc = get(/databases/$(database)/documents/members/$(uid));
  const facilities = memberDoc.data.facilities;
  const facilityMembership = facilities[facilityId];
  return facilityMembership.roleId;
}
```

---

## Common Queries

### Get User's Facilities
```typescript
async function getUserFacilities(uid: string): Promise<string[]> {
  const memberDoc = await getDoc(doc(db, 'members', uid));
  return memberDoc.data()?.facilities?.map(f => f.facilityId) || [];
}
```

### Get Facility Users
```typescript
async function getFacilityUsers(facilityId: string): Promise<any[]> {
  const membersQuery = query(
    collection(db, 'members'),
    where('facilities', 'array-contains', { facilityId })
  );
  const membersSnapshot = await getDocs(membersQuery);
  
  return membersSnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  }));
}
```

### Get Facility Roles
```typescript
async function getFacilityRoles(facilityId: string): Promise<any[]> {
  const rolesQuery = query(
    collection(db, 'roles'),
    where('facilityId', '==', facilityId)
  );
  const rolesSnapshot = await getDocs(rolesQuery);
  
  return rolesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

---

## Migration Notes

### From Supabase
- `profile.id` → `profiles/{uid}` (uid = auth.users.id)
- `facility.id` → `facilities/{facilityId}`
- `facility_user` → `members/{uid}.facilities[]`
- `role` → `roles/{roleId}`
- `permissions` → embedded in `roles/{roleId}.permissions`
- `service` → `facilities/{facilityId}/services/{serviceId}`
- `service_schedule` → `facilities/{facilityId}/services/{serviceId}/schedules/{scheduleId}`

### Key Differences from Supabase
- Hierarchical structure for services and schedules under facilities
- Referential structure for members and roles for better query performance
- Permissions embedded in roles for better consistency
- No explicit foreign key constraints (enforced via Security Rules and Cloud Functions)
- Document IDs can be Supabase UUIDs for traceability
- Uniqueness constraints enforced via Cloud Functions transactions

### Design Decision: Hybrid Structure

**Chosen Approach:** Referential for members/roles, hierarchical for services/schedules

**Benefits:**
- ✅ **Query Performance:** Efficient queries for user facilities and facility users
- ✅ **Data Consistency:** Permissions always in sync with role definitions
- ✅ **Logical Organization:** Services and schedules naturally hierarchical
- ✅ **Scalability:** Better performance for multi-facility users
- ✅ **Cost Effective:** Optimized read patterns for common queries

**Structure Rationale:**
- **Members/Roles:** Referential for efficient cross-facility queries
- **Services/Schedules:** Hierarchical for natural organization and facility isolation 
