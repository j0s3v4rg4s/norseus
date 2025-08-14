create type "public"."day_of_week" as enum ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');

alter type "public"."sections" rename to "sections__old_version_to_be_dropped";

create type "public"."sections" as enum ('permissions', 'users', 'services');

create table "public"."service" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "facility_id" uuid not null,
    "name" text not null,
    "description" text,
    "is_active" boolean not null default true
);


alter table "public"."service" enable row level security;

create table "public"."service_schedule" (
    "id" uuid not null default gen_random_uuid(),
    "service_id" uuid not null,
    "day_of_week" day_of_week not null,
    "start_time" time without time zone not null,
    "duration_minutes" integer not null,
    "employee_id" uuid not null,
    "capacity" integer not null,
    "min_reserve_minutes" integer not null default 0,
    "min_cancel_minutes" integer not null default 0,
    "is_active" boolean not null default true
);


alter table "public"."service_schedule" enable row level security;

alter table "public"."permissions" alter column section type "public"."sections" using section::text::"public"."sections";

drop type "public"."sections__old_version_to_be_dropped";

CREATE INDEX service_facility_id_idx ON public.service USING btree (facility_id);

CREATE UNIQUE INDEX service_pkey ON public.service USING btree (id);

CREATE UNIQUE INDEX service_schedule_pkey ON public.service_schedule USING btree (id);

CREATE INDEX service_schedule_service_id_day_of_week_idx ON public.service_schedule USING btree (service_id, day_of_week);

CREATE UNIQUE INDEX unique_service_schedule_per_service_dow_start ON public.service_schedule USING btree (service_id, day_of_week, start_time);

alter table "public"."service" add constraint "service_pkey" PRIMARY KEY using index "service_pkey";

alter table "public"."service_schedule" add constraint "service_schedule_pkey" PRIMARY KEY using index "service_schedule_pkey";

alter table "public"."service" add constraint "service_facility_id_fkey" FOREIGN KEY (facility_id) REFERENCES facility(id) not valid;

alter table "public"."service" validate constraint "service_facility_id_fkey";

alter table "public"."service_schedule" add constraint "service_schedule_capacity_check" CHECK ((capacity > 0)) not valid;

alter table "public"."service_schedule" validate constraint "service_schedule_capacity_check";

alter table "public"."service_schedule" add constraint "service_schedule_duration_minutes_check" CHECK ((duration_minutes > 0)) not valid;

alter table "public"."service_schedule" validate constraint "service_schedule_duration_minutes_check";

alter table "public"."service_schedule" add constraint "service_schedule_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES profile(id) not valid;

alter table "public"."service_schedule" validate constraint "service_schedule_employee_id_fkey";

alter table "public"."service_schedule" add constraint "service_schedule_min_cancel_minutes_check" CHECK ((min_cancel_minutes >= 0)) not valid;

alter table "public"."service_schedule" validate constraint "service_schedule_min_cancel_minutes_check";

alter table "public"."service_schedule" add constraint "service_schedule_min_reserve_minutes_check" CHECK ((min_reserve_minutes >= 0)) not valid;

alter table "public"."service_schedule" validate constraint "service_schedule_min_reserve_minutes_check";

alter table "public"."service_schedule" add constraint "service_schedule_service_id_fkey" FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE not valid;

alter table "public"."service_schedule" validate constraint "service_schedule_service_id_fkey";

alter table "public"."service_schedule" add constraint "unique_service_schedule_per_service_dow_start" UNIQUE using index "unique_service_schedule_per_service_dow_start";

grant delete on table "public"."service" to "anon";

grant insert on table "public"."service" to "anon";

grant references on table "public"."service" to "anon";

grant select on table "public"."service" to "anon";

grant trigger on table "public"."service" to "anon";

grant truncate on table "public"."service" to "anon";

grant update on table "public"."service" to "anon";

grant delete on table "public"."service" to "authenticated";

grant insert on table "public"."service" to "authenticated";

grant references on table "public"."service" to "authenticated";

grant select on table "public"."service" to "authenticated";

grant trigger on table "public"."service" to "authenticated";

grant truncate on table "public"."service" to "authenticated";

grant update on table "public"."service" to "authenticated";

grant delete on table "public"."service" to "service_role";

grant insert on table "public"."service" to "service_role";

grant references on table "public"."service" to "service_role";

grant select on table "public"."service" to "service_role";

grant trigger on table "public"."service" to "service_role";

grant truncate on table "public"."service" to "service_role";

grant update on table "public"."service" to "service_role";

grant delete on table "public"."service_schedule" to "anon";

grant insert on table "public"."service_schedule" to "anon";

grant references on table "public"."service_schedule" to "anon";

grant select on table "public"."service_schedule" to "anon";

grant trigger on table "public"."service_schedule" to "anon";

grant truncate on table "public"."service_schedule" to "anon";

grant update on table "public"."service_schedule" to "anon";

grant delete on table "public"."service_schedule" to "authenticated";

grant insert on table "public"."service_schedule" to "authenticated";

grant references on table "public"."service_schedule" to "authenticated";

grant select on table "public"."service_schedule" to "authenticated";

grant trigger on table "public"."service_schedule" to "authenticated";

grant truncate on table "public"."service_schedule" to "authenticated";

grant update on table "public"."service_schedule" to "authenticated";

grant delete on table "public"."service_schedule" to "service_role";

grant insert on table "public"."service_schedule" to "service_role";

grant references on table "public"."service_schedule" to "service_role";

grant select on table "public"."service_schedule" to "service_role";

grant trigger on table "public"."service_schedule" to "service_role";

grant truncate on table "public"."service_schedule" to "service_role";

grant update on table "public"."service_schedule" to "service_role";


