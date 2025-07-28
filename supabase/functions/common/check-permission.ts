import { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export async function hasPermission(
  supabase: SupabaseClient,
  section: string,
  action: string,
  corsHeaders: Record<string, string>,

): Promise<boolean> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Response(
      JSON.stringify({
        statusCode: 401,
        error: { message: 'Invalid auth token' },
        data: null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  const { data: callingProfile, error: callingProfileError } = await supabase
    .from('profile')
    .select('role_id')
    .eq('id', user.id)
    .single();

  if (callingProfileError || !callingProfile) {
    throw new Response(
      JSON.stringify({
        statusCode: 404,
        error: { message: `User profile for calling user ${user.id} not found.` },
        data: null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  const userRoleId = callingProfile.role_id;
  if (!userRoleId) {
    throw new Response(
      JSON.stringify({
        statusCode: 403,
        error: { message: 'Calling user does not have a role assigned.' },
        data: null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  const { count, error: permissionError } = await supabase
    .from('permissions')
    .select('*', { count: 'exact', head: true })
    .eq('role_id', userRoleId)
    .eq('section', section)
    .eq('action', action);

  if (permissionError) {
    throw permissionError;
  }

  return count !== null && count > 0;
}
