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
    console.error('Supabase env vars missing');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || body?.access_token;

  const user = await getUserFromToken(admin, token || null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  console.log('Creating API key for user:', user.id);

  // Defensive: ensure the public `users` table has a row for this user id
  try {
    const { error: upsertError } = await admin
      .from('users')
      .upsert({ id: user.id, email: user.email ?? null }, { onConflict: 'id' });
    if (upsertError) {
      console.error('User upsert failed:', upsertError.message, upsertError);
      return NextResponse.json({ error: 'Failed to ensure user record exists' }, { status: 500 });
    }
  } catch (e: any) {
    console.error('User upsert exception:', e);
    return NextResponse.json({ error: 'Failed to ensure user record exists' }, { status: 500 });
  }

  // Get the provided key (now expecting hashed_key from frontend)
  const provided = body.hashed_key || (body && (body.key ?? body.plain ?? body.secret)) || null;
  if (!provided || typeof provided !== 'string') {
    return NextResponse.json({ error: 'Missing required key in request body' }, { status: 400 });
  }

  // SIMPLE SHA-256 HASHING (no salt, no PBKDF2)
  // If frontend sends hashed_key, use it directly
  // If frontend sends plain key, hash it here for consistency
  let key_hash: string;
  
  if (body.hashed_key) {
    // Frontend already sent the SHA-256 hash
    key_hash = provided;
  } else {
    // Frontend sent plain key - hash it with SHA-256
    const hash = crypto.createHash('sha256');
    hash.update(provided);
    key_hash = hash.digest('hex');
  }

  try {
    const { data, error } = await admin
      .from('api_keys')
      .insert([{ user_id: user.id, key_hash }])
      .select('id,usage_count,created_at')
      .single();

    if (error) {
      console.error('Insert api_keys failed:', error);
      const isFK = (error && (error.code === '23503' || error.message?.includes('foreign key')));
      return NextResponse.json({ error: isFK ? 'User record missing for user_id' : `Failed to create key: ${error.message}` }, { status: 500 });
    }

    // Return success (frontend already has the raw key)
    return NextResponse.json({ success: true, row: data });
  } catch (e: any) {
    console.error('Exception inserting api key:', e);
    return NextResponse.json({ error: 'Failed to create key' }, { status: 500 });
  }
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
