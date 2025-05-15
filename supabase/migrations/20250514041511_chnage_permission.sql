revoke delete on table "public"."role_permissions" from "anon";

revoke insert on table "public"."role_permissions" from "anon";

revoke references on table "public"."role_permissions" from "anon";

revoke select on table "public"."role_permissions" from "anon";

revoke trigger on table "public"."role_permissions" from "anon";

revoke truncate on table "public"."role_permissions" from "anon";

revoke update on table "public"."role_permissions" from "anon";

revoke delete on table "public"."role_permissions" from "authenticated";

revoke insert on table "public"."role_permissions" from "authenticated";

revoke references on table "public"."role_permissions" from "authenticated";

revoke select on table "public"."role_permissions" from "authenticated";

revoke trigger on table "public"."role_permissions" from "authenticated";

revoke truncate on table "public"."role_permissions" from "authenticated";

revoke update on table "public"."role_permissions" from "authenticated";

revoke delete on table "public"."role_permissions" from "service_role";

revoke insert on table "public"."role_permissions" from "service_role";

revoke references on table "public"."role_permissions" from "service_role";

revoke select on table "public"."role_permissions" from "service_role";

revoke trigger on table "public"."role_permissions" from "service_role";

revoke truncate on table "public"."role_permissions" from "service_role";

revoke update on table "public"."role_permissions" from "service_role";

alter table "public"."role_permissions" drop constraint "role_permissions_id_permission_fkey";

alter table "public"."role_permissions" drop constraint "role_permissions_id_role_fkey";

alter table "public"."role_permissions" drop constraint "role_permissions_pkey";

drop index if exists "public"."role_permissions_pkey";

drop table "public"."role_permissions";

alter table "public"."permissions" drop column "category";

alter table "public"."permissions" drop column "name";

alter table "public"."permissions" add column "action" permission_action not null;

alter table "public"."permissions" add column "role" uuid;

alter table "public"."permissions" add column "section" sections not null;

alter table "public"."permissions" add constraint "permissions_role_fkey" FOREIGN KEY (role) REFERENCES role(id) ON DELETE CASCADE not valid;

alter table "public"."permissions" validate constraint "permissions_role_fkey";

insert into public.permissions (role, section, action)
select r.id, b.section, a.action
from public.role r,
     unnest(enum_range(NULL::permission_action)) AS a(action),
     unnest(enum_range(NULL::sections)) AS b(section)
where r.name = 'admin'
