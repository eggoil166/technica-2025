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

async function getUserFromToken(admin: any, token: string | null) {
  if (!token || !admin) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error) return null;
  return data.user;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminClient();
  if (!admin) {
    // eslint-disable-next-line no-console
    console.error('Supabase env vars missing');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const user = await getUserFromToken(admin, token || null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const keyId = id;

  // verify ownership
  const { data: keyRow, error: kerr } = await admin.from('api_keys').select('user_id').eq('id', keyId).single();
  if (kerr) return NextResponse.json({ error: kerr.message }, { status: 500 });
  if (!keyRow || keyRow.user_id !== user.id) return NextResponse.json({ error: 'Not allowed' }, { status: 403 });

  // basic stats: count from api_usage table
  const { count, error } = await admin.from('api_usage').select('id', { count: 'exact' }).eq('api_key_id', keyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const lastRes = await admin.from('api_usage').select('created_at').eq('api_key_id', keyId).order('created_at', { ascending: false }).limit(1).single();

  return NextResponse.json({ usage_count: count ?? 0, last_used_at: lastRes.data?.created_at ?? null });
}
