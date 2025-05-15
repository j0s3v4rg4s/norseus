create table "public"."role_permissions" (
    "id_role" uuid not null,
    "id_permission" bigint not null
);


alter table "public"."role_permissions" enable row level security;

CREATE UNIQUE INDEX role_permissions_pkey ON public.role_permissions USING btree (id_role, id_permission);

alter table "public"."role_permissions" add constraint "role_permissions_pkey" PRIMARY KEY using index "role_permissions_pkey";

alter table "public"."role_permissions" add constraint "role_permissions_id_permission_fkey" FOREIGN KEY (id_permission) REFERENCES permissions(id) ON DELETE CASCADE not valid;

alter table "public"."role_permissions" validate constraint "role_permissions_id_permission_fkey";

alter table "public"."role_permissions" add constraint "role_permissions_id_role_fkey" FOREIGN KEY (id_role) REFERENCES role(id) ON DELETE CASCADE not valid;

alter table "public"."role_permissions" validate constraint "role_permissions_id_role_fkey";

grant delete on table "public"."role_permissions" to "anon";

grant insert on table "public"."role_permissions" to "anon";

grant references on table "public"."role_permissions" to "anon";

grant select on table "public"."role_permissions" to "anon";

grant trigger on table "public"."role_permissions" to "anon";

grant truncate on table "public"."role_permissions" to "anon";

grant update on table "public"."role_permissions" to "anon";

grant delete on table "public"."role_permissions" to "authenticated";

grant insert on table "public"."role_permissions" to "authenticated";

grant references on table "public"."role_permissions" to "authenticated";

grant select on table "public"."role_permissions" to "authenticated";

grant trigger on table "public"."role_permissions" to "authenticated";

grant truncate on table "public"."role_permissions" to "authenticated";

grant update on table "public"."role_permissions" to "authenticated";

grant delete on table "public"."role_permissions" to "service_role";

grant insert on table "public"."role_permissions" to "service_role";

grant references on table "public"."role_permissions" to "service_role";

grant select on table "public"."role_permissions" to "service_role";

grant trigger on table "public"."role_permissions" to "service_role";

grant truncate on table "public"."role_permissions" to "service_role";

grant update on table "public"."role_permissions" to "service_role";


