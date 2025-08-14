## Supabase → Firebase Migration Guide (Postgres/RLS to Firestore/Rules)

This guide explains how to migrate the current Supabase database and security model to Firebase. It maps the Postgres schema, RLS policies, and RPC functions found in `supabase/migrations/` to Firestore collections, Firebase Security Rules, and Cloud Functions. All examples use Firestore (not Realtime Database) and the Firebase Admin/Client SDKs.

The guide assumes:
- You are using Firebase Authentication (email/password, OAuth, etc.) and will keep `uid` as the canonical user id.
- You will use Cloud Firestore as the primary database.
- Security is enforced with Firestore Rules plus server-side integrity via Cloud Functions (for uniqueness, FK-like checks, and cascading behaviors).

---

## 1) Source schema overview (from Supabase/Postgres)

Tables and key constraints as defined across migrations:

- `facility (id, created_at, name, logo)` — RLS enabled
- `facility_user (facility_id, profile_id, joined)` — PK `(facility_id, profile_id)`; RLS enabled
- `profile (id, created_at, name, role_id)` — `id` is FK to `auth.users(id)`; RLS enabled
- `role (id, created_at, name, description, facility_id)` — UNIQUE `(facility_id, name)`; RLS enabled
- `permissions (id, created_at, action, section, role_id)` — `action :: permission_action`, `section :: sections`; FK `role_id → role(id)`; RLS enabled
- `service (id, created_at, facility_id, name, description, is_active)` — RLS enabled
- `service_schedule (id, service_id, day_of_week, start_time, duration_minutes, employee_id, capacity, min_reserve_minutes, min_cancel_minutes, is_active)` — RLS enabled; UNIQUE `(service_id, day_of_week, start_time)`

Enums:
- `permission_action = {'read','edit','delete','create'}`
- `sections = {'permissions','users','services'}`
- `day_of_week = {'mon','tue','wed','thu','fri','sat','sun'}`

RLS highlights (summarized):
- Many read policies allow `authenticated` users to read.
- Write operations on `role` and `permissions` are limited to users whose `profile.role_id` belongs to a `role` named `admin` (or who otherwise possess the relevant permission).
- Facility membership drives access to `facility`, `facility_user`, and indirectly to other entities connected by `facility_id`.
- Service role (backend key) bypasses RLS fully.

RPC functions:
- `create_role_with_permissions(role_name, permissions_jsonb, facility_id)`
- `update_role_with_permissions(role_id, new_role_name, new_permissions_jsonb, permissions_to_delete int[])`

---

## 2) Target data model in Firestore

Firestore is document/collection oriented. We will use hierarchical data located under `facilities/{facilityId}` where it simplifies authorization and queries.

Recommended collections and subcollections:

- `profiles/{uid}`
  - Fields: `createdAt`, `name`, `defaultFacilityId?`
  - This mirrors `profile` rows. The Firestore `uid` equals Supabase `auth.users.id`.

- `facilities/{facilityId}`
  - Fields: `createdAt`, `name`, `logo`
  - Subcollections:
    - `members/{uid}`
      - Fields: `joined`, `roleId`, `permissions` (array of strings, e.g. `['services.read','services.edit']`) [denormalized for Rules performance]
    - `roles/{roleId}`
      - Fields: `name`, `description`
      - Subcollection: `permissions/{permissionId}`
        - Fields: `action` in `{'read','edit','delete','create'}`, `section` in `{'permissions','users','services'}`
    - `services/{serviceId}`
      - Fields: `name`, `description`, `isActive`, `createdAt`
      - Subcollection: `schedules/{scheduleId}`
        - Fields: `dayOfWeek` in `{'mon','tue','wed','thu','fri','sat','sun'}`, `startTime` (HH:mm or ISO time), `durationMinutes` (>0), `employeeId` (uid), `capacity` (>0), `minReserveMinutes` (>=0), `minCancelMinutes` (>=0), `isActive` (bool)

Notes:
- Storing `permissions` as documents under `roles` maintains parity with the relational model. For faster authorization in Firestore Rules, we denormalize a `permissions` array into each `members/{uid}` doc at write time.
- Alternatively, you can skip the `roles/{roleId}/permissions` subcollection and store a flattened set of permission keys directly on `members/{uid}`. The structure above keeps both options and recommends denormalization to `members`.

---

## 3) Security model in Firebase

### 3.1 Concepts and helpers

- Authentication: `request.auth.uid` is the user id.
- Membership: user belongs to a facility if `facilities/{facilityId}/members/{uid}` exists.
- Authorization: check the `permissions` array on the membership doc, or read role permissions if you do not denormalize. Denormalization is preferred for Rules readability and performance.

