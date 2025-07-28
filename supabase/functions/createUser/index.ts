// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { hasPermission } from '../common/check-permission.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string,
      {
        global: { headers: { Authorization: req.headers.get('Authorization') as string } },
      },
    );
    const supabaseAdmin: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string,
    );

    const allowed = await hasPermission(supabase, 'users', 'create', corsHeaders);
    if (!allowed) {
      return new Response(
        JSON.stringify({
          statusCode: 403,
          error: { message: 'You do not have permission to create users.' },
          data: null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { email, name, roleId, type } = await req.json();

    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from('profile')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfileError) {
      throw existingProfileError;
    }

    if (existingProfile) {
      return new Response(
        JSON.stringify({
          statusCode: 409,
          error: { message: `User with email ${email} already exists.` },
          data: null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { data: userData, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'http://localhost:4200/verify',
    });
    if (error) {
      throw error;
    }

    const { error: profileError } = await supabaseAdmin.from('profile').insert({
      id: userData.user.id,
      name,
      role_id: roleId,
      type,
      email,
    });

    if (profileError) {
      throw profileError;
    }

    return new Response(
      JSON.stringify({
        statusCode: 200,
        data: { message: 'User created successfully', user: userData },
        error: null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return new Response(
      JSON.stringify({
        statusCode: 500,
        error,
        data: null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
