# Services — Feature Specification

This document describes the new "Services" functionality for the admin app. A service represents something users can book at a facility (e.g., classes, therapy sessions). We start with the data model to enable creation and management of services and their weekly schedules. The system integrates with Firebase Firestore and uses the existing RBAC (Role-Based Access Control) system for permissions.

## Purpose and main needs
- Define services per facility with basic information and activation state.
- Define weekly schedules for each service, including rules per schedule:
  - capacity (number of seats)
  - minimum minutes in advance to reserve
  - minimum minutes in advance to cancel
  - responsible employee for the schedule
  - activation state per schedule
- Avoid duplicate schedules for the same service at the exact same day and time.

## Functional requirements (so far)
- Create, edit, deactivate/activate and list services with: name, description, facility, created_at, is_active.
- Create, edit, deactivate/activate and list schedules per service with: day_of_week, start_time, duration_minutes, employee_id, capacity, min_reserve_minutes, min_cancel_minutes.
- If a service is inactive, its schedules are considered effectively inactive (service state has priority).
- Prevent exact duplicates of weekly schedules per service for the same start time and day (optional constraint below).
- Out of scope now: bookings/reservations, payments.

---

## Solution: Firebase Firestore Design (MVP)

Scope: Only entities for services and their weekly schedules with per-schedule rules. No bookings yet. Permissions are enforced through Firestore Security Rules using the existing RBAC system.

### Data Types

- **day_of_week**: `DayOfWeek` enum (`'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'`)

### Firestore Collections

#### Services Collection
**Path:** `facilities/{facilityId}/services/{serviceId}`

**Document Fields:**
```typescript
interface Service {
  name: string;                    // Service name (e.g., "Yoga Class")
  description?: string;            // Optional description
  isActive: boolean;              // Service activation state (default: true)
  createdAt: Timestamp;           // Creation timestamp
  updatedAt: Timestamp;           // Last update timestamp
}
```

#### Service Schedules Subcollection
**Path:** `facilities/{facilityId}/services/{serviceId}/schedules/{scheduleId}`

**Document Fields:**
```typescript
interface ServiceSchedule {
  dayOfWeek: DayOfWeek;           // Day of the week enum
  startTime: string;              // Time in HH:MM format (e.g., "09:00")
  durationMinutes: number;        // Duration in minutes (must be > 0)
  employeeId: string;             // UID of responsible employee
  capacity: number;               // Number of seats (must be > 0)
  minReserveMinutes: number;      // Minimum minutes in advance to reserve (default: 0)
  minCancelMinutes: number;       // Minimum minutes in advance to cancel (default: 0)
  isActive: boolean;              // Schedule activation state (default: true)
  createdAt: Timestamp;           // Creation timestamp
  updatedAt: Timestamp;           // Last update timestamp
}
```

### Data Relationships

- Services belong to a facility via the collection path structure
- Service schedules belong to a service via the subcollection path structure
- Service schedules reference employees via `employeeId` (must be facility employees)
- When a service is deleted, all its schedules are automatically deleted (subcollection behavior)

### Data Validation

- **Duration validation**: `durationMinutes > 0`
- **Capacity validation**: `capacity > 0`
- **Time validation**: `minReserveMinutes >= 0` and `minCancelMinutes >= 0`
- **Duplicate prevention**: Application-level validation to prevent exact duplicate schedules (same service, day, and start time)


---

## Firestore Security Rules Implementation

The goal is to guarantee tenant isolation by facility and least-privilege access. Security rules are implemented in `firestore.rules` using the existing RBAC system with the `hasPermission` helper function.

### Security Rules Structure

Services and schedules are protected under the facility path structure:
- Services: `facilities/{facilityId}/services/{serviceId}`
- Schedules: `facilities/{facilityId}/services/{serviceId}/schedules/{scheduleId}`

### Permission Model

The system uses the existing RBAC permissions model with the `services` section:
- **Read permission**: `services:read`
- **Create permission**: `services:create`
- **Update permission**: `services:update`
- **Delete permission**: `services:delete`

### Security Rules Implementation

```javascript
// firestore.rules

match /facilities/{facilityId} {
  // Services collection rules
  match /services/{serviceId} {
    allow create: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'services', 'create');
    allow read: if isFacilityEmployee(request, facilityId) || hasPermission(request, facilityId, 'services', 'read');
    allow update: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'services', 'update');
    allow delete: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'services', 'delete');
    
    // Service schedules subcollection rules
    match /schedules/{scheduleId} {
      allow create: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'services', 'create');
      allow read: if isFacilityEmployee(request, facilityId) || hasPermission(request, facilityId, 'services', 'read');
      allow update: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'services', 'update');
      allow delete: if isFacilityAdmin(request, facilityId) || hasPermission(request, facilityId, 'services', 'delete');
    }
  }
}
```

### Access Control Details

- **Facility Isolation**: Services and schedules are automatically isolated by facility through the collection path structure
- **Employee Validation**: The `employeeId` in schedules must reference a valid facility employee (enforced by application logic)
- **Admin Override**: Facility admins have full access to all services and schedules within their facility
- **Permission-Based Access**: Non-admin users require specific permissions in the `services` section
- **Business Logic**: The `isActive` flags are handled by application logic, not security rules

### Data Integrity

- **Cross-facility Prevention**: The path structure prevents cross-facility data access
- **Employee Validation**: Application-level validation ensures `employeeId` references valid facility employees
- **Cascade Deletion**: When a service is deleted, all its schedules are automatically removed (subcollection behavior)


---

## UI Architecture (high‑level)

Goal: decouple Service management from Schedule management while keeping an easy workflow to jump between them. Creation/edition of schedules happens in a dedicated area to support batch creation by time slots and multiple weekdays.

### Routes
- `/home/services` → Services list
- `/home/services/create` → Create service (only service data)
- `/home/services/:id/edit` → Edit service. Incluye una pestaña interna “Schedules” con:
  - Calendario semanal de horarios del servicio
- `/home/services/:id/schedules/create` → Batch create schedules (wizard)
- `/home/services/:id/schedules/:scheduleId/edit` → Edit a single schedule

These routes se cargan bajo `home` como en `users` y `permissions`.


### Reuse of existing UI library
- Use `ui-layout`, `ui-button`, `ui-select`, `ConfirmComponent`, and CdkTable to stay consistent with `users` and `permissions` features.