Helper predicates (pseudocode):
- `isMember(facilityId) := exists(/facilities/$(facilityId)/members/$(uid))`
- `hasPerm(facilityId, permKey) := get(/facilities/$(facilityId)/members/$(uid)).data.permissions.hasOnly([permKey])` (implement with array membership)

### 3.2 Firestore Security Rules (v2) — baseline

Create `firestore.rules` with rules equivalent to RLS. Adjust the project id and paths as needed.

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    function uid() { return request.auth.uid; }
    function isMember(facilityId) {
      return exists(/databases/$(database)/documents/facilities/$(facilityId)/members/$(uid()));
    }
    function memberDoc(facilityId) {
      return get(/databases/$(database)/documents/facilities/$(facilityId)/members/$(uid()));
    }
    function hasPerm(facilityId, perm) {
      return isSignedIn() && isMember(facilityId) &&
             perm in memberDoc(facilityId).data.permissions;
    }

    // Profiles: user can read their own profile
    match /profiles/{userId} {
      allow read: if isSignedIn() && userId == uid();
      // Writes generally via privileged servers or controlled flows
      allow create, update: if isSignedIn() && userId == uid();
      allow delete: if false;
    }

    // Facilities: readable only for members
    match /facilities/{facilityId} {
      allow read: if isSignedIn() && isMember(facilityId);
      // Writes typically restricted to admins; use service/Admin SDK for bootstrap
      allow create, update, delete: if hasPerm(facilityId, 'permissions.edit');

      // Members — a member can read their own membership
      match /members/{memberId} {
        allow read: if isSignedIn() && memberId == uid() && isMember(facilityId);
        // Mutations generally through server (to manage roles/permissions)
        allow create, update, delete: if hasPerm(facilityId, 'users.edit');
      }

      // Roles — readable for members; write restricted to admin-equivalent
      match /roles/{roleId} {
        allow read: if isSignedIn() && isMember(facilityId);
        allow create, update, delete: if hasPerm(facilityId, 'permissions.edit');

        match /permissions/{permissionId} {
          allow read: if isSignedIn() && isMember(facilityId);
          allow create, update, delete: if hasPerm(facilityId, 'permissions.edit');
        }
      }

      // Services — readable for members; writes gated by services.*
      match /services/{serviceId} {
        allow read: if isSignedIn() && isMember(facilityId);
        allow create: if hasPerm(facilityId, 'services.create');
        allow update: if hasPerm(facilityId, 'services.edit');
        allow delete: if hasPerm(facilityId, 'services.delete');

        // Schedules under a service
        match /schedules/{scheduleId} {
          allow read: if isSignedIn() && isMember(facilityId);
          allow create, update: if hasPerm(facilityId, 'services.edit') &&
            // Basic field checks mirroring DB constraints
            request.resource.data.durationMinutes is int && request.resource.data.durationMinutes > 0 &&
            request.resource.data.capacity is int && request.resource.data.capacity > 0 &&
            request.resource.data.minReserveMinutes is int && request.resource.data.minReserveMinutes >= 0 &&
            request.resource.data.minCancelMinutes is int && request.resource.data.minCancelMinutes >= 0 &&
            // Employee must be a member of the same facility
            exists(/databases/$(database)/documents/facilities/$(facilityId)/members/$(request.resource.data.employeeId));

          allow delete: if hasPerm(facilityId, 'services.delete');
        }
      }
    }
  }
}
```

Notes:
- Admin SDK on the server bypasses Rules (similar to Supabase service role), which you can use for seeding/migrations.
- If you prefer strict parity with Supabase “admin role by name”, include that in `permissions` as `permissions.edit`.

---

## 4) Server-side integrity with Cloud Functions

Firestore does not enforce relational constraints or uniqueness by default. Use Cloud Functions (Node/TypeScript) with transactions to implement:

- Uniqueness: `roles` unique `name` per `facility` and `service_schedule` unique `(dayOfWeek, startTime)` per `service`.
- FK checks: ensure referenced `employeeId` is a member of the facility (Rules already check, but validate server-side too).
- Cascades: when deleting a role, cascade delete `permissions`; when deleting a service, cascade delete `schedules`.
- RPC equivalents of Postgres functions:
  - `createRoleWithPermissions(roleName, permissions[], facilityId)`
  - `updateRoleWithPermissions(roleId, newName, newPermissions[], permissionIdsToDelete[])`

Example (simplified, TS):

```ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2/https';

