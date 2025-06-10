drop policy "edit only admin" on "public"."role";

alter table "public"."permissions" drop constraint "permissions_role_fkey";

alter table "public"."profile" drop constraint "profile_id_role_fkey";

create table "public"."facility" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "logo" character varying
);


alter table "public"."facility" enable row level security;

create table "public"."facility_user" (
    "facility_id" uuid not null,
    "profile_id" uuid,
    "joined" timestamp with time zone not null default now()
);


alter table "public"."facility_user" enable row level security;

alter table "public"."permissions" drop column "role";

alter table "public"."permissions" add column "role_id" uuid;

alter table "public"."profile" drop column "id_role";

alter table "public"."profile" add column "role_id" uuid;

alter table "public"."role" add column "facility_id" uuid;

CREATE UNIQUE INDEX facility_pkey ON public.facility USING btree (id);

CREATE UNIQUE INDEX facility_user_pkey ON public.facility_user USING btree (facility_id);

CREATE UNIQUE INDEX unique_facility_role_name ON public.role USING btree (facility_id, name);

alter table "public"."facility" add constraint "facility_pkey" PRIMARY KEY using index "facility_pkey";

alter table "public"."facility_user" add constraint "facility_user_pkey" PRIMARY KEY using index "facility_user_pkey";

alter table "public"."facility_user" add constraint "facility_user_facility_id_fkey" FOREIGN KEY (facility_id) REFERENCES facility(id) ON DELETE CASCADE not valid;

alter table "public"."facility_user" validate constraint "facility_user_facility_id_fkey";

alter table "public"."facility_user" add constraint "facility_user_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE not valid;

alter table "public"."facility_user" validate constraint "facility_user_profile_id_fkey";

alter table "public"."role" add constraint "role_facility_id_fkey" FOREIGN KEY (facility_id) REFERENCES facility(id) not valid;

alter table "public"."role" validate constraint "role_facility_id_fkey";

alter table "public"."role" add constraint "unique_facility_role_name" UNIQUE using index "unique_facility_role_name";

alter table "public"."permissions" add constraint "permissions_role_fkey" FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE not valid;

alter table "public"."permissions" validate constraint "permissions_role_fkey";

alter table "public"."profile" add constraint "profile_id_role_fkey" FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE SET NULL not valid;

alter table "public"."profile" validate constraint "profile_id_role_fkey";

grant delete on table "public"."facility" to "anon";

grant insert on table "public"."facility" to "anon";

grant references on table "public"."facility" to "anon";

grant select on table "public"."facility" to "anon";

grant trigger on table "public"."facility" to "anon";

grant truncate on table "public"."facility" to "anon";

grant update on table "public"."facility" to "anon";

grant delete on table "public"."facility" to "authenticated";

grant insert on table "public"."facility" to "authenticated";

grant references on table "public"."facility" to "authenticated";

grant select on table "public"."facility" to "authenticated";

grant trigger on table "public"."facility" to "authenticated";

grant truncate on table "public"."facility" to "authenticated";

grant update on table "public"."facility" to "authenticated";

grant delete on table "public"."facility" to "service_role";

grant insert on table "public"."facility" to "service_role";

grant references on table "public"."facility" to "service_role";

grant select on table "public"."facility" to "service_role";

grant trigger on table "public"."facility" to "service_role";

grant truncate on table "public"."facility" to "service_role";

grant update on table "public"."facility" to "service_role";

grant delete on table "public"."facility_user" to "anon";

grant insert on table "public"."facility_user" to "anon";

grant references on table "public"."facility_user" to "anon";

grant select on table "public"."facility_user" to "anon";

grant trigger on table "public"."facility_user" to "anon";

grant truncate on table "public"."facility_user" to "anon";

grant update on table "public"."facility_user" to "anon";

grant delete on table "public"."facility_user" to "authenticated";

grant insert on table "public"."facility_user" to "authenticated";

grant references on table "public"."facility_user" to "authenticated";

grant select on table "public"."facility_user" to "authenticated";

grant trigger on table "public"."facility_user" to "authenticated";

grant truncate on table "public"."facility_user" to "authenticated";

grant update on table "public"."facility_user" to "authenticated";

grant delete on table "public"."facility_user" to "service_role";

grant insert on table "public"."facility_user" to "service_role";

grant references on table "public"."facility_user" to "service_role";

grant select on table "public"."facility_user" to "service_role";

grant trigger on table "public"."facility_user" to "service_role";

grant truncate on table "public"."facility_user" to "service_role";

grant update on table "public"."facility_user" to "service_role";

create policy "edit only admin"
on "public"."role"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM (profile p
     JOIN role r ON ((p.role_id = r.id)))
  WHERE ((p.id = auth.uid()) AND (r.name = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM (profile p
     JOIN role r ON ((p.role_id = r.id)))
  WHERE ((p.id = auth.uid()) AND (r.name = 'admin'::text)))));


alter table "public"."facility_user" drop constraint "facility_user_pkey";

drop index if exists "public"."facility_user_pkey";

alter table "public"."facility_user" alter column "profile_id" set not null;

CREATE UNIQUE INDEX facility_user_pkey ON public.facility_user USING btree (facility_id, profile_id);

alter table "public"."facility_user" add constraint "facility_user_pkey" PRIMARY KEY using index "facility_user_pkey";


