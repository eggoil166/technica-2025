import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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

async function getUserFromToken(admin: any, token: string | null) {
  if (!token || !admin) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error) return null;
  return data.user;
}

export async function POST(req: Request) {
  const admin = getAdminClient();
  if (!admin) {
    // eslint-disable-next-line no-console
    console.error('Supabase env vars missing');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // create a new API key for the authenticated user
  const body = await req.json().catch(() => ({}));
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || body?.access_token;

  const user = await getUserFromToken(admin, token || null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // eslint-disable-next-line no-console
  console.log('Creating API key for user:', user.id, user.email);

  // Ensure user exists in public users table (defensive check)
  const { data: upsertData, error: upsertError } = await admin
    .from('users')
    .upsert({ id: user.id, email: user.email }, { onConflict: 'id' })
    .select();

  if (upsertError) {
    // eslint-disable-next-line no-console
    console.error('Failed to ensure user exists - Error:', upsertError.message, upsertError.code);
    return NextResponse.json({ error: `Failed to ensure user record exists: ${upsertError.message}` }, { status: 500 });
  }

  // eslint-disable-next-line no-console
  console.log('User upsert successful:', upsertData);

  // generate plain key
  const plain = `sk_${crypto.randomBytes(32).toString('hex')}_${Date.now().toString(36)}`;

  // hash via pbkdf2 with salt
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, 100_000, 64, 'sha512').toString('hex');
  const key_hash = `${salt}$${hash}`;

  const { data, error } = await admin
    .from('api_keys')
    .insert([{ user_id: user.id, key_hash }])
    .select('id,usage_count,created_at')
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to insert API key - Error:', error.message, error.code, 'Details:', error);
    return NextResponse.json({ error: `Failed to create key: ${error.message}` }, { status: 500 });
  }

  // Return created row and the plain key so client can show it once
  return NextResponse.json({ key: plain, row: data });
}

export async function GET(req: Request) {
  const admin = getAdminClient();
  if (!admin) {
    // eslint-disable-next-line no-console
    console.error('Supabase env vars missing');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // list keys for user
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const user = await getUserFromToken(admin, token || null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await admin
    .from('api_keys')
    .select('id,usage_count,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