admin.initializeApp();
const db = admin.firestore();

type Permission = { action: 'read'|'edit'|'delete'|'create'; section: 'permissions'|'users'|'services' };

export const createRoleWithPermissions = functions.onCall(async (request) => {
  const { facilityId, roleName, permissions } = request.data as {
    facilityId: string; roleName: string; permissions: Permission[];
  };

  return await db.runTransaction(async (tx) => {
    const facilityRef = db.doc(`facilities/${facilityId}`);
    const rolesCol = facilityRef.collection('roles');

    // Uniqueness check
    const existing = await tx.get(rolesCol.where('name', '==', roleName).limit(1));
    if (!existing.empty) throw new functions.https.HttpsError('already-exists', 'Role name must be unique per facility');

    const roleRef = rolesCol.doc();
    tx.set(roleRef, { name: roleName, description: '' });

    permissions.forEach((p) => {
      const permRef = roleRef.collection('permissions').doc();
      tx.set(permRef, { action: p.action, section: p.section });
    });

    return { roleId: roleRef.id };
  });
});

export const updateRoleWithPermissions = functions.onCall(async (request) => {
  const { facilityId, roleId, newRoleName, newPermissions, permissionsToDelete } = request.data as {
    facilityId: string; roleId: string; newRoleName: string; newPermissions: Permission[]; permissionsToDelete: string[];
  };

  return await db.runTransaction(async (tx) => {
    const roleRef = db.doc(`facilities/${facilityId}/roles/${roleId}`);
    const roleSnap = await tx.get(roleRef);
    if (!roleSnap.exists) throw new functions.https.HttpsError('not-found', 'Role not found');

    // Optional uniqueness check on name change
    if (newRoleName && newRoleName !== roleSnap.get('name')) {
      const dup = await tx.get(roleRef.parent.where('name', '==', newRoleName).limit(1));
      if (!dup.empty) throw new functions.https.HttpsError('already-exists', 'Role name must be unique per facility');
      tx.update(roleRef, { name: newRoleName });
    }

    // Delete selected permissions
    for (const permId of permissionsToDelete ?? []) {
      tx.delete(roleRef.collection('permissions').doc(permId));
    }

    // Insert new permissions
    for (const p of newPermissions ?? []) {
      const permRef = roleRef.collection('permissions').doc();
      tx.set(permRef, { action: p.action, section: p.section });
    }
  });
});

