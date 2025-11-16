import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  const admin = getAdminClient();
  if (!admin) {
    // eslint-disable-next-line no-console
    console.error('Supabase env vars missing');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const { user_id, email } = body;

  if (!user_id || !email) {
    return NextResponse.json({ error: 'Missing user_id or email' }, { status: 400 });
  }

  // Create or update user in public users table
  const { data, error } = await admin
    .from('users')
    .upsert({ id: user_id, email }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to upsert user:', error.message);
    return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
  }

  return NextResponse.json({ data });
}
