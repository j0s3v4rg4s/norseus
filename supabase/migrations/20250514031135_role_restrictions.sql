create policy "edit only admin"
on "public"."role"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM (profile p
     JOIN role r ON ((p.id_role = r.id)))
  WHERE ((p.id = auth.uid()) AND (r.name = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM (profile p
     JOIN role r ON ((p.id_role = r.id)))
  WHERE ((p.id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "prevent remove admin"
on "public"."role"
as restrictive
for delete
to authenticated, anon
using ((name <> 'admin'::text));