// Enforce unique schedule per (serviceId, dayOfWeek, startTime)
export const onCreateSchedule = functions.onCall(async (request) => {
  const { facilityId, serviceId, schedule } = request.data as {
    facilityId: string; serviceId: string; schedule: { dayOfWeek: string; startTime: string };
  };
  return await db.runTransaction(async (tx) => {
    const col = db.collection(`facilities/${facilityId}/services/${serviceId}/schedules`);
    const dup = await tx.get(col
      .where('dayOfWeek', '==', schedule.dayOfWeek)
      .where('startTime', '==', schedule.startTime)
      .limit(1));
    if (!dup.empty) throw new functions.https.HttpsError('already-exists', 'Duplicate schedule for same day/time');
    const ref = col.doc();
    tx.set(ref, schedule);
    return { scheduleId: ref.id };
  });
});
```

Additional recommended Functions:
- Membership management (assign role, recompute and write `members/{uid}.permissions`).
- Cascades on delete (role → permissions; service → schedules), ideally via Admin operations or scheduled cleanup jobs.

---

## 5) Data migration plan

High-level steps:

1. Export from Supabase/Postgres
   - Dump the relevant tables as JSON (keeping UUIDs): `facility`, `facility_user`, `profile`, `role`, `permissions`, `service`, `service_schedule`.
   - Optionally export a computed view to map `facility_user` rows to the corresponding `role_id` via `profile.role_id` and `role.facility_id`.

2. Prepare Firebase project
   - Enable Authentication providers.
   - Create Firestore in Native mode.
   - Deploy initial Firestore Rules (read-only or Admin-only) to block public writes during migration.

3. Write an idempotent import script (Node.js + Admin SDK)
   - Keep Supabase UUIDs as Firestore document IDs when possible for traceability.
   - Create `profiles/{uid}` for each `profile`.
   - Create `facilities/{facilityId}`.
   - For each `role` with `facility_id`, create `facilities/{facilityId}/roles/{roleId}`.
   - For each `permission (role_id)`, create `facilities/{facilityId}/roles/{roleId}/permissions/{permId}` with fields `action`, `section`.
   - For each `facility_user (facility_id, profile_id)`, create `facilities/{facilityId}/members/{uid}` with `joined`, `roleId`, and a computed `permissions` array by reading the role’s permission docs and mapping to `'section.action'` strings.
   - For each `service`, create `facilities/{facilityId}/services/{serviceId}` with mapped fields.
   - For each `service_schedule`, create `facilities/{facilityId}/services/{serviceId}/schedules/{scheduleId}` with mapped fields and normalized types.

4. Define Firestore indexes
   - Queries you will likely need:
     - `facilities/{id}/services` filtered by `isActive`.
     - `facilities/{id}/services/{sid}/schedules` filtered by `dayOfWeek` or by `isActive`.
   - Add required composite indexes in `firestore.indexes.json` as the app prompts during development.

5. Switch application code
   - Replace Supabase client calls with Firebase Web SDK:
     - Services list by facility:
       - Supabase: `from('service').select('*').eq('facility_id', facilityId)`
       - Firestore: `collection(db, 'facilities', facilityId, 'services')`
     - Create/update/delete likewise via `addDoc`, `setDoc`, `updateDoc`, `deleteDoc`.
     - Schedules by service:
       - Firestore: `collection(db, 'facilities', facilityId, 'services', serviceId, 'schedules')`
   - Calls that must be transactional/validated for uniqueness (roles, schedules) should be routed through Cloud Functions shown above.

6. Enable full Rules and Functions
   - After verifying data and app flows, deploy the strict Rules in this guide and the Cloud Functions.
   - Keep Admin-only backdoor via server (Admin SDK) for migrations and support tasks.

---

## 6) Schema mapping reference

| Supabase (table) | Firestore (path) | Key fields mapping |
| --- | --- | --- |
| `profile` | `profiles/{uid}` | `id → uid`, `name`, `created_at → createdAt`, `role_id → facilities/{fid}/members/{uid}.roleId` |
| `facility` | `facilities/{facilityId}` | `id`, `name`, `logo`, `created_at → createdAt` |
| `facility_user` | `facilities/{facilityId}/members/{uid}` | `joined`, `roleId` + computed `permissions[]` |
| `role` | `facilities/{facilityId}/roles/{roleId}` | `name`, `description` |
| `permissions` | `facilities/{facilityId}/roles/{roleId}/permissions/{permissionId}` | `action`, `section` |
| `service` | `facilities/{facilityId}/services/{serviceId}` | `name`, `description`, `is_active → isActive`, `created_at → createdAt` |
| `service_schedule` | `facilities/{facilityId}/services/{serviceId}/schedules/{scheduleId}` | `day_of_week → dayOfWeek`, `start_time → startTime`, `duration_minutes`, `employee_id`, `capacity`, `min_*`, `is_active → isActive` |

Enums → strings:
- `permission_action` → `action` string
- `sections` → `section` string
- `day_of_week` → `dayOfWeek` string

Uniqueness constraints:
- `UNIQUE (facility_id, role.name)` → Cloud Function transaction checking `roles.where('name','==',name)` under facility.
- `UNIQUE (service_id, day_of_week, start_time)` → Cloud Function transaction checking schedules under service.

Foreign keys and cascades:
- Enforce via Rules (read) and Functions (write). Use Admin jobs or Function triggers for cascades on delete.

---

## 7) Validation and testing checklist

- Import script completes with no errors; document counts match.
- Firestore Rules:
  - A member can read their `facility`, their `profile`, and their `members/{uid}` doc.
  - Non-members cannot read other facilities.
  - Only users with `services.create|edit|delete` can mutate services/schedules.
  - Only users with `permissions.edit` can mutate roles/permissions.
- Cloud Functions:
  - Creating a role with a duplicate name within the same facility fails.
  - Creating a duplicate schedule for same `(dayOfWeek,startTime)` fails.
  - Assigning/removing roles recomputes `members/{uid}.permissions` denormalized array.
- Indexes exist for the most common queries; no missing index errors in the console.

---

## 8) Example import snippet (Node.js)

```ts
import * as admin from 'firebase-admin';
import { readFileSync } from 'node:fs';

admin.initializeApp();
const db = admin.firestore();

type Facility = { id: string; name: string; logo?: string; created_at: string };
type Role = { id: string; name: string; description?: string; facility_id: string };
type Permission = { id: string; action: string; section: string; role_id: string };
type Profile = { id: string; name?: string; created_at: string; role_id?: string };
type FacilityUser = { facility_id: string; profile_id: string; joined: string };
type Service = { id: string; facility_id: string; name: string; description?: string; is_active: boolean; created_at: string };
type Schedule = { id: string; service_id: string; day_of_week: string; start_time: string; duration_minutes: number; employee_id: string; capacity: number; min_reserve_minutes: number; min_cancel_minutes: number; is_active: boolean };

