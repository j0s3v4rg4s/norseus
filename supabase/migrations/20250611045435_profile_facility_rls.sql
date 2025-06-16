-- Policy to allow users to read facilities they belong to
CREATE POLICY "read facility if user belongs"
ON "public"."facility"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM facility_user
        WHERE facility_user.facility_id = facility.id
        AND facility_user.profile_id = auth.uid()
    )
);

-- Policy to allow users to view their own profile
CREATE POLICY "view their profile"
ON "public"."profile"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy to allow users to read their facility_user records
CREATE POLICY "user can read their facility_user"
ON "public"."facility_user"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (profile_id = auth.uid());
