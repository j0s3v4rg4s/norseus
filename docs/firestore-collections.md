# Firestore Collections Structure

Reference guide for the Norseus Firestore database structure.

---

## Collection Hierarchy

```
profiles/{uid}

facilities/{facilityId}/
├── employees/{uid}
├── clients/{uid}
├── roles/{roleId}
├── services/{serviceId}/
│   └── schedules/{scheduleId}
├── classes/{classId}
├── plans/{planId}
├── subscriptions/{subscriptionId}
└── bookings/{bookingId}
```

---

## 1. Profiles

**Path:** `profiles/{uid}`
**Constant:** `PROFILE_COLLECTION = 'profiles'`

Authenticated user profile. The document `uid` matches the Firebase Auth UID.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `createdAt` | `Timestamp` | Yes | Creation date |
| `name` | `string` | Yes | User's display name |
| `email` | `string` | Yes | User's email |
| `img` | `string \| null` | No | Profile photo URL |

```json
{
  "createdAt": "2024-01-15T10:30:00Z",
  "name": "John Doe",
  "email": "john@example.com",
  "img": null
}
```

### Security Rules

- Only the owner can read and write their own profile (`request.auth.uid == uid`).

---

## 2. Facilities

**Path:** `facilities/{facilityId}`
**Constant:** `FACILITY_COLLECTION = 'facilities'`

Each facility represents a business/gym/center within the platform.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `createdAt` | `Timestamp` | Yes | Creation date |
| `name` | `string` | Yes | Facility name |
| `logo` | `string \| null` | No | Logo URL |

```json
{
  "createdAt": "2024-01-01T00:00:00Z",
  "name": "Norseus Gym",
  "logo": "https://example.com/logo.png"
}
```

### Security Rules

| Action | Who can |
|--------|---------|
| `create` | `super_admin` only |
| `read` | `super_admin` or any facility member (employee/client) |
| `update` | `super_admin` only |
| `delete` | `super_admin` only |

---

## 3. Employees (Facility subcollection)

**Path:** `facilities/{facilityId}/employees/{uid}`
**Constant:** `EMPLOYEE_COLLECTION = 'employees'`

Facility employees. Contains a profile projection (`profile`) to avoid extra reads.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | Yes | Employee UID (same as document ID) |
| `joined` | `Timestamp` | Yes | Date joined the facility |
| `roleId` | `string \| null` | No | Assigned role ID within this facility |
| `isAdmin` | `boolean` | Yes | Whether the employee is a facility admin |
| `isActive` | `boolean` | Yes | Whether the employee is active. When `false`, the Firebase Auth account is disabled |
| `profile` | `ProfileModel` | Yes | Employee profile projection |

#### `profile` projection fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | User UID |
| `name` | `string` | Display name |
| `email` | `string` | Email |
| `img` | `string \| null` | Profile photo URL |
| `createdAt` | `Timestamp` | Profile creation date |

