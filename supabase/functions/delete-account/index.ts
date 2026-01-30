import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const body = await req.json().catch(() => ({}));

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Invalid user' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const userId = userData.user.id;
  const reason = typeof body?.reason === 'string' ? body.reason : null;
  const detail = typeof body?.detail === 'string' ? body.detail : null;

  const tablesToDelete = [
    { table: 'readings', column: 'user_id' },
    { table: 'ai_interpretations', column: 'user_id' },
    { table: 'subscriptions', column: 'user_id' },
    { table: 'user_stats', column: 'user_id' },
    { table: 'profiles', column: 'id' }
  ];

  try {
    const { error: feedbackError } = await supabaseAdmin
      .from('account_deletion_feedback')
      .insert({
        user_id: userId,
        email: userData.user.email ?? null,
        reason,
        detail,
        created_at: new Date().toISOString()
      });

    if (feedbackError) {
      console.warn('Failed to save deletion feedback:', feedbackError.message);
    }
  } catch (error) {
    console.warn('Failed to save deletion feedback:', error);
  }

  await Promise.allSettled(
    tablesToDelete.map(({ table, column }) =>
      supabaseAdmin.from(table).delete().eq(column, userId)
    )
  );

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