async function importAll() {
  const facilities: Facility[] = JSON.parse(readFileSync('export/facility.json', 'utf8'));
  const roles: Role[] = JSON.parse(readFileSync('export/role.json', 'utf8'));
  const permissions: Permission[] = JSON.parse(readFileSync('export/permissions.json', 'utf8'));
  const profiles: Profile[] = JSON.parse(readFileSync('export/profile.json', 'utf8'));
  const facilityUsers: FacilityUser[] = JSON.parse(readFileSync('export/facility_user.json', 'utf8'));
  const services: Service[] = JSON.parse(readFileSync('export/service.json', 'utf8'));
  const schedules: Schedule[] = JSON.parse(readFileSync('export/service_schedule.json', 'utf8'));

  // Index permissions by role for denormalization
  const rolePerms = new Map<string, string[]>();
  for (const p of permissions) {
    const key = p.role_id;
    const list = rolePerms.get(key) ?? [];
    list.push(`${p.section}.${p.action}`);
    rolePerms.set(key, list);
  }

  // Facilities
  for (const f of facilities) {
    await db.doc(`facilities/${f.id}`).set({ name: f.name, logo: f.logo ?? null, createdAt: f.created_at });
  }

  // Roles and permissions
  for (const r of roles) {
    const roleRef = db.doc(`facilities/${r.facility_id}/roles/${r.id}`);
    await roleRef.set({ name: r.name, description: r.description ?? '' });
    const perms = permissions.filter((p) => p.role_id === r.id);
    for (const p of perms) {
      await roleRef.collection('permissions').doc(p.id).set({ action: p.action, section: p.section });
    }
  }

  // Profiles
  for (const p of profiles) {
    await db.doc(`profiles/${p.id}`).set({ name: p.name ?? '', createdAt: p.created_at });
  }

  // Facility members (with denormalized permissions)
  for (const m of facilityUsers) {
    const perms = rolePerms.get(profiles.find((p) => p.id === m.profile_id)?.role_id ?? '') ?? [];
    await db.doc(`facilities/${m.facility_id}/members/${m.profile_id}`).set({ joined: m.joined, roleId: profiles.find((p) => p.id === m.profile_id)?.role_id ?? null, permissions: perms });
  }

  // Services and schedules
  for (const s of services) {
    const serviceRef = db.doc(`facilities/${s.facility_id}/services/${s.id}`);
    await serviceRef.set({ name: s.name, description: s.description ?? '', isActive: s.is_active, createdAt: s.created_at });
    for (const sch of schedules.filter((x) => x.service_id === s.id)) {
      await serviceRef.collection('schedules').doc(sch.id).set({
        dayOfWeek: sch.day_of_week,
        startTime: sch.start_time,
        durationMinutes: sch.duration_minutes,
        employeeId: sch.employee_id,
        capacity: sch.capacity,
        minReserveMinutes: sch.min_reserve_minutes,
        minCancelMinutes: sch.min_cancel_minutes,
        isActive: sch.is_active,
      });
    }
  }
}

importAll().then(() => console.log('Import completed')).catch(console.error);
```

---

## 9) Operational notes

- Use Firebase Admin SDK (service credentials) for any batch operations; it bypasses Rules (similar to Supabase service role).
- Prefer denormalizing permission keys into `members/{uid}` to make authorization checks fast and simple in Rules.
- Keep a clear strategy for multi-facility users. The mapping used here stores the role per facility in the membership doc.
- For auditability, consider enabling Firestore Change History (Cloud Logging) or write your own audit logs with Functions.

---

## 10) What changes in the frontend

- Replace Supabase client with Firebase JS SDK for Auth and Firestore.
- Query patterns:
  - List services of a facility: `collection(db, 'facilities', facilityId, 'services')` + `query(where('isActive','==',true))`.
  - List schedules by service: `collection(db, 'facilities', facilityId, 'services', serviceId, 'schedules')` + `query(where('dayOfWeek','==',dow))`.
- For any operation that needs a transaction or uniqueness check (role creation, schedule creation), call the corresponding Cloud Function rather than writing directly from the client.

---

With the structure, rules, and functions above, you achieve parity with the Supabase schema and RLS semantics while leveraging Firestore’s strengths. Adjust naming and paths as needed to match your app conventions.


