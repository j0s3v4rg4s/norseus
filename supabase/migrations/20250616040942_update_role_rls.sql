drop policy "edit only admin" on "public"."role";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_role_with_permissions(role_name text, permissions jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
  new_role_id uuid;
begin
  insert into role (name) values (role_name) returning id into new_role_id;

  insert into permissions (action, section, role_id)
  select
    (p->>'action')::permission_action,   -- Cast correcto aquí
    (p->>'section')::sections,           -- Cast correcto aquí
    new_role_id
  from jsonb_array_elements(permissions) as p;

end;
$function$
;

create policy "Enable read access for all users"
on "public"."permissions"
as permissive
for select
to authenticated
using (true);


create policy "create permission"
on "public"."permissions"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM profile p
  WHERE ((p.id = auth.uid()) AND (p.role_id IS NOT NULL) AND (( SELECT r.name
           FROM role r
          WHERE (r.id = p.role_id)) = 'admin'::text)))));


create policy "delete permission only admin"
on "public"."permissions"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM profile p
  WHERE ((p.id = auth.uid()) AND (p.role_id IS NOT NULL) AND (( SELECT r.name
           FROM role r
          WHERE (r.id = p.role_id)) = 'admin'::text)))));


create policy "edit permission only admin"
on "public"."permissions"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM profile p
  WHERE ((p.id = auth.uid()) AND (p.role_id IS NOT NULL) AND (( SELECT r.name
           FROM role r
          WHERE (r.id = p.role_id)) = 'admin'::text)))));


create policy "Enable read access for all users"
on "public"."role"
as permissive
for select
to authenticated
using (true);


create policy "create only admin"
on "public"."role"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM profile p
  WHERE ((p.id = auth.uid()) AND (p.role_id IS NOT NULL) AND (( SELECT r.name
           FROM role r
          WHERE (r.id = p.role_id)) = 'admin'::text)))));


create policy "delete only admin"
on "public"."role"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM profile p
  WHERE ((p.id = auth.uid()) AND (p.role_id IS NOT NULL) AND (( SELECT r.name
           FROM role r
          WHERE (r.id = p.role_id)) = 'admin'::text)))));


create policy "edit only admin"
on "public"."role"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM profile p
  WHERE ((p.id = auth.uid()) AND (p.role_id IS NOT NULL) AND (( SELECT r.name
           FROM role r
          WHERE (r.id = p.role_id)) = 'admin'::text)))));



