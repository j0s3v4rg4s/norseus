-- =============================
-- Supabase DB Seed
-- =============================
-- Create function to create a user in auth and return its id
CREATE OR REPLACE FUNCTION public.create_user(email text, password text)
RETURNS uuid AS $$
DECLARE
  user_id uuid;
  encrypted_pw text;
BEGIN
  user_id := gen_random_uuid();
  encrypted_pw := crypt(password, gen_salt('bf', 12));
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, recovery_sent_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', email, encrypted_pw,
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', ''
  );
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), user_id, user_id,
    format('{"sub":"%s","email":"%s"}', user_id::text, email)::jsonb,
    'email', now(), now(), now()
  );
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================
-- Insert sample data
-- =============================
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Create user in auth and get its id
  admin_user_id := public.create_user('admin@test.com', '123456');

  -- Facility
  INSERT INTO facility (id, created_at, name, logo)
  VALUES ('e4913753-f2ea-4590-b1b0-cc8faba2b375', now(), 'Test Facility', NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Role
  INSERT INTO role (id, created_at, name, description, facility_id)
  VALUES ('64f8b3a4-ccd3-4ce1-9788-1de2fcfb5017', now(), 'admin', 'admin role', 'e4913753-f2ea-4590-b1b0-cc8faba2b375')
  ON CONFLICT (id) DO NOTHING;

  -- Permissions
  INSERT INTO permissions (created_at, action, role_id, section)
  VALUES
    (now(), 'read', '64f8b3a4-ccd3-4ce1-9788-1de2fcfb5017', 'permissions'),
    (now(), 'read', '64f8b3a4-ccd3-4ce1-9788-1de2fcfb5017', 'users'),
    (now(), 'edit', '64f8b3a4-ccd3-4ce1-9788-1de2fcfb5017', 'permissions'),
    (now(), 'edit', '64f8b3a4-ccd3-4ce1-9788-1de2fcfb5017', 'users'),
    (now(), 'delete', '64f8b3a4-ccd3-4ce1-9788-1de2fcfb5017', 'permissions'),
    (now(), 'delete', '64f8b3a4-ccd3-4ce1-9788-1de2fcfb5017', 'users'),
    (now(), 'create', '64f8b3a4-ccd3-4ce1-9788-1de2fcfb5017', 'permissions'),
    (now(), 'create', '64f8b3a4-ccd3-4ce1-9788-1de2fcfb5017', 'users');

  -- Profile
  INSERT INTO profile (id, created_at, name, role_id)
  VALUES (admin_user_id, now(), 'Admin User', '64f8b3a4-ccd3-4ce1-9788-1de2fcfb5017')
  ON CONFLICT (id) DO NOTHING;

  -- Facility User
  INSERT INTO facility_user (facility_id, profile_id, joined)
  VALUES ('e4913753-f2ea-4590-b1b0-cc8faba2b375', admin_user_id, now())
  ON CONFLICT (facility_id, profile_id) DO NOTHING;


END $$;

-- Drop the create_user function after seeding
DROP FUNCTION IF EXISTS public.create_user(text, text);

-- =============================
-- End of seed
-- =============================
