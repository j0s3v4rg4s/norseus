## Services — Implementation Plan

This plan translates the specification in `docs/services.md` into concrete steps. It is split into DB migrations, API/RPCs, frontend (routes, stores, components), and verification.

### Scope (Phase 1)
- Data model for `service` and `service_schedule` with constraints and indexes.
- UI to manage services and schedules (including batch schedule creation page).
- No bookings/payments yet. RLS policies are defined at high level and can be implemented in a follow‑up migration.

---

## 1) Database migrations (Supabase/Postgres)

Create a new migration under `supabase/migrations/` with a timestamp prefix. Include the following:

1. Enums
   - Create `day_of_week` with values: `mon, tue, wed, thu, fri, sat, sun` (create only if it does not exist).
   - Extend existing `sections` enum (permissions) to include `services` (idempotent):
     - Pseudo‑SQL to include in the migration:
       - `do $$ begin if not exists (select 1 from pg_type t join pg_enum e on t.oid=e.enumtypid where t.typname='sections' and e.enumlabel='services') then alter type sections add value 'services'; end if; end $$;`

2. Tables
   - `service`
     - `id uuid primary key default gen_random_uuid()`
     - `created_at timestamptz not null default now()`
     - `facility_id uuid not null references facility(id)`
     - `name text not null`
     - `description text null`
     - `is_active boolean not null default true`
   - `service_schedule`
     - `id uuid primary key default gen_random_uuid()`
     - `service_id uuid not null references service(id) on delete cascade`
     - `day_of_week day_of_week not null`
     - `start_time time not null`
     - `duration_minutes integer not null check (duration_minutes > 0)`
     - `employee_id uuid not null references profile(id)`
     - `capacity integer not null check (capacity > 0)`
     - `min_reserve_minutes integer not null default 0 check (min_reserve_minutes >= 0)`
     - `min_cancel_minutes integer not null default 0 check (min_cancel_minutes >= 0)`
     - `is_active boolean not null default true`

3. Constraints & indexes
   - Optional unique to avoid exact duplicates per service:
     - `unique (service_id, day_of_week, start_time)`
   - Indexes:
     - `create index on service(facility_id);`
     - `create index on service_schedule(service_id, day_of_week);`



---

## 2) RLS — Policies (planning before frontend)

Enable RLS and add policies per the high‑level section in `docs/services.md` (membership by `facility_user` + permissions `services:{read|create|edit|delete}`). This can ship in a dedicated migration right after tables are created.

1. Enable RLS on `service` and `service_schedule`.
2. Policies (see `docs/services.md` for high‑level rules):
   - SELECT: membership by `facility_user` through `facility_id` (for schedules, via parent `service`).
   - INSERT/UPDATE/DELETE: require membership + permission in `services` for the facility (`create`, `edit`, `delete`).
   - WITH CHECK:
     - `service`: ensure `facility_id` belongs to the user.
     - `service_schedule`: ensure `service_id` belongs to a facility the user belongs to and `employee_id` is a member of the same facility.

Testing notes:
- Validate positive/negative cases with an authenticated user tied to a facility and with/without the proper permissions.
- Keep a bypass path using the Supabase service key for initial data seeding if needed.

---

## 3) Frontend — Types and Supabase integration

Update `libs/front/supabase` to expose types and helpers for the new entities.

1. Types
   - Add to `libs/front/supabase/src/interfaces/types.ts` (or a new `services.types.ts`) the TS interfaces aligned with DB:
     - `DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'`
     - `Service { id, created_at, facility_id, name, description?, is_active }`
     - `ServiceSchedule { id, service_id, day_of_week: DayOfWeek, start_time: string, duration_minutes: number, employee_id: string, capacity: number, min_reserve_minutes: number, min_cancel_minutes: number, is_active: boolean }`
   - Export them via the package index.

2. Queries (Supabase client)
   - Service list by facility: `from('service').select('*').eq('facility_id', facilityId)`
   - Create service: `insert({...})` → returns id
   - Update service by id: `update({...}).eq('id', serviceId)`
   - Delete service by id: `delete().eq('id', serviceId)`
   - Schedules by service: `from('service_schedule').select('*').eq('service_id', serviceId)`
   - Batch insert schedules: prefer an RPC for transactional insert and duplicate filtering (see 3.1) otherwise multiple inserts client‑side.

---

## 4) Frontend — Routes and pages (Admin app)

Add a new lazy feature under `apps/admin/src/app/pages/services/` mirroring `users` and `permissions` structure.

1. Routes (`services.routes.ts`)
   - `''` → ServicesListComponent
   - `'create'` → ServicesCreateComponent
   - `':id/edit'` → ServicesEditComponent (tab “Schedules” with calendar)
   - `':id/schedules/create'` → SchedulesCreateComponent (batch page)
   - `':id/schedules/:scheduleId/edit'` → ScheduleEditComponent
   - Register in `app.routes.ts` under `/home/services` as a lazy child.

2. Components (standalone)
   - `services-list` (CdkTable)
   - `services-create` (form)
   - `services-edit` (form + tab Schedules with calendar)
   - `schedules-create` (wizard page)
   - `schedule-edit` (form)
   - Reusable subcomponents:
     - `service-form` (name, description, is_active)
     - `schedule-form` (day_of_week, start_time, duration_minutes, employee_id, capacity, min_reserve_minutes, min_cancel_minutes, is_active)
     - `schedules-calendar` (week view for the edit page)

3. Navigation & Menu
   - Add a `MenuItem` to `HomeComponent` menu: label “Servicios”, icon `event`, route `/home/services`.

4. Validation rules (UI)
   - Service: `name` required.
   - Schedules: enforce required fields; prevent duplicates `(day_of_week, start_time)` against currently loaded list and via RPC during batch creation.

---


## 5) Verification checklist

- DB migration applies cleanly on local Supabase; tables and indexes exist.
- RLS off for development (or service key) until policies are added in Phase 2.
- Admin app:
  - List services by facility.
  - Create service; redirect to `/:id/edit` and open Schedules tab.
  - Calendar shows existing schedules.
  - Batch create schedules page creates multiple entries, skipping duplicates.
  - Edit/Delete/Activate schedules and service work and persist.

---




