# Services — Feature Specification

This document describes the new “Services” functionality for the admin app. A service represents something users can book at a facility (e.g., classes, therapy sessions). We start with the data model to enable creation and management of services and their weekly schedules. Bookings and permissions will be added later.

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

## Solution: Database Design (MVP)

Scope: Only entities for services and their weekly schedules with per-schedule rules. No bookings yet. Permissions/RLS will be defined later.

### Enums

- **day_of_week**: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`

### Tables

- **service**
  - Columns: `id uuid PK default gen_random_uuid()`, `created_at timestamptz default now()`, `facility_id uuid not null` (FK → `facility(id)`), `name text not null`, `description text`, `is_active boolean not null default true`

- **service_schedule**
  - Columns:
    - `id uuid PK default gen_random_uuid()`
    - `service_id uuid not null` (FK → `service(id)` on delete cascade)
    - `day_of_week day_of_week not null`
    - `start_time time not null`
    - `duration_minutes integer not null check (duration_minutes > 0)`
    - `employee_id uuid not null` (FK → `profile(id)`) — encargado del horario
    - `capacity integer not null check (capacity > 0)`
    - `min_reserve_minutes integer not null default 0 check (min_reserve_minutes >= 0)`
    - `min_cancel_minutes integer not null default 0 check (min_cancel_minutes >= 0)`
    - `is_active boolean not null default true`

### Relationships

- `service(facility_id)` → `facility(id)` (N–1)
- `service_schedule(service_id)` → `service(id)` (N–1, cascade on delete)
- `service_schedule(employee_id)` → `profile(id)` (N–1)

### Recommended Constraints & Indexes

- `service_schedule`: optional unique to avoid exact duplicate weekly schedules
  - `unique (service_id, day_of_week, start_time)`
- Common indexes for filtering:
  - `index service_schedule(service_id, day_of_week)`
  - `index service(facility_id)`


---

## Future: RLS policies (high‑level requirements)

The goal is to guarantee tenant isolation by facility and least‑privilege access. RLS will be enabled on `service` and `service_schedule` and will enforce two layers: membership and permissions.

- General
  - Enable RLS on both tables.
  - Tenant = `facility`. Every row in `service` is bound to a facility via `facility_id`. Rows in `service_schedule` inherit the facility via their parent `service`.
  - Membership is determined by `facility_user (facility_id, profile_id)`.
  - Authorization is determined by the existing roles/permissions model: `permissions(section='services', action in {read, create, edit, delete})` tied to the user’s role under the same facility.
  - The backend `service_role` (Supabase service key) bypasses RLS for RPCs and background jobs.

- Read access (SELECT)
  - A user can read `service` if they belong to the service’s facility.
  - A user can read `service_schedule` if they belong to the facility of the parent `service`.
  - Business flags such as `is_active` are not enforced via RLS; they are handled by application logic (e.g., do not show inactive items to end users).

- Write access (INSERT/UPDATE/DELETE)
  - Always requires membership to the facility AND proper permission in the `services` section.
  - `service`:
    - INSERT/UPDATE/DELETE require `services:create|edit|delete` respectively.
    - WITH CHECK must ensure the `facility_id` of the row matches a facility the user belongs to (prevents cross‑facility writes).
  - `service_schedule`:
    - INSERT/UPDATE/DELETE require `services:create|edit|delete` (create or edit for insert; edit for update; delete for delete) for the facility resolved through the parent `service`.
    - WITH CHECK must ensure: (1) the referenced `service_id` belongs to a facility the user belongs to; (2) `employee_id` assigned is a member of the same facility (exists in `facility_user`). This avoids schedules pointing to staff in other facilities.

- Integrity and consistency enforced by RLS
  - No cross‑facility references can be created or updated.
  - Only members with the right permission can mutate data; members without permission can still read (if you decide to restrict read further, require `services:read`).
  - The system remains compatible with global/admin roles (where `role.facility_id is null`) if the permission checks allow it for any facility.


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

### Pages and components
- `services-list` (CdkTable)
  - Columns: name, is_active, schedules_count, actions (view/edit, activate/deactivate, delete)
- `services-create` / `services-edit`
  - `service-form` subcomponent: name, description, is_active
  - Tab “Schedules” dentro de `services-edit`:
    - Vista calendario (semana) con los horarios del servicio
    - CTA “Create schedules” → navega a `/home/services/:id/schedules/create`
- `schedules-create` (wizard — batch; página propia en `/home/services/:id/schedules/create`)
  - Paso 1: seleccionar días de la semana (multi‑select) y uno o más time slots (start_time + duration_minutes)
  - Paso 2: seleccionar empleado (MVP: 1 empleado)
  - Paso 3: reglas comunes del lote: capacity, min_reserve_minutes, min_cancel_minutes, is_active
  - Confirmar: crea N horarios asociados al servicio
- `schedule-edit` (pagina propia en `/home/services/:id/schedules/:scheduleId/edit`)
  - Mismos campos del wizard pero para un único horario

### Reuse of existing UI library
- Use `ui-layout`, `ui-button`, `ui-select`, `ConfirmComponent`, and CdkTable to stay consistent with `users` and `permissions` features.
