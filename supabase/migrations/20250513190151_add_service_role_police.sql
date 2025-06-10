create policy "service_role access"
on "public"."role"
as permissive
for all
to service_role
using (true)
with check (true);