```json
{
  "uid": "user-123",
  "joined": "2024-01-15T10:30:00Z",
  "roleId": "role-456",
  "isAdmin": false,
  "isActive": true,
  "profile": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com",
    "img": null,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Security Rules

- **Read:** Any authenticated user can read employees (collection group query enabled).
- **Write:** Facility admins only (via wildcard rule `facilities/{facilityId}/{document=**}`).
- `isActive` is managed exclusively via the `updateEmployee` Cloud Function, which syncs with Firebase Auth `disabled`.

---

## 4. Clients (Facility subcollection)

**Path:** `facilities/{facilityId}/clients/{uid}`
**Constant:** `CLIENT_COLLECTION = 'clients'`

Facility clients. Similar to employees but without roles or admin permissions.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | Yes | Client UID |
| `joined` | `Timestamp` | Yes | Date joined |
| `isActive` | `boolean` | Yes | Whether the client is active |
| `profile` | `ProfileModel` | Yes | Profile projection |

```json
{
  "uid": "client-789",
  "joined": "2024-03-01T10:00:00Z",
  "isActive": true,
  "profile": {
    "id": "client-789",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "img": null,
    "createdAt": "2024-02-28T09:00:00Z"
  }
}
```

### Security Rules

- Managed by facility admins (via wildcard rule).

---

## 5. Roles (Facility subcollection)

**Path:** `facilities/{facilityId}/roles/{roleId}`
**Constant:** `ROLE_COLLECTION = 'roles'`

Roles defined within a facility. Each role has permissions organized by section.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Role ID |
| `name` | `string` | Yes | Role name (unique per facility) |
| `permissions` | `PermissionsBySection` | Yes | Permissions organized by section |

### `permissions` structure

Permissions are stored as an object where each key is a **section** and the value is an array of allowed **actions**:

```typescript
type PermissionsBySection = Partial<Record<PermissionSection, PermissionAction[]>>;
```

**Sections (`PermissionSection`):**

| Value | Description |
|-------|-------------|
| `roles` | Role management |
| `employees` | Employee management |
| `services` | Service management |
| `programming` | Class/programming management |

**Actions (`PermissionAction`):**

| Value | Description |
|-------|-------------|
| `create` | Create |
| `read` | Read |
| `update` | Update |
| `delete` | Delete |

```json
{
  "id": "role-456",
  "name": "Trainer",
  "permissions": {
    "services": ["read"],
    "programming": ["create", "read", "update"],
    "employees": ["read"]
  }
}
```

### Security Rules

| Action | Who can |
|--------|---------|
| `create` | Employees with `roles.create` permission |
| `read` | Any facility employee, or those with `roles.read` permission, or those assigned to that role |
| `update` | Employees with `roles.update` permission |
| `delete` | Employees with `roles.delete` permission |

---

## 6. Services (Facility subcollection)

**Path:** `facilities/{facilityId}/services/{serviceId}`
**Constant:** `SERVICES_COLLECTION = 'services'`

Services offered by a facility (e.g., "Yoga", "CrossFit", "Pilates").

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Service ID |
| `name` | `string` | Yes | Service name |
| `description` | `string` | No | Service description |
| `isActive` | `boolean` | Yes | Whether the service is active |
| `createdAt` | `Timestamp` | Yes | Creation date |
| `updatedAt` | `Timestamp` | Yes | Last update date |
| `planIds` | `string[]` | No | IDs of plans that include this service |

```json
{
  "id": "service-001",
  "name": "Yoga",
  "description": "Beginner-friendly yoga sessions",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-02-01T14:00:00Z",
  "planIds": ["plan-001", "plan-002"]
}
```

### Security Rules

| Action | Who can |
|--------|---------|
| `create` | Employees with `services.create` permission or facility admin |
| `read` | Employees with `services.read` permission or any facility employee |
| `update` | Employees with `services.update` permission or facility admin |
| `delete` | Employees with `services.delete` permission or facility admin |

---

## 7. Schedules (Service subcollection)

**Path:** `facilities/{facilityId}/services/{serviceId}/schedules/{scheduleId}`
**Constant:** `SCHEDULES_COLLECTION = 'schedules'`

Recurring weekly schedules for a service.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Schedule ID |
| `dayOfWeek` | `DayOfWeek` | Yes | Day of the week (`mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`) |
| `startTime` | `string` | Yes | Start time in `HH:mm` format (e.g., `"09:00"`) |
| `durationMinutes` | `number` | Yes | Duration in minutes (> 0) |
| `capacity` | `number` | Yes | Maximum participant capacity (> 0) |
| `minReserveMinutes` | `number` | Yes | Minimum minutes in advance to reserve (>= 0) |
| `minCancelMinutes` | `number` | Yes | Minimum minutes in advance to cancel (>= 0) |
| `isActive` | `boolean` | Yes | Whether the schedule is active |
| `createdAt` | `Timestamp` | Yes | Creation date |
| `updatedAt` | `Timestamp` | Yes | Last update date |

```json
{
  "id": "schedule-001",
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

### Security Rules

- Inherited from parent service (covered by facility admin wildcard rule).

---

## 8. Classes (Facility subcollection)

**Path:** `facilities/{facilityId}/classes/{classId}`
**Constant:** `CLASSES_COLLECTION = 'classes'`

Concrete class instances generated from schedules. Each represents a class on a specific date and time.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Class ID |
| `serviceId` | `string` | Yes | Parent service ID |
| `facilityId` | `string` | Yes | Facility ID |
| `scheduleId` | `string` | Yes | Schedule ID that generated this class |
| `date` | `Timestamp` | Yes | Class date |
| `startAt` | `string` | Yes | Start time (`HH:mm` format) |
| `duration` | `number` | Yes | Duration in minutes |
| `capacity` | `number` | Yes | Maximum capacity |
| `instructorId` | `string \| null` | No | Assigned instructor UID |
| `userBookings` | `string[]` | Yes | Array of UIDs of users who booked |
| `program` | `ClassProgram \| null` | No | Class program/content |
| `programTitle` | `string \| null` | No | Program title |

#### `ClassProgram` structure

| Field | Type | Description |
|-------|------|-------------|
| `type` | `ProgramType` | Content type (`rich_text`) |
| `value` | `string` | Program content |

```json
{
  "id": "class-001",
  "serviceId": "service-001",
  "facilityId": "facility-123",
  "scheduleId": "schedule-001",
  "date": "2024-03-04T00:00:00Z",
  "startAt": "09:00",
  "duration": 60,
  "capacity": 20,
  "instructorId": "user-123",
  "userBookings": ["client-789", "client-456"],
  "program": {
    "type": "rich_text",
    "value": "<p>Warmup 10 min...</p>"
  },
  "programTitle": "Strength Class - Week 1"
}
```

### Security Rules

| Action | Who can |
|--------|---------|
| `create` | Employees with `programming.create` permission or facility admin |
| `read` | Any authenticated user |
| `update` | Employees with `programming.update` permission or facility admin |
| `delete` | Employees with `programming.delete` permission or facility admin |

---

## 9. Plans (Facility subcollection)

**Path:** `facilities/{facilityId}/plans/{planId}`
**Constant:** `PLANS_COLLECTION = 'plans'`

Subscription/membership plans that bundle services with class limits.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Plan ID |
| `name` | `string` | Yes | Plan name |
| `description` | `string` | Yes | Plan description |
| `cost` | `number` | Yes | Plan cost |
| `currency` | `string` | Yes | Currency (e.g., `"USD"`, `"MXN"`) |
| `duration` | `object` | Yes | Plan duration |
| `services` | `PlanService[]` | Yes | Services included in the plan |
| `active` | `boolean` | Yes | Whether the plan is active |

#### `duration` structure

| Field | Type | Description |
|-------|------|-------------|
| `type` | `PlanDuration` | Duration type |
| `days` | `number \| null` | Custom days (required if `type` is `custom`) |

**`PlanDuration` values:**

| Value | Label |
|-------|-------|
| `monthly` | Monthly |
| `bimonthly` | Bimonthly |
| `quarterly` | Quarterly |
| `semiannually` | Semiannually |
| `annually` | Annually |
| `custom` | Custom (days) |

#### `PlanService` structure

| Field | Type | Description |
|-------|------|-------------|
| `serviceId` | `string` | Included service ID |
| `classLimitType` | `ClassLimitType` | Limit type (`fixed` or `unlimited`) |
| `classLimit` | `number \| null` | Number of classes (required if `classLimitType` is `fixed`) |

```json
{
  "id": "plan-001",
  "name": "Premium Plan",
  "description": "Access to all services",
  "cost": 1500,
  "currency": "MXN",
  "duration": {
    "type": "monthly",
    "days": null
  },
  "services": [
    {
      "serviceId": "service-001",
      "classLimitType": "unlimited",
      "classLimit": null
    },
    {
      "serviceId": "service-002",
      "classLimitType": "fixed",
      "classLimit": 8
    }
  ],
  "active": true
}
```

### Security Rules

- Facility admins only (no specific rules; covered by wildcard rule).

---

## 10. Subscriptions (Facility subcollection)

**Path:** `facilities/{facilityId}/subscriptions/{subscriptionId}`
**Constant:** `SUBSCRIPTION_COLLECTION = 'subscriptions'`

Links a client to a plan within a facility. Tracks class usage per service.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Subscription ID |
| `clientId` | `string` | Yes | Client UID |
| `planId` | `string` | Yes | Associated plan ID |
| `planName` | `string` | Yes | Plan name (denormalized at creation time) |
| `facilityId` | `string` | Yes | Facility ID |
| `status` | `SubscriptionStatus` | Yes | Subscription status (`active`, `expired`, `cancelled`) |
| `startDate` | `Timestamp` | Yes | Subscription start date |
| `endDate` | `Timestamp` | Yes | Subscription end date (calculated from plan duration) |
| `classesUsed` | `Record<string, number>` | Yes | Classes used per service: `{ [serviceId]: count }` |
| `createdBy` | `string` | Yes | UID of whoever created this (admin or client) |

```json
{
  "id": "sub-001",
  "clientId": "client-789",
  "planId": "plan-001",
  "planName": "Premium Plan",
  "facilityId": "facility-123",
  "status": "active",
  "startDate": "2024-03-01T00:00:00Z",
  "endDate": "2024-04-01T00:00:00Z",
  "classesUsed": {
    "service-001": 5,
    "service-002": 2
  },
  "createdBy": "admin-456"
}
```

### Security Rules

| Action | Who can |
|--------|---------|
| `create` | Via Cloud Function only |
| `read` | Facility admin or the subscription owner (`clientId == uid`) |
| `update` | Via Cloud Functions only (`bookClass`, `cancelBooking`) |
| `delete` | Facility admin |

---

## 11. Bookings (Facility subcollection)

**Path:** `facilities/{facilityId}/bookings/{bookingId}`
**Constant:** `BOOKING_COLLECTION = 'bookings'`

Individual class booking records. Created and cancelled via Cloud Functions.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Booking ID |
| `clientId` | `string` | Yes | Client UID |
| `classId` | `string` | Yes | Booked class ID |
| `serviceId` | `string` | Yes | Service ID (denormalized for queries) |
| `facilityId` | `string` | Yes | Facility ID |
| `subscriptionId` | `string` | Yes | Subscription used for this booking |
| `status` | `BookingStatus` | Yes | Booking status (`confirmed`, `cancelled`, `completed`) |
| `bookedAt` | `Timestamp` | Yes | When the booking was made |
| `cancelledAt` | `Timestamp \| null` | No | When the booking was cancelled |
| `classDate` | `Timestamp` | Yes | Class date (denormalized) |
| `classStartAt` | `string` | Yes | Class start time in `HH:mm` format (denormalized) |

```json
{
  "id": "booking-001",
  "clientId": "client-789",
  "classId": "class-001",
  "serviceId": "service-001",
  "facilityId": "facility-123",
  "subscriptionId": "sub-001",
  "status": "confirmed",
  "bookedAt": "2024-03-02T08:00:00Z",
  "cancelledAt": null,
  "classDate": "2024-03-04T00:00:00Z",
  "classStartAt": "09:00"
}
```

### Security Rules

| Action | Who can |
|--------|---------|
| `create` | Via `bookClass` Cloud Function only |
| `read` | Facility admin or the booking owner (`clientId == uid`) |
| `update` | Via `cancelBooking` Cloud Function only |
| `delete` | Facility admin |

---

## Security Rules Summary

### System Roles

| Role | Description | How it's determined |
|------|-------------|---------------------|
| `super_admin` | Global platform administrator | Custom claim `role == 'super_admin'` in Firebase Auth token |
| Facility Admin | Administrator of a specific facility | `employees/{uid}.isAdmin == true` |
| Facility Employee | Employee with role-based permissions | Document exists in `employees/{uid}` |
| Facility Client | Facility client | Document exists in `clients/{uid}` |

### Helper Functions in Rules

| Function | Description |
|----------|-------------|
| `isSuperAdmin(request)` | Checks that token has `role == 'super_admin'` |
| `isAuth(request)` | Checks that user is authenticated |
| `isFacilityAdmin(request, facilityId)` | Checks that user is an employee with `isAdmin == true` |
| `isFacilityEmployee(request, facilityId)` | Checks that user exists as a facility employee |
| `isFacilityClient(request, facilityId)` | Checks that user exists as a facility client |
| `belongsToFacility(request, facilityId)` | Checks that user is an employee OR client |
| `hasPermission(request, facilityId, section, action)` | Checks that the employee's role has the specific permission |

### Important Wildcard Rule

```
match /facilities/{facilityId}/{document=**} {
  allow read, write: if isFacilityAdmin(request, facilityId);
}
```

**Facility admins** have full read and write access to **all** subcollections within their facility. The specific subcollection rules apply to non-admin employees.

### Summary by Collection

| Collection | Create | Read | Update | Delete |
|------------|--------|------|--------|--------|
| `profiles/{uid}` | Owner | Owner | Owner | Owner |
| `facilities/{fId}` | super_admin | super_admin / members | super_admin | super_admin |
| `employees/{uid}` | Admin | Any authenticated | Admin | Admin |
| `clients/{uid}` | Admin | Admin | Admin | Admin |
| `roles/{rId}` | `roles.create` | Employee / `roles.read` / assigned role | `roles.update` | `roles.delete` |
| `services/{sId}` | `services.create` / Admin | `services.read` / Employee | `services.update` / Admin | `services.delete` / Admin |
| `schedules/{schId}` | Admin | Admin | Admin | Admin |
| `classes/{cId}` | `programming.create` / Admin | Any authenticated | `programming.update` / Admin | `programming.delete` / Admin |
| `plans/{pId}` | Admin | Admin | Admin | Admin |
| `subscriptions/{sId}` | Cloud Function | Admin / Owner | Cloud Function | Admin |
| `bookings/{bId}` | Cloud Function | Admin / Owner | Cloud Function | Admin |

---

## Validation & Business Rules

- **Role uniqueness:** Role `name` must be unique per facility (enforced via Cloud Functions).
- **Schedule uniqueness:** The combination `(dayOfWeek, startTime)` must be unique per service (enforced via Cloud Functions).
- `durationMinutes` > 0
- `capacity` > 0
- `minReserveMinutes` >= 0
- `minCancelMinutes` >= 0
- Employee `isActive` syncs with Firebase Auth `disabled` via the `updateEmployee` Cloud Function.

---

## Reference Enums

### DayOfWeek

| Value | Label |
|-------|-------|
| `mon` | Monday |
| `tue` | Tuesday |
| `wed` | Wednesday |
| `thu` | Thursday |
| `fri` | Friday |
| `sat` | Saturday |
| `sun` | Sunday |

### ProgramType

| Value | Description |
|-------|-------------|
| `rich_text` | Rich text content (HTML) |

### SubscriptionStatus

| Value | Label |
|-------|-------|
| `active` | Activo |
| `expired` | Expirado |
| `cancelled` | Cancelado |

### BookingStatus

| Value | Label |
|-------|-------|
| `confirmed` | Confirmado |
| `cancelled` | Cancelado |
| `completed` | Completado |
