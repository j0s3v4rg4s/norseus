set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_role_with_permissions(role_id uuid, new_role_name text, new_permissions jsonb, permissions_to_delete integer[])
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update the role name
  UPDATE role
  SET name = new_role_name
  WHERE id = role_id;

  -- Delete permissions by id
  DELETE FROM permissions
  WHERE id = ANY(permissions_to_delete);

  -- Insert new permissions
  INSERT INTO permissions (action, section, role_id)
  SELECT
    (p->>'action')::permission_action,
    (p->>'section')::sections,
    role_id
  FROM jsonb_array_elements(new_permissions) AS p;
END;
$function$
;


